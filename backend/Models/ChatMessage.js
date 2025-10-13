const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    assignmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
        required: true,
        index: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'senderModel' // Dynamic reference to Student or Expert
    },
    senderModel: {
        type: String,
        required: true,
        enum: ['Student', 'Expert'] // Sender must be one of these two
    },
    message: {
        type: String,
        required: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);