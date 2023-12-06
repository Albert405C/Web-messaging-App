// messageModel.js

const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the Message schema
const messageSchema = new Schema({
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, default: 'unassigned' },
});

const Message = mongoose.model('Message', messageSchema, 'users');  // Use the correct collection name

module.exports = { Message };
