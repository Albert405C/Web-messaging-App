// userModel.js
const mongoose = require('mongoose');
const { User } = require('./userModel.js');

const userSchema = new mongoose.Schema({
  userID: {
    type: String,
    required: true,
    unique: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  messageBody: {
    type: String,
    required: true,
  },
  // Add other fields as needed...
});

const User = mongoose.model('User', userSchema);

module.exports = { User };
