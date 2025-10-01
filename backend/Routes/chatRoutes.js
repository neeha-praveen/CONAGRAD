const express = require("express");
const router = express.Router();
const ChatMessage = require("../Models/ChatMessage");
const Student = require("../Models/Student");
const Expert = require("../Models/Expert");
const authMiddleware = require("../middleware/auth");

// Get all messages for an assignment
router.get("/:assignmentId/messages", authMiddleware, async (req, res) => {
  try {
    const messages = await ChatMessage.find({
      assignmentId: req.params.assignmentId,
    }).sort({ createdAt: 1 });

    const populatedMessages = await Promise.all(
      messages.map(async (msg) => {
        let sender = null;
        if (msg.senderModel === "Expert") {
          sender = await Expert.findById(msg.senderId).select("name username");
        } else {
          sender = await Student.findById(msg.senderId).select("name username");
        }

        return {
          _id: msg._id.toString(), // Important: convert ObjectId to string
          assignmentId: msg.assignmentId,
          sender: msg.senderId.toString(),
          senderName: sender?.name || sender?.username,
          senderModel: msg.senderModel,
          text: msg.message,
          message: msg.message,
          timestamp: msg.createdAt,
          createdAt: msg.createdAt
        };
      })
    );

    res.json(populatedMessages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Save new message
router.post("/:assignmentId/messages", authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;

    const newMessage = new ChatMessage({
      assignmentId: req.params.assignmentId,
      senderId: req.userId,
      senderModel: req.userType === "expert" ? "Expert" : "Student",
      message,
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ error: "Failed to save message" });
  }
});

module.exports = router;