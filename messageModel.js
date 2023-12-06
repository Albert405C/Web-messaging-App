// messageModel.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the Message schema
const messageSchema = new Schema({
  userId: { type: String, required: true },
  messageBody: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, default: 'unassigned' },
});

const Message = mongoose.model('Message', messageSchema, 'messages');

const initializeSocketListener = (socket, io) => {
  // You can keep other socket listeners if needed
};

module.exports = { Message, initializeSocketListener };
