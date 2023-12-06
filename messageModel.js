// messageModel.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the Message schema
const messageSchema = new Schema({
  text: { type: String, required: true },
  // sender: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Commented out or removed
  timestamp: { type: Date, default: Date.now },
  status: { type: String, default: 'unassigned' },
});


const Message = mongoose.model('Message', messageSchema, 'messages');

const initializeSocketListener = (socket, io) => {
  // You can keep other socket listeners if needed
};

module.exports = { Message, initializeSocketListener };
