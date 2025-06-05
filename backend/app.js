const express = require('express');
const app = express();
const studentRoutes = require('./routes/student'); // or './routes/studentRoutes'
const authRoutes = require('./routes/auth');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploads
app.use('/uploads', express.static('uploads'));

// Route registrations
app.use('/api/student', studentRoutes);
app.use('/api/auth', authRoutes);

// Server setup
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});