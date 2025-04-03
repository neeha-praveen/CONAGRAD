const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Expert = require("./Models/Expert");

const app = express();
const PORT = 4000;

app.use(express.json()); // Enable JSON body parsing
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
})); // Enable CORS

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/conagrad", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define a User Schema
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  username: String,
  password: String,
});

const User = mongoose.model("students", UserSchema);

// REGISTER ROUTE
app.post("/register", async (req, res) => {
  try {
    const { name, email, username, password } = req.body;

    if (!name || !email || !username || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const newUser = new User({ name, email, username, password });
    await newUser.save();

    res.status(201).json({ 
      message: "Registration successful! Redirecting to login...",
      redirectTo: "/login"
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// LOGIN ROUTE
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and Password are required" });
    }

    const user = await User.findOne({ username, password });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.status(200).json({ message: "Login successful! Redirecting to dashboard...", redirectTo: "/dashboard" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Add these expert routes alongside your existing routes
app.post("/expert/register", async (req, res) => {
  try {
    const { name, email, username, password } = req.body;

    if (!name || !email || !username || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingExpert = await Expert.findOne({ username });
    if (existingExpert) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const newExpert = new Expert({ name, email, username, password });
    await newExpert.save();

    res.status(201).json({ 
      message: "Registration successful! Redirecting to login...",
      redirectTo: "/expert-login"
    });
  } catch (error) {
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

app.post("/expert/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and Password are required" });
    }

    const expert = await Expert.findOne({ username, password });
    if (!expert) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.status(200).json({ 
      message: "Login successful! Redirecting to dashboard...",
      redirectTo: "/expert-dashboard"
    });
  } catch (error) {
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// START SERVER
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});