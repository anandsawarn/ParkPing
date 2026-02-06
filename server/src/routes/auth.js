import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = express.Router();

const signToken = (userId) => {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET || "dev-secret", {
    expiresIn: "7d"
  });
};

router.post("/signup", async (req, res) => {
  const { name, phone, email, password } = req.body;
  if (!name || !phone || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, phone, email, passwordHash });
  const token = signToken(user._id);

  return res.status(201).json({
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
    return res.json({ message: "If email exists, reset link will be sent" });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenHash = await bcrypt.hash(resetToken, 10);
  const resetExpiry = Date.now() + 3600000;

  user.resetToken = resetTokenHash;
  user.resetExpiry = resetExpiry;
  await user.save();

  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const resetLink = `${clientUrl}/reset-password?token=${resetToken}&email=${email}`;

  console.log(`Password reset link: ${resetLink}`);

  return res.json({
    message: "Password reset link sent (check console in dev mode)",
    resetLink
  });
});

router.post("/reset-password", async (req, res) => {
  const { token, password, email } = req.body;

  if (!token || !password || !email) {
    return res.status(400).json({ message: "Token, email and password are required" });
  }

  const user = await User.findOne({ email });
  if (!user || !user.resetToken || !user.resetExpiry) {
    return res.status(400).json({ message: "Invalid or expired reset token" });
  }

  if (Date.now() > user.resetExpiry) {
    return res.status(400).json({ message: "Reset token expired" });
  }

  const validToken = await bcrypt.compare(token, user.resetToken);
  if (!validToken) {
    return res.status(400).json({ message: "Invalid reset token" });
  }

  user.passwordHash = await bcrypt.hash(password, 10);
  user.resetToken = undefined;
  user.resetExpiry = undefined;
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
