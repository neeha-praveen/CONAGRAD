const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Assignment = require('../Models/Assignment');
const authMiddleware = require('../middleware/auth');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

// GET /api/student/assignments - Get all assignments for a student
router.get('/assignments', authMiddleware, async (req, res) => {
    try {
        console.log('Fetching assignments for user:', req.userId);
        
        const assignments = await Assignment
            .find({ studentId: req.userId })
            .sort({ createdAt: -1 });
            
        console.log('Found assignments:', assignments.length);
        res.json(assignments);
    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({ error: "Failed to fetch assignments" });
    }
});

// FIXED: GET /api/student/assignments/:id - Get a specific assignment by ID (moved before bids routes)
router.get('/assignments/:id', authMiddleware, async (req, res) => {
    console.log('GET /assignments/:id route hit with ID:', req.params.id);
    try {
        // Remove this line
        // const assignment = await Assignment.findById(req.params.id);
        // console.log('Assignment found:', assignment ? 'Yes' : 'No');
        
        const assignment = await Assignment.findById(req.params.id).populate({
            path: 'bids.expertId',
            select: 'name username email'
        });
        
        console.log('Assignment found:', assignment ? 'Yes' : 'No');
        
        if (!assignment) {
            console.log('Assignment not found:', req.params.id);
            return res.status(404).json({ error: 'Assignment not found' });
        }
        
        // Verify that the assignment belongs to the authenticated student
        if (assignment.studentId.toString() !== req.userId) {
            console.log('Unauthorized access attempt:', {
                assignmentStudent: assignment.studentId.toString(),
                requestingUser: req.userId
            });
            return res.status(403).json({ error: 'You do not have permission to view this assignment' });
        }
        
        console.log('Assignment found successfully:', assignment.title);
        res.json(assignment);
    } catch (error) {
        console.error('Error fetching assignment:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid assignment ID format' });
        }
        console.error('Error in GET /assignments/:id:', error);
        res.status(500).json({ error: 'Failed to fetch assignment details' });
    }
});

// POST /api/student/upload-assignment - Upload new assignment
router.post('/upload-assignment', authMiddleware, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        console.log('File received:', req.file);
        console.log('Request body:', req.body);

        const { title, description, subject, dueDate } = req.body;

        if (!title) {
            return res.status(400).json({ error: "Title is required" });
        }

        const newAssignment = new Assignment({
            title,
            description: description || '',
            subject: subject || 'General',
            studentId: req.userId,
            fileUrl: `/uploads/${req.file.filename}`,
            fileName: req.file.originalname,
            fileType: req.file.mimetype,
            fileSize: req.file.size,
            dueDate: dueDate ? new Date(dueDate) : new Date(),
            status: 'pending',
            submittedDate: new Date(),
            bids: [] // Initialize empty bids array
        });

        await newAssignment.save();
        
        res.status(201).json({ 
            message: "Assignment uploaded successfully",
            assignment: newAssignment
        });
    } catch (error) {
        console.error('Upload error details:', error);
        res.status(500).json({ 
            error: "Failed to upload assignment",
            details: error.message 
        });
    }
});

// GET /api/student/download/:filename - Download file
router.get('/download/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(uploadsDir, filename);
        
        console.log('Download request for:', filename);
        console.log('File path:', filePath);
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            console.log('File not found:', filePath);
            return res.status(404).json({ error: 'File not found' });
        }

        // Get file stats
        const stats = fs.statSync(filePath);
        const fileSize = stats.size;

        // Set headers for download
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', fileSize);

        // Stream the file
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
        
        fileStream.on('error', (error) => {
            console.error('File stream error:', error);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Failed to download file' });
            }
        });

    } catch (error) {
        console.error('Download error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to download file' });
        }
    }
});

