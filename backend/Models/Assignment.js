const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  fileName: String,
  fileUrl: String,
  fileType: String,
  fileSize: Number,
  status: {
    type: String,
    enum: ['pending', 'completed', 'assigned'],
    default: 'pending'
  },
  submittedDate: {
    type: Date,
    default: Date.now
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'students',
    required: true
  }
});

module.exports = mongoose.model('Assignment', AssignmentSchema);