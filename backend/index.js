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

const { initializeSocket } = require("./utils/socketManager");

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

// Socket.IO Setup
const server = http.createServer(app);
const io = initializeSocket(server);

// Error Handler
app.use(errorHandler);

// Start Server
server.listen(PORT, () => {
  console.log(`Server running with sockets on http://localhost:${PORT}`);
});
