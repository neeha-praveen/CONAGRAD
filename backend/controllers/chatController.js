const Chat = require('../Models/ChatMessage');
const { Assignment } = require('../Models/Assignment');
const { onlineUsers } = require('../utils/socketManager');

exports.getChatHistory = async (req, res) => {
  try {
    const chat = await Chat.findOne({ 
      assignmentId: req.params.assignmentId 
    }).populate('messages.sender', 'name username');

    if (!chat) {
        const assignment = await Assignment.findById(req.params.assignmentId);
        if (!assignment) return res.status(404).json({error: 'Assignment not found'});
        const newChat = new Chat({ 
            participants: [assignment.studentId, assignment.expertId].filter(Boolean), 
            assignmentId: req.params.assignmentId,
            messages: [] 
        });
        await newChat.save();
        return res.json(newChat);
    }

    if (!chat.participants.includes(req.userId)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(chat);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
};

exports.postMessage = (io) => async (req, res) => {
  try {
    const { content } = req.body;
    const { assignmentId } = req.params;
    const userId = req.userId;
    const userType = req.userType;

    let chat = await Chat.findOne({ assignmentId });
    if (!chat) {
        return res.status(404).json({error: 'Chat not found. Please load the chat history first.'});
    }

    if (!chat.participants.includes(userId)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const message = {
      sender: userId,
      content: content || '',
      senderModel: userType,
    };

    if (req.file) {
      message.fileUrl = `/uploads/${req.file.filename}`;
      message.fileName = req.file.originalname;
    }

    chat.messages.push(message);
    await chat.save();
    
    await chat.populate(`messages.${chat.messages.length - 1}.sender`, 'name username');
    const populatedMessage = chat.messages[chat.messages.length - 1];

    const receiverId = chat.participants.find(p => p.toString() !== userId);
    if (receiverId) {
        const receiverSocketId = onlineUsers.get(receiverId.toString());
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('receiveMessage', populatedMessage);
        }
    }
    const senderSocketId = onlineUsers.get(userId.toString());
    if(senderSocketId){
        io.to(senderSocketId).emit('receiveMessage', populatedMessage);
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error in postMessage controller:", error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};