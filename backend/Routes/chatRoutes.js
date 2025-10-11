const express = require("express");
const router = express.Router();
const ChatMessage = require("../Models/ChatMessage");
const Student = require("../Models/Student");
const Expert = require("../Models/Expert");
const authMiddleware = require("../middleware/auth");
const { body, validationResult } = require("express-validator");
const sanitizeHtml = require("sanitize-html");
const { chatLimiter } = require("../middleware/rateLimiter");

// ✅ Get all messages for an assignment
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
          _id: msg._id.toString(),
          assignmentId: msg.assignmentId,
          sender: msg.senderId.toString(),
          senderName: sender?.name || sender?.username,
          senderModel: msg.senderModel,
          text: msg.message,
          message: msg.message,
          timestamp: msg.createdAt,
          createdAt: msg.createdAt,
        };
      })
    );

    res.json(populatedMessages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// ✅ Save new message (with sanitization + validation)
router.post(
  "/:assignmentId/messages",
  authMiddleware, chatLimiter,
  [
    body("message")
      .trim()
      .notEmpty().withMessage("Message cannot be empty")
      .isLength({ max: 1000 }).withMessage("Message too long"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // 🧼 Sanitize user input before saving
      const sanitizedMessage = sanitizeHtml(req.body.message, {
        allowedTags: [], // No HTML allowed
        allowedAttributes: {},
      });

      const newMessage = new ChatMessage({
        assignmentId: req.params.assignmentId,
        senderId: req.userId,
        senderModel: req.userType === "expert" ? "Expert" : "Student",
        message: sanitizedMessage,
      });

      await newMessage.save();
      res.status(201).json(newMessage);
    } catch (error) {
      console.error("Error saving message:", error);
      res.status(500).json({ error: "Failed to save message" });
    }
  }
);

module.exports = router;
