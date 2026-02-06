import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import auth from "../middleware/auth.js";
import { sendEmail } from "../utils/sendEmail.js";

const router = express.Router();

const signToken = (userId) => {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET || "dev-secret", {
    expiresIn: "7d"
  });
};

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 30 * 1000;

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOtpEmail = async (email, otp, context) => {
  const subject = `ParkPing ${context} OTP`;
  const text = `Your ParkPing OTP is ${otp}. It expires in 5 minutes.`;

  await sendEmail({
    to: email,
    subject,
    text,
    html: `<p>Your ParkPing OTP is <strong>${otp}</strong>.</p><p>It expires in 5 minutes.</p>`
  });
};

router.post("/signup", async (req, res) => {
  const { name, phone, email, password } = req.body;
  if (!name || !phone || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const existing = await User.findOne({ email });
  if (existing && existing.isVerified) {
    return res.status(409).json({ message: "Email already registered" });
  }

  if (existing?.signupOtpSentAt && Date.now() - existing.signupOtpSentAt < OTP_RESEND_COOLDOWN_MS) {
    return res.status(429).json({ message: "Please wait before requesting a new OTP." });
  }

  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);
  const otpExpiry = Date.now() + OTP_EXPIRY_MS;
  const passwordHash = await bcrypt.hash(password, 10);

  let user = existing;
  if (user) {
    user.name = name;
    user.phone = phone;
    user.passwordHash = passwordHash;
    user.signupOtpHash = otpHash;
    user.signupOtpExpiry = otpExpiry;
    user.signupOtpSentAt = Date.now();
    user.isVerified = false;
    await user.save();
  } else {
    user = await User.create({
      name,
      phone,
      email,
      passwordHash,
      isVerified: false,
      signupOtpHash: otpHash,
      signupOtpExpiry: otpExpiry,
      signupOtpSentAt: Date.now()
    });
  }

  try {
    await sendOtpEmail(email, otp, "Signup");
  } catch (error) {
    return res.status(500).json({ message: "OTP send failed. Please check email credentials." });
  }

  return res.status(201).json({
    message: "OTP sent to email",
    needsVerification: true,
    email
  });
});

router.post("/verify-signup-otp", async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  const user = await User.findOne({ email });
  if (!user || !user.signupOtpHash || !user.signupOtpExpiry) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  if (Date.now() > user.signupOtpExpiry) {
    return res.status(400).json({ message: "OTP expired" });
  }

  const validOtp = await bcrypt.compare(otp, user.signupOtpHash);
  if (!validOtp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  user.isVerified = true;
  user.signupOtpHash = undefined;
  user.signupOtpExpiry = undefined;
  user.signupOtpSentAt = undefined;
  await user.save();

  const token = signToken(user._id);
  return res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, phone: user.phone }
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (!user.isVerified) {
    return res.status(403).json({ message: "Please verify your email OTP" });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = signToken(user._id);
  return res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, phone: user.phone }
  });
});

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user.id).select("name email phone");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json({ user });
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ message: "If email exists, an OTP will be sent" });
  }

  if (user.resetOtpSentAt && Date.now() - user.resetOtpSentAt < OTP_RESEND_COOLDOWN_MS) {
    return res.status(429).json({ message: "Please wait before requesting a new OTP." });
  }

  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);
  const otpExpiry = Date.now() + OTP_EXPIRY_MS;

  user.resetOtpHash = otpHash;
  user.resetOtpExpiry = otpExpiry;
  user.resetOtpSentAt = Date.now();
  await user.save();

  try {
    await sendOtpEmail(email, otp, "Password Reset");
  } catch (error) {
    return res.status(500).json({ message: "OTP send failed. Please check email credentials." });
  }

  return res.json({
    message: "OTP sent to email"
  });
});

router.post("/reset-password", async (req, res) => {
  const { otp, password, email } = req.body;

  if (!otp || !password || !email) {
    return res.status(400).json({ message: "OTP, email and password are required" });
  }

  const user = await User.findOne({ email });
  if (!user || !user.resetOtpHash || !user.resetOtpExpiry) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  if (Date.now() > user.resetOtpExpiry) {
    return res.status(400).json({ message: "OTP expired" });
  }

  const validOtp = await bcrypt.compare(otp, user.resetOtpHash);
  if (!validOtp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  user.passwordHash = await bcrypt.hash(password, 10);
  user.resetOtpHash = undefined;
  user.resetOtpExpiry = undefined;
  user.resetOtpSentAt = undefined;
  await user.save();

  return res.json({ message: "Password reset successful" });
});

router.post("/change-password", auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Current and new password are required" });
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const match = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!match) {
    return res.status(401).json({ message: "Current password is incorrect" });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();

  return res.json({ message: "Password changed successfully" });
});

export default router;
