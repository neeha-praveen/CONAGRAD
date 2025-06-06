const express = require('express');
const router = express.Router();
const Expert = require('../Models/Expert');
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const Assignment = require('../Models/Assignment');
const upload = require('../middleware/upload');

// Expert registration
router.post("/register", async (req, res) => {
  try {
    const { name, email, username, password } = req.body;
    const newExpert = new Expert({ name, email, username, password });
    await newExpert.save();
    res.status(201).json({ 
      message: "Registration successful!",
      redirectTo: "/expert-login"
    });
  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
});

// Expert login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const expert = await Expert.findOne({ username, password });
    if (!expert) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const token = jwt.sign(
      { userId: expert._id, userType: 'expert' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(200).json({ 
      message: "Login successful!",
      token,
      expert: {
        id: expert._id,
        username: expert.username,
        name: expert.name,
        email: expert.email,
        bio: expert.bio || '',
        expertise: expert.expertise || [],
        education: expert.education || '',
        experience: expert.experience || ''
      },
      redirectTo: "/expert-dashboard"
    });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

// Get expert profile
router.get("/profile", auth, async (req, res) => {
  try {
    const expert = await Expert.findById(req.userId);
    if (!expert) {
      return res.status(404).json({ error: "Expert not found" });
    }
    
    res.json({
      username: expert.username,
      name: expert.name,
      email: expert.email,
      bio: expert.bio,
      expertise: expert.expertise,
      education: expert.education,
      experience: expert.experience
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Get all assigned assignments for an expert
router.get('/assigned-assignments', auth, async (req, res) => {
  try {
    const expertId = req.userId;
    const assignments = await Assignment.find({ expertId })
      .populate('studentId', 'username')
      .select('title description dueDate status fileUrl fileName studentId');
    
    res.json(assignments);
  } catch (err) {
    console.error('Error fetching assigned assignments:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit completed assignment with note and file
router.post('/submit-assignment/:id', auth, upload.single('file'), async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const note = req.body.note;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'File is required' });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    assignment.status = 'to be reviewed';
    assignment.submissionNote = note;
    assignment.submittedFileUrl = `/uploads/${file.filename}`;
    assignment.submittedFileName = file.originalname;
    assignment.submittedAt = new Date();

    await assignment.save();

    res.json({ message: 'Work submitted successfully', assignment });
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({ error: 'Failed to submit assignment' });
  }
});

module.exports = router;