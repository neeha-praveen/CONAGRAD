const mongoose = require('mongoose');

const expertSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true
    },
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    bio: {
        type: String
      },
      expertise: {
        type: [String]
      },
      education: {
        type: String
      },
      experience: {
        type: String
      },
      date: {
        type: Date,
        default: Date.now
      },
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: false },
        sms: { type: Boolean, default: false }
      },
      appearance: { type: String, default: 'light' },
    });

module.exports = mongoose.model('experts', expertSchema); 