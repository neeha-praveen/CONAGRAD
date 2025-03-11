const mongoose = require('mongoose');

const expertSchema = new mongoose.Schema({
    name: String,
    email: String,
    username: String,
    password: String
});

module.exports = mongoose.model('experts', expertSchema); 