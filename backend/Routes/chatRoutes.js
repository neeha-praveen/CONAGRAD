const express = require('express');
const router = express.Router();
const ChatMessage = require('../Models/ChatMessage');
const auth = require('../middleware/auth');
const chatController = require('../controllers/chatController');

// GET all messages for a specific assignment
router.get('/:assignmentId', auth, async (req, res) => {
    try {
        const messages = await ChatMessage.find({ assignmentId: req.params.assignmentId })
            .populate('senderId', 'name') // Get the sender's name
            .sort({ createdAt: 'asc' });
        res.json(messages);
    } catch (error) {
        console.error('Error fetching chat messages:', error);
        res.status(500).json({ error: 'Failed to fetch chat history.' });
    }
});

module.exports = router;

