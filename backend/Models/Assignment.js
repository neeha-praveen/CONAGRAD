const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    title: String,
    description: String,
    fileName: String,
    fileUrl: String,
    fileType: String,
    fileSize: Number,
    status: {
        type: String,
        enum: ['pending', 'assigned', 'completed'],
        default: 'pending'
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
    expertId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Expert'
    },
    submittedDate: {
        type: Date,
        default: Date.now
    },
    dueDate: Date
}, {
    timestamps: true,
    collection: 'assignments'
});

module.exports = mongoose.model('Assignment', assignmentSchema, 'assignments'); 