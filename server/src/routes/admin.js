import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Car from "../models/Car.js";
import Message from "../models/Message.js";
import auth from "../middleware/auth.js";

const router = express.Router();

const ADMIN_ID = "admin";

const signAdminToken = () => {
  return jwt.sign({ sub: ADMIN_ID, isAdmin: true }, process.env.JWT_SECRET || "dev-secret", {
    expiresIn: "7d"
  });
};

// Admin login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  const adminEmail = process.env.ADMIN_EMAIL || "admin@parkping.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  if (email === adminEmail && password === adminPassword) {
    const token = signAdminToken();
    return res.json({
      token,
      admin: { id: ADMIN_ID, email: adminEmail, role: "admin" }
    });
  }

  return res.status(401).json({ message: "Invalid admin credentials" });
});

// Get admin stats
router.get("/stats", auth, async (req, res) => {
  if (req.user.id !== ADMIN_ID) {
    return res.status(403).json({ message: "Access denied" });
  }

  const totalUsers = await User.countDocuments();
  const totalCars = await Car.countDocuments();
  const totalMessages = await Message.countDocuments();
  const unreadMessages = await Message.countDocuments({ 
    receiverId: ADMIN_ID, 
    isRead: false 
  });

  return res.json({ totalUsers, totalCars, totalMessages, unreadMessages });
});

// Get all users
router.get("/users", auth, async (req, res) => {
  if (req.user.id !== ADMIN_ID) {
    return res.status(403).json({ message: "Access denied" });
  }

  const users = await User.find().select("name email phone createdAt").sort({ createdAt: -1 });
  return res.json({ users });
});

// Get all cars
router.get("/cars", auth, async (req, res) => {
  if (req.user.id !== ADMIN_ID) {
    return res.status(403).json({ message: "Access denied" });
  }

  const cars = await Car.find()
    .populate("userId", "name email")
    .sort({ createdAt: -1 });
  return res.json({ cars });
});

// Send message to user
router.post("/messages", auth, async (req, res) => {
  if (req.user.id !== ADMIN_ID) {
    return res.status(403).json({ message: "Access denied" });
  }

  const { receiverId, message } = req.body;
  if (!receiverId || !message) {
    return res.status(400).json({ message: "Receiver and message are required" });
  }

  const newMessage = await Message.create({
    senderId: ADMIN_ID,
    receiverId,
    message,
    isAdminSender: true
  });

  return res.status(201).json({ message: newMessage });
});

// Get all messages for admin (all conversations)
router.get("/messages", auth, async (req, res) => {
  if (req.user.id !== ADMIN_ID) {
    return res.status(403).json({ message: "Access denied" });
  }

  const messages = await Message.find().sort({ createdAt: -1 });
  
  // Manually populate user details
  const populatedMessages = await Promise.all(
    messages.map(async (msg) => {
      const messageObj = msg.toObject();
      
      if (messageObj.senderId !== ADMIN_ID && messageObj.senderId) {
        const sender = await User.findById(messageObj.senderId).select("name email");
        messageObj.senderId = sender;
      }
      
      if (messageObj.receiverId !== ADMIN_ID && messageObj.receiverId) {
        const receiver = await User.findById(messageObj.receiverId).select("name email");
        messageObj.receiverId = receiver;
      }
      
      return messageObj;
    })
  );

  return res.json({ messages: populatedMessages });
});

// Mark admin messages as read
router.put("/messages/read", auth, async (req, res) => {
  if (req.user.id !== ADMIN_ID) {
    return res.status(403).json({ message: "Access denied" });
  }

  await Message.updateMany(
    { receiverId: ADMIN_ID, isRead: false },
    { isRead: true }
  );

  return res.json({ message: "Messages marked as read" });
});

// Get conversation with specific user
router.get("/messages/:userId", auth, async (req, res) => {
  if (req.user.id !== ADMIN_ID) {
    return res.status(403).json({ message: "Access denied" });
  }

  const messages = await Message.find({
    $or: [
      { senderId: ADMIN_ID, receiverId: req.params.userId },
      { senderId: req.params.userId, receiverId: ADMIN_ID }
    ]
  }).sort({ createdAt: 1 });
  
  // Manually populate user details
  const populatedMessages = await Promise.all(
    messages.map(async (msg) => {
      const messageObj = msg.toObject();
      
      if (messageObj.senderId !== ADMIN_ID && messageObj.senderId) {
        const sender = await User.findById(messageObj.senderId).select("name email");
        messageObj.senderId = sender;
      }
      
      if (messageObj.receiverId !== ADMIN_ID && messageObj.receiverId) {
        const receiver = await User.findById(messageObj.receiverId).select("name email");
        messageObj.receiverId = receiver;
      }
      
      return messageObj;
    })
  );

  return res.json({ messages: populatedMessages });
});

export default router;
