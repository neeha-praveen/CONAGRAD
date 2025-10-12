require('dotenv').config();
const express = require('express');
const router = express.Router();
const Expert = require('../Models/Expert');
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const Assignment = require('../Models/Assignment');
const upload = require('../middleware/upload');
const { body, validationResult } = require("express-validator");
const sanitizeHtml = require("sanitize-html");
const { loginLimiter } = require("../middleware/rateLimiter");
const logAction = require("../utils/logAction");

// Expert registration
router.post(
  "/register",
  loginLimiter, // ✅ Apply rate limiter FIRST
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
    body("username").trim().isLength({ min: 3 }).escape().withMessage("Username must be at least 3 characters"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
  ],
  async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, email, username, password } = req.body;

      // Check if username exists
      const existing = await Expert.findOne({ username });
      if (existing) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Check if email exists
      const existingEmail = await Expert.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ error: "Email already registered" });
      }

      // Hash password
      const hashed = await bcrypt.hash(password, 10);

      // Create expert
      const expert = new Expert({
        name: sanitizeHtml(name),
        email,
        username: sanitizeHtml(username),
        password: hashed
      });

      await expert.save();

      // Log successful registration
      req.userType = "expert";
      await logAction(req, "expert_register_success", { username });

      res.status(201).json({ message: "Registration successful!" });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  }
);

// Expert login
router.post("/login",
  loginLimiter, // ✅ Apply rate limiter FIRST
  [
    body("username").trim().notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required")
  ],
  async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { username, password } = req.body;

      // Find expert
      const expert = await Expert.findOne({ username: sanitizeHtml(username) });
      if (!expert) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, expert.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Access token (short-lived)
      const accessToken = jwt.sign(
        { userId: expert._id, userType: "expert" },
        process.env.JWT_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
      );

      // Refresh token (longer-lived)
      const refreshToken = jwt.sign(
        { userId: expert._id, userType: "expert" },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" }
      );

      // Send refresh token as httpOnly cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/api/auth/refresh",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Log successful login
      req.userType = "expert";
      await logAction(req, "expert_login_success", { username: expert.username });

      // Return access token + expert details
      res.status(200).json({
        message: "Login successful!",
        accessToken,
        expert: {
          id: expert._id,
          username: expert.username,
          name: expert.name,
          email: expert.email,
          bio: expert.bio || "",
          expertise: expert.expertise || [],
          education: expert.education || "",
          experience: expert.experience || ""
        },
        redirectTo: "/expert-dashboard"
      });
    } catch (error) {
      console.error("Expert login error:", error);
      await logAction(req, "expert_login_failed", { username: req.body.username });
      res.status(500).json({ error: "Login failed" });
    }
  }
);

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

    await logAction(req, "expert_profile_updated", { expertId });
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

