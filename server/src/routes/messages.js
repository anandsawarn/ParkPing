import express from "express";
import auth from "../middleware/auth.js";
import Message from "../models/Message.js";

const router = express.Router();
const ADMIN_ID = "admin";

// Get user's messages (conversation with admin)
router.get("/", auth, async (req, res) => {
  const messages = await Message.find({
    $or: [
      { senderId: req.user.id, receiverId: ADMIN_ID },
      { senderId: ADMIN_ID, receiverId: req.user.id }
    ]
  }).sort({ createdAt: 1 });

  return res.json({ messages });
});

// Send message to admin
router.post("/", auth, async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ message: "Message is required" });
  }

  const newMessage = await Message.create({
    senderId: req.user.id,
    receiverId: ADMIN_ID,
    message,
    isAdminSender: false
  });

  return res.status(201).json({ message: newMessage });
});

// Mark messages as read
router.put("/read", auth, async (req, res) => {
  await Message.updateMany(
    { receiverId: req.user.id, isRead: false },
    { isRead: true }
  );

  return res.json({ message: "Messages marked as read" });
});

export default router;