// GET /api/student/assignments/:id/bids - Get all bids for a specific assignment
router.get('/assignments/:id/bids', authMiddleware, async (req, res) => {
    try {
        const assignmentId = req.params.id;
        console.log('Fetching bids for assignment:', assignmentId);
        
        // Verify the assignment belongs to this student
        const assignment = await Assignment.findOne({
            _id: assignmentId,
            studentId: req.userId
        }).populate({
            path: 'bids.expertId',
            select: 'name username email'
        });
        
        if (!assignment) {
            return res.status(404).json({ error: "Assignment not found or unauthorized" });
        }
        
        console.log('Found bids:', assignment.bids.length);
        res.json(assignment.bids);
    } catch (error) {
        console.error('Error fetching bids:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid assignment ID format' });
        }
        res.status(500).json({ error: "Failed to fetch bids" });
    }
});

// POST /api/student/assignments/:id/accept-bid/:bidId - Accept a specific bid
router.post('/assignments/:id/accept-bid/:bidId', authMiddleware, async (req, res) => {
    try {
        const { id: assignmentId, bidId } = req.params;
        console.log('Accepting bid:', { assignmentId, bidId });
        
        // Find the assignment and verify it belongs to this student
        const assignment = await Assignment.findOne({
            _id: assignmentId,
            studentId: req.userId,
            status: 'pending' // Only pending assignments can have bids accepted
        });
        
        if (!assignment) {
            return res.status(404).json({ 
                error: "Assignment not found, unauthorized, or not in pending status" 
            });
        }
        
        // Find the bid
        const bid = assignment.bids.id(bidId);
        if (!bid) {
            return res.status(404).json({ error: "Bid not found" });
        }
        
        // Update assignment status and assign to expert
        assignment.status = 'assigned';
        assignment.expertId = bid.expertId;
        assignment.acceptedBidId = bidId;
        
        await assignment.save();
        
        console.log('Bid accepted successfully');
        res.json({ 
            message: "Bid accepted successfully",
            assignment
        });
    } catch (error) {
        console.error('Error accepting bid:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid ID format' });
        }
        res.status(500).json({ error: "Failed to accept bid" });
    }
});

// POST /api/student/assignments/:id/reject-bid/:bidId - Reject a specific bid
router.post('/assignments/:id/reject-bid/:bidId', authMiddleware, async (req, res) => {
    try {
        const { id: assignmentId, bidId } = req.params;
        console.log('Rejecting bid:', { assignmentId, bidId });
        
        // Find the assignment and verify it belongs to this student
        const assignment = await Assignment.findOne({
            _id: assignmentId,
            studentId: req.userId
        });
        
        if (!assignment) {
            return res.status(404).json({ error: "Assignment not found or unauthorized" });
        }
        
        // Remove the bid
        assignment.bids.pull(bidId);
        await assignment.save();
        
        console.log('Bid rejected successfully');
        res.json({ 
            message: "Bid rejected successfully",
            assignment
        });
    } catch (error) {
        console.error('Error rejecting bid:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid ID format' });
        }
        res.status(500).json({ error: "Failed to reject bid" });
    }
});

// GET /api/student/assignments/:id/expert-document
router.get('/assignments/:id/expert-document', authMiddleware, async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id)
            .populate({
                path: 'expertId',
                select: 'name username email expertise rating'
            });

        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        if (assignment.studentId.toString() !== req.userId) {
            return res.status(403).json({ error: 'Unauthorized access' });
        }

        res.json({
            expertDetails: assignment.expertId,
            document: assignment.expertDocument,
            message: assignment.expertMessage,
            completionDate: assignment.completionDate
        });
    } catch (error) {
        console.error('Error fetching expert document:', error);
        res.status(500).json({ error: 'Failed to fetch expert document details' });
    }
});

// GET /api/student/assignments/:id/download-expert-document
router.get('/assignments/:id/download-expert-document', authMiddleware, async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        
        if (!assignment || !assignment.expertDocument) {
            return res.status(404).json({ error: 'Document not found' });
        }

        if (assignment.studentId.toString() !== req.userId) {
            return res.status(403).json({ error: 'Unauthorized access' });
        }

        const filePath = path.join(uploadsDir, assignment.expertDocument.fileName);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        res.download(filePath, assignment.expertDocument.fileName);
    } catch (error) {
        console.error('Error downloading expert document:', error);
        res.status(500).json({ error: 'Failed to download expert document' });
    }
});

module.exports = router;