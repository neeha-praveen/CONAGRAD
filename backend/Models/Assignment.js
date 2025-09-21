const mongoose = require('mongoose');

const BidSchema = new mongoose.Schema({
    expertId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'experts',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const SubmissionSchema = new mongoose.Schema({
    expertId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'experts',
        required: true
    },
    expertMessage: String,
    completionDate: Date,
    submittedDate: {
        type: Date,
        default: Date.now
    },
    files: [
        {
            fileName: String,
            fileUrl: String,
            fileType: String,
            fileSize: Number,
            uploadDate: {
                type: Date,
                default: Date.now
            }
        }
    ]
});

const AssignmentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    fileName: String,
    fileUrl: String,
    fileType: String,
    fileSize: Number,
    status: {
        type: String,
        enum: ['pending', 'completed', 'assigned','to be reviewed'],
        default: 'pending'
    },
    expertId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'experts'
    },
    dueDate: Date,
    subject: String,
    studentName: String,
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    bids: [BidSchema],
    submission: [SubmissionSchema]
});

module.exports = mongoose.model('Assignment', AssignmentSchema);