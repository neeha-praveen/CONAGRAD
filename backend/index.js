// Core & Config
const express = require("express");
const http = require("http");
const path = require("path");
require("dotenv").config();

// Security
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const sanitizeHtml = require("sanitize-html");
const { loginLimiter, chatLimiter, apiLimiter } = require("./middleware/rateLimiter");

// Database & Middleware
const mongoose = require("mongoose");
const multer = require("multer");
const errorHandler = require("./middleware/errorHandler");
const authMiddleware = require("./middleware/auth");

// Models
const Assignment = require("./Models/Assignment");
const Student = require("./Models/Student");
const Expert = require("./Models/Expert");
const ChatMessage = require("./Models/ChatMessage");

// Routes
const studentRoutes = require("./Routes/student");
const expertRoutes = require("./Routes/expertRoutes");
const chatRoutes = require("./Routes/chatRoutes");
const authRoutes = require("./Routes/authRoutes");

// App Init
const app = express();
const PORT = process.env.PORT || 4000;

// Security Middlewares
app.use(helmet());
app.use(cookieParser());
// General API protection
app.use("/api", apiLimiter);

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Trust proxy (for HTTPS redirects if behind Nginx/Heroku)
app.set("trust proxy", 1);

// Debug logging (dev only)
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    console.log("Headers:", req.headers);
    next();
  });
}

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("Connected to MongoDB Atlas");
    console.log("Database:", mongoose.connection.db.databaseName);
    mongoose.connection.db.listCollections().toArray().then(collections => {
      console.log("Available collections:", collections.map(c => c.name));
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads"), { fallthrough: false }));

// Routes
app.use("/api/expert", expertRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/auth", authRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Expert Assignment API Server",
    endpoints: {
      test: "/test",
      assignments: "/available-assignments",
      currentAssignment: "/expert/current-assignment",
      expertLogin: "/expert/login",
      expertRegister: "/expert/register"
    }
  });
});

// Test route
app.get("/test", (req, res) => {
  res.json({ message: "Server is running" });
});

// Debug Routes (keep if useful in dev)
app.get("/debug/collections", async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    res.json(collections.map(col => col.name));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/debug/database", async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
    const collections = await mongoose.connection.db.listCollections().toArray();
    const assignmentCount = await Assignment.countDocuments();
    const sampleAssignment = await Assignment.findOne();

    res.json({
      status: dbStatus,
      collections: collections.map(c => c.name),
      assignmentCount,
      sampleAssignment
    });
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// Socket.IO Setup
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("joinRoom", (assignmentId) => {
    socket.join(assignmentId);
    console.log(`Socket ${socket.id} joined room ${assignmentId}`);
  });

  socket.on("chatMessage", async (msg) => {
    try {
      const sanitizedText = sanitizeHtml(msg.text || "", {
        allowedTags: [],
        allowedAttributes: {}
      }).trim();

      if (!sanitizedText) return;

      const newMessage = new ChatMessage({
        assignmentId: msg.assignmentId,
        senderId: msg.sender,
        senderModel: msg.senderModel,
        message: sanitizedText,
      });

      await newMessage.save();
      await newMessage.populate("senderId", "name username");

      io.to(msg.assignmentId).emit("message", {
        assignmentId: msg.assignmentId,
        sender: msg.sender,
        senderName: msg.senderName,
        text: sanitizedText,
        timestamp: newMessage.createdAt,
      });
    } catch (error) {
      console.error("Socket message error:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Error Handler
app.use(errorHandler);

// Start Server
server.listen(PORT, () => {
  console.log(`Server running with sockets on http://localhost:${PORT}`);
});
