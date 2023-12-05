// userModel.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userID: {
    type: String,
    required: true,
    unique: true,
  },
  // Other user schema fields...
});

const User = mongoose.model('User', userSchema);

module.exports = User;
