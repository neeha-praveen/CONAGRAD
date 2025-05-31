const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require('multer');
const path = require('path');
const errorHandler = require("./middleware/errorHandler");
const jwt = require('jsonwebtoken');
const authMiddleware = require("./middleware/auth");
require('dotenv').config();
const studentRoutes = require('./routes/student');

const expertRoutes = require('./Routes/expertRoutes');
app.use('/expert', expertRoutes);
const app = express();
const PORT = 4000;

// MongoDB Atlas Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('Connected to MongoDB Atlas');
    console.log('Database:', mongoose.connection.db.databaseName);
    mongoose.connection.db.listCollections().toArray().then(collections => {
        console.log('Available collections:', collections.map(c => c.name));
    });
})
.catch((err) => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());

// Debug middleware to log all requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Serve uploaded files
app.use((req, res, next) => {
    console.log('Accessing file:', req.url);
    next();
});

// Modify the static middleware
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    fallthrough: false // Return 404 if file not found
}));

app.use((err, req, res, next) => {
    if (err.status === 404) {
        res.status(404).json({ error: 'File not found' });
    } else {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Import Models
const Assignment = require('./Models/Assignment');
const Student = require('./Models/Student');
const Expert = require('./Models/Expert');

// Routes
app.post("/register", async (req, res) => {
  try {
    const { name, email, username, password } = req.body;
        const newStudent = new Student({ name, email, username, password });
        await newStudent.save();
    res.status(201).json({ 
            message: "Registration successful!",
      redirectTo: "/login"
    });
  } catch (error) {
        res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const student = await Student.findOne({ username, password });
        if (!student) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        
        const token = jwt.sign(
            { userId: student._id, userType: 'student' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.status(200).json({ 
            message: "Login successful!",
            token,
            user: {
                id: student._id,
                username: student.username,
                name: student.name
            },
            redirectTo: "/student-upload"
        });
    } catch (error) {
        res.status(500).json({ error: "Login failed" });
    }
});

//     try {
//         const expert = await Expert.findById(req.userId);
//         if (!expert) {
//             return res.status(404).json({ error: "Expert not found" });
//         }
        
//         res.json({
//             username: expert.username,
//             name: expert.name,
//             email: expert.email,
//             bio: expert.bio,
//             expertise: expert.expertise,
//             education: expert.education,
//             experience: expert.experience
//         });
//     } catch (error) {
//         res.status(500).json({ error: "Failed to fetch profile" });
//     }
// });

// Student Upload Assignment Route
app.post("/upload-assignment", authMiddleware, upload.single('file'), async (req, res) => {
    try {
        const { title, description, subject, dueDate } = req.body;
        const studentId = req.userId; // Now coming from auth middleware

        const newAssignment = new Assignment({
            title,
            description,
            subject,
            studentId,
            fileUrl: `/uploads/${req.file.filename}`,
            fileName: req.file.originalname,
            dueDate,
            status: 'pending'
        });

        await newAssignment.save();
        await newAssignment.populate('studentId', 'name username');
        
        res.status(201).json({ 
            message: "Assignment uploaded successfully",
            assignment: newAssignment
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: "Failed to upload assignment" });
    }
});

// Route for fetching available assignments
app.get('/available-assignments', authMiddleware, async (req, res) => {
    try {
        const assignments = await Assignment
            .find({ status: 'pending' })
            .populate('studentId', 'name username')
            .sort({ createdAt: -1 });
            
        res.json(assignments);
    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({ error: 'Failed to fetch assignments' });
    }
});

// Get Current Work Route
app.get("/current-work", async (req, res) => {
    try {
        const currentWork = await Assignment.find({
            status: 'assigned'
        }).lean();
        res.json(currentWork);
    } catch (error) {
        console.error('Error fetching current work:', error);
        res.status(500).json({ error: "Failed to fetch current work" });
    }
});

// Route for checking current assignment
app.get('/expert/current-assignment', authMiddleware, async (req, res) => {
    try {
        const currentAssignment = await Assignment
            .findOne({ 
                expertId: req.userId,
                status: 'assigned'
            })
            .populate('studentId', 'name username')
            .populate('expertId', 'name username');
            
        res.json(currentAssignment);
    } catch (error) {
        console.error('Error checking current assignment:', error);
        res.status(500).json({ error: 'Failed to check current assignment' });
    }
});

// Accept assignment route
app.post("/accept-assignment/:id", authMiddleware, async (req, res) => {
    try {
        // Check if expert already has an assignment
        const existingAssignment = await Assignment.findOne({
            status: 'assigned',
            expertId: req.userId
        });

        if (existingAssignment) {
            return res.status(400).json({ 
                error: "You already have an active assignment. Please complete it first." 
            });
        }

        const assignment = await Assignment.findByIdAndUpdate(
            req.params.id,
            { 
                $set: { 
                    status: 'assigned',
                    expertId: req.userId
                }
            },
            { new: true }
        ).populate('studentId', 'name username')
         .populate('expertId', 'name username');

        if (!assignment) {
            return res.status(404).json({ error: "Assignment not found" });
        }

        res.json({ 
            message: "Assignment accepted successfully",
            assignment 
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to accept assignment" });
    }
});

// NEW: Expert submits a bid for an assignment
app.post('/submit-bid/:id', authMiddleware, async (req, res) => {
    try {
        console.log('Submit bid route hit:', req.params.id);
        console.log('Request body:', req.body);
        console.log('Expert ID:', req.userId);

        const { amount, message } = req.body;
        const assignmentId = req.params.id;
        const expertId = req.userId;

        // Validate input
        if (!amount || !message) {
            return res.status(400).json({
                error: 'Amount and message are required'
            });
        }

        // Check if assignment exists and is available
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

        // Add bid to assignment
        const bid = {
            expertId,
            amount: parseFloat(amount),
            message,
            timestamp: new Date()
        };

        // Check if expert has already bid
        const existingBidIndex = assignment.bids.findIndex(
            b => b.expertId.toString() === expertId
        );

        if (existingBidIndex !== -1) {
            // Update existing bid
            assignment.bids[existingBidIndex] = bid;
        } else {
            // Add new bid
            assignment.bids.push(bid);
        }

        await assignment.save();

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

// Complete assignment route
app.post("/complete-assignment/:id", async (req, res) => {
    try {
        const assignment = await Assignment.findByIdAndUpdate(
            req.params.id,
            { 
                $set: { 
                    status: 'completed'
                }
            },
            { new: true }
        );

        if (!assignment) {
            return res.status(404).json({ error: "Assignment not found" });
        }

        res.json({ 
            message: "Assignment completed successfully",
            assignment 
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to complete assignment" });
    }
});

// List all collections (for debugging)
app.get("/debug/collections", async (req, res) => {
    try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        res.json(collections.map(col => col.name));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Debug route to check database connection
app.get('/debug/database', async (req, res) => {
    try {
        // Check connection status
        const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
        
        // Get all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        
        // Count documents in assignments collection
        const assignmentCount = await Assignment.countDocuments();
        
        // Get a sample assignment
        const sampleAssignment = await Assignment.findOne();
        
        res.json({
            status: dbStatus,
            collections: collections.map(c => c.name),
            assignmentCount,
            sampleAssignment
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
            stack: error.stack
        });
    }
});

// Add error handling middleware
app.use(errorHandler);

// Function to add test data
const addTestData = async () => {
    try {
        const count = await Assignment.countDocuments();
        if (count === 0) {
            const testAssignment = new Assignment({
                title: "Test Assignment",
                description: "This is a test assignment",
                subject: "Computer Science",
                studentName: "John Doe",
                dueDate: new Date("2025-03-20"),
                status: "pending"
            });
            await testAssignment.save();
            console.log('Test data added successfully');
        }
    } catch (error) {
        console.error('Error adding test data:', error);
    }
};

// Add this route to get expert profile
app.get("/expert/profile", async (req, res) => {
    try {
        // For now, getting username from token. You'll implement proper auth later
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: "No token provided" });
        }

        // Get expert data from database
        const expert = await Expert.findById(req.expertId); // You'll get this from auth middleware
        if (!expert) {
            return res.status(404).json({ error: "Expert not found" });
        }

        // Return only necessary data
        res.json({
            username: expert.username,
            name: expert.name,
            email: expert.email
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: "Failed to fetch profile" });
    }
});

// Root route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Expert Assignment API Server',
        endpoints: {
            test: '/test',
            assignments: '/available-assignments',
            currentAssignment: '/expert/current-assignment'
        }
    });
});

// Test route
app.get('/test', (req, res) => {
    res.json({ message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
app.use('/api/student', studentRoutes);