const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Assignment = require('../Models/Assignment');
const Student = require('../Models/Student');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'profileImage') {
      cb(null, path.join(__dirname, '../uploads/profiles/'));
    } else {
      cb(null, path.join(__dirname, '../uploads/'));
    }
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'profileImage') {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'));
      }
    } else {
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
  }
});

// Get all assignments for a student
router.get('/assignments', async (req, res) => {
  try {
    const assignments = await Assignment.find({ studentId: req.user.id });
    res.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// Upload assignment route
router.post('/upload-assignment', upload.single('assignment'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!req.body.title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const assignment = new Assignment({
      title: req.body.title,
      description: req.body.description,
      deadline: req.body.deadline,
      fileName: req.file.filename,
      fileUrl: `/api/student/download/${req.file.filename}`, // Update fileUrl to use download endpoint
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      status: 'pending',
      studentId: req.user.id
    });

    await assignment.save();

    res.status(201).json({
      message: 'Assignment uploaded successfully',
      assignment
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload assignment' });
  }
});

// Download route with error handling
router.get('/download/:filename', async (req, res) => {
  try {
    const filePath = path.join(__dirname, '../uploads', req.params.filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Get file stats
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'application/octet-stream',
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${req.params.filename}"`,
      };
      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (error) {
    console.error('Download error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to download file' });
    }
  }
});

// Serve profile images
router.get('/profiles/:filename', async (req, res) => {
  try {
    const filePath = path.join(__dirname, '../uploads/profiles', req.params.filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.sendFile(path.join(__dirname, '../uploads/profiles/default-avatar.png'));
    }

    res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving profile image:', error);
    res.status(500).json({ error: 'Failed to serve profile image' });
  }
});

// Get profile data
router.get('/update-profile', async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select('-password');
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile data' });
  }
});

// Update profile data
router.post('/update-profile', upload.single('profileImage'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    if (req.file) {
      updateData.profileImage = `/api/student/profiles/${req.file.filename}`;
    }

    const student = await Student.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, select: '-password' }
    );

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;