router.post("/change-password/:id", auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const expertId = req.params.id;

  try {
    const expert = await Expert.findById(expertId);
    if (!expert) return res.status(404).json({ error: "Expert not found" });

    const isMatch = await bcrypt.compare(currentPassword, expert.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect current password" });
    }

    expert.password = await bcrypt.hash(newPassword, 10);
    await expert.save();

    await logAction(req, "expert_password_changed", { expertId });
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Password change error:", err);
    res.status(500).json({ error: "Server error" });
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

// Submit bid route
router.post('/submit-bid/:id', auth, async (req, res) => {
  try {
    console.log('Submit bid route hit:', req.params.id);
    console.log('Request body:', req.body);
    console.log('Expert ID:', req.userId);

    const { amount, message } = req.body;
    const assignmentId = req.params.id;
    const expertId = req.userId;

    if (!amount || !message) {
      return res.status(400).json({
        error: 'Amount and message are required'
      });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        error: 'Assignment not found'
      });
    }

    if (assignment.status !== 'pending') {
      return res.status(400).json({
        error: 'Assignment is no longer available for bidding'
      });
    }

    const bid = {
      expertId,
      amount: parseFloat(amount),
      message,
      timestamp: new Date()
    };

    const existingBidIndex = assignment.bids.findIndex(
      b => b.expertId.toString() === expertId
    );

    if (existingBidIndex !== -1) {
      assignment.bids[existingBidIndex] = bid;
    } else {
      assignment.bids.push(bid);
    }

    await assignment.save();

    await logAction(req, "expert_bid_submitted", { assignmentId, amount });
    res.json({
      success: true,
      message: 'Bid submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting bid:', error);
    res.status(500).json({
      error: 'Failed to submit bid',
      details: error.message
    });
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

// Submit assignment work (initial submission)
router.post('/submit-assignment/:id', auth, upload.array('files', 3), async (req, res) => {
  try {
    const expertId = req.userId;
    const assignmentId = req.params.id;
    const note = req.body.note;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'At least one file is required' });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    if (assignment.expertId.toString() !== expertId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Create files array
    const fileList = files.map(file => ({
      fileName: file.originalname,
      fileUrl: `/uploads/${file.filename}`,
      fileType: file.mimetype,
      fileSize: file.size,
    }));

    const newSubmission = {
      expertId,
      expertMessage: note,
      submittedDate: new Date(),
      files: fileList
    };

    console.log("New submission object:", newSubmission);

    assignment.status = 'to be reviewed';
    assignment.submission.push(newSubmission);

    await assignment.save();
    res.json({ message: 'Work submitted successfully', assignment });
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({ error: 'Failed to submit assignment' });
  }
});

// Edit existing submission
router.put('/edit-submission/:id', auth, upload.array('files', 3), async (req, res) => {
  try {
    const expertId = req.userId;
    const assignmentId = req.params.id;
    const note = req.body.note;
    const files = req.files;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    if (assignment.expertId.toString() !== expertId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (assignment.submission.length === 0) {
      return res.status(400).json({ error: 'No submission found to edit' });
    }

    // Get the latest submission
    const latestSubmissionIndex = assignment.submission.length - 1;
    const latestSubmission = assignment.submission[latestSubmissionIndex];

    // Update the note
    latestSubmission.expertMessage = note;

    // If new files are uploaded, replace the old files
    if (files && files.length > 0) {
      const fileList = files.map(file => ({
        fileName: file.originalname,
        fileUrl: `/uploads/${file.filename}`,
        fileType: file.mimetype,
        fileSize: file.size,
      }));

      latestSubmission.files = fileList;
    }

    // Update submission date
    latestSubmission.submittedDate = new Date();

    await assignment.save();
    await logAction(req, "expert_submission_edited", { assignmentId });
    res.json({ message: 'Submission updated successfully', assignment });
  } catch (error) {
    console.error('Edit submission error:', error);
    res.status(500).json({ error: 'Failed to update submission' });
  }
});

// Get assignment details (update existing route to include submission data)
router.get('/assignment/:id', auth, async (req, res) => {
  console.log(">>> HIT /assignment/:id", req.params.id, "expertId from token:", req.userId);

  try {
    const assignment = await Assignment.findOne({ _id: req.params.id, expertId: req.userId })
      .populate('studentId', 'username')
      .populate('submission.expertId', 'username')
      .select('title description dueDate status fileUrl fileName studentId subject submission bids');

    console.log(">>> After findOne, assignment =", assignment ? "FOUND" : "NOT FOUND");

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    console.log('Assignment data being sent:', {
      id: assignment._id,
      title: assignment.title,
      status: assignment.status,
      submissionCount: assignment.submission ? assignment.submission.length : 0,
      latestSubmission: assignment.submission && assignment.submission.length > 0
        ? assignment.submission[assignment.submission.length - 1]
        : null
    });

    res.json(assignment);
  } catch (err) {
    console.error('Error fetching assignment by ID:', err);
    res.status(500).json({ error: 'Failed to fetch assignment' });
  }
});

// Get all available assignments (for experts to browse)
router.get("/available-assignments", auth, async (req, res) => {
  try {
    const assignments = await Assignment.find({ status: "pending" })
      .populate("studentId", "name username")
      .sort({ createdAt: -1 });

    res.json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    res.status(500).json({ error: "Failed to fetch assignments" });
  }
});

// Get current assignment for expert
router.get("/current-assignment", auth, async (req, res) => {
  try {
    const currentAssignment = await Assignment.findOne({
      expertId: req.userId,
      status: "assigned"
    })
      .populate("studentId", "name username")
      .populate("expertId", "name username");

    res.json(currentAssignment);
  } catch (error) {
    console.error("Error checking current assignment:", error);
    res.status(500).json({ error: "Failed to check current assignment" });
  }
});

// Logout route (invalidate refresh token)
router.post("/logout", auth, async (req, res) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      path: "/api/auth/refresh"
    });
    await logAction(req, "expert_logout", { message: "Refresh token cleared" });
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ error: "Logout failed" });
  }
});

module.exports = router;