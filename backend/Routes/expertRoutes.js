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
router.get("/profile/:id", async (req, res) => {
  console.log("Incoming profile request for:", req.params.id);
  try {
    const expert = await Expert.findById(req.params.id);
    if (!expert) return res.status(404).json({ error: "Expert not found" });

    res.json({
      username: expert.username,
      name: expert.name,
      email: expert.email,
      bio: expert.bio,
      expertise: expert.expertise,
      education: expert.education,
      experience: expert.experience
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Update expert profile by ID
router.put("/profile/:id", auth, async (req, res) => {
  try {
    const expertId = req.params.id;
    const updateData = req.body;

    const updatedExpert = await Expert.findByIdAndUpdate(expertId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedExpert) {
      return res.status(404).json({ error: "Expert not found" });
    }

    res.json({
      username: updatedExpert.username,
      name: updatedExpert.name,
      email: updatedExpert.email,
      bio: updatedExpert.bio,
      expertise: updatedExpert.expertise,
      education: updatedExpert.education,
      experience: updatedExpert.experience
    });
  } catch (err) {
    console.error("Error updating expert profile:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// PUT /api/expert/settings/:id
router.put('/settings/:id', auth, async (req, res) => {
  try {
    const expertId = req.params.id;
    const updates = req.body;

    const updatedExpert = await Expert.findByIdAndUpdate(
      expertId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedExpert) {
      return res.status(404).json({ error: 'Expert not found' });
    }

    res.json({ message: 'Settings updated successfully', settings: updatedExpert });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/change-password/:id', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const expertId = req.params.id;

  try {
    const expert = await Expert.findById(expertId);
    if (!expert) return res.status(404).json({ error: 'Expert not found' });

    if (expert.password !== currentPassword) {
      return res.status(401).json({ error: 'Incorrect current password' });
    }

    expert.password = newPassword;
    await expert.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all assigned assignments for an expert
router.get('/assigned-assignments', auth, async (req, res) => {
  try {
    const expertId = req.userId;
    const assignments = await Assignment.find({ expertId })
      .populate('studentId', 'username')
      .select('title description dueDate status fileUrl fileName studentId subject');

    res.json(assignments);
  } catch (err) {
    console.error('Error fetching assigned assignments:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/assignment/:id', auth, async (req, res) => {
  try {
    console.log('✅ Route hit:', req.params.id);
    const expertId = req.userId;
    const assignmentId = req.params.id;

    const assignment = await Assignment.findOne({ _id: assignmentId, expertId })
      .populate('studentId', 'username')
      .select('title description dueDate status fileUrl fileName studentId subject submissionNote submittedFileUrl submittedFileName submittedAt');

    if (!assignment) {
      console.log('assignment not found')
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.json(assignment);
  } catch (err) {
    console.error('Error fetching assignment by ID:', err);
    res.status(500).json({ error: 'Failed to fetch assignment' });
  }
})

// Submit assignment with note and file
router.post('/submit-assignment/:id', auth, upload.single('file'), async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const note = req.body.note;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'File is required' });
    }

    const assignment = await Assignment.findById(assignmentId);
    console.log('➡️ Assignment found:', assignment);
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

router.put('/edit-submission/:id', auth, upload.array('files', 5), async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const note = req.body.note;
    const files = req.files;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    assignment.submissionNote = note;
    assignment.status = 'to be reviewed';
    assignment.submittedAt = new Date();

    if (files && files.length > 0) {
      assignment.submittedFileUrls = files.map(f => `/uploads/${f.filename}`);
      assignment.submittedFileNames = files.map(f => f.originalname);
    }

    await assignment.save();

    res.json({ message: 'Submission updated successfully', assignment });
  } catch (error) {
    console.error('Edit submission error:', error);
    res.status(500).json({ error: 'Failed to edit submission' });
  }
});


// Get bids submitted by expert
router.get('/bids', auth, async (req, res) => {
  try {
    const expertId = req.userId || req.user.id;

    const assignmentsWithBids = await Assignment.find({
      'bids.expertId': expertId
    }).populate('studentId', 'name username');

    const expertBids = [];

    assignmentsWithBids.forEach(assignment => {
      const expertBidsInAssignment = assignment.bids.filter(
        bid => bid.expertId.toString() === expertId
      );

      expertBidsInAssignment.forEach(bid => {
        expertBids.push({
          bidId: bid._id,
          assignmentId: assignment._id,
          assignmentTitle: assignment.title,
          assignmentDescription: assignment.description,
          assignmentSubject: assignment.subject,
          assignmentDueDate: assignment.dueDate,
          studentName: assignment.studentName || assignment.studentId?.name,
          studentUsername: assignment.studentId?.username,
          bidAmount: bid.amount,
          bidMessage: bid.message,
          bidTimestamp: bid.timestamp,
          assignmentStatus: assignment.status,
          fileName: assignment.fileName,
          fileUrl: assignment.fileUrl,
          bidStatus: assignment.expertId && assignment.expertId.toString() === expertId
            ? 'accepted'
            : assignment.status === 'assigned'
              ? 'not accepted'
              : 'pending'
        });
      });
    });

    expertBids.sort((a, b) => new Date(b.bidTimestamp) - new Date(a.bidTimestamp));

    res.json(expertBids);
  } catch (error) {
    console.error('Error fetching expert bids:', error);
    res.status(500).json({ error: 'Failed to fetch bids' });
  }
});

// Edit bid
router.put('/bids/:id', auth, async (req, res) => {
  try {
    const expertId = req.userId;
    const { bidAmount, bidMessage } = req.body;

    const assignment = await Assignment.findOneAndUpdate(
      { 'bids._id': req.params.id, 'bids.expertId': expertId },
      {
        $set: {
          'bids.$.amount': bidAmount,
          'bids.$.message': bidMessage,
        }
      },
      { new: true }
    );

    if (!assignment) {
      return res.status(404).json({ error: 'Bid not found' });
    }

    res.json({ message: 'Bid updated successfully', assignment });
  } catch (err) {
    console.error('Update bid error:', err);
    res.status(500).json({ error: 'Failed to update bid' });
  }
});

router.get('/completed-assignments', auth, async (req, res) => {
  try {
    const expertId = req.userId;

    const completedAssignments = await Assignment.find({
      expertId: expertId,
      status: 'completed'
    })
      .populate('studentId', 'username name')
      .select('title description dueDate status subject studentId submittedAt completedAt createdAt')
      .sort({ completedAt: -1, submittedAt: -1 });

    // Add mock data for amount and rating since they're not in your schema
    // You should add these fields to your Assignment schema if needed
    const assignmentsWithDetails = completedAssignments.map(assignment => ({
      ...assignment.toObject(),
      amountPaid: Math.floor(Math.random() * 500) + 100, // Mock data - replace with actual field
      rating: Math.floor(Math.random() * 2) + 4, // Mock data - replace with actual field
      completedDate: assignment.completedAt || assignment.submittedAt || assignment.createdAt
    }));

    res.json(assignmentsWithDetails);
  } catch (err) {
    console.error('Error fetching completed assignments:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;