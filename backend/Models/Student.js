const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    password: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Add compound index for login
userSchema.index({ username: 1, email: 1 });

module.exports = mongoose.model('students', userSchema);
