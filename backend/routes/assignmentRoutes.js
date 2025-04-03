const express = require('express');
const router = express.Router();
const Assignment = require('../Models/Assignment');
const multer = require('multer');
const path = require('path');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function(req, file, cb) {
        cb(null, 'assignment-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10000000 } // 10MB limit
});

// Student uploads assignment
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const { title, description, subject, dueDate } = req.body;
        const studentId = req.user._id; // From auth middleware
        const studentName = req.user.name;

        const newAssignment = new Assignment({
            title,
            description,
            subject,
            studentId,
            studentName,
            dueDate,
            fileUrl: `/uploads/${req.file.filename}`,
            fileName: req.file.originalname
        });

        await newAssignment.save();
        res.status(201).json({ message: 'Assignment uploaded successfully' });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload assignment' });
    }
});

// Expert gets available assignments
router.get('/available-assignments', async (req, res) => {
    try {
        const assignments = await Assignment.find({ 
            status: 'pending',
            expertId: null 
        })
        .sort({ submittedDate: -1 });
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch assignments' });
    }
});

// Expert accepts assignment
router.post('/accept-assignment/:id', async (req, res) => {
    try {
        const expertId = req.user._id; // From auth middleware
        const assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        if (assignment.expertId) {
            return res.status(400).json({ error: 'Assignment already accepted' });
        }

        assignment.expertId = expertId;
        assignment.status = 'assigned';
        await assignment.save();

        res.json({ message: 'Assignment accepted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to accept assignment' });
    }
});

module.exports = router; 