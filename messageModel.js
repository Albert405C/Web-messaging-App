// messageModel.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  customer_name: String,
  customer_email: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
  isUrgent: { type: Boolean, default: false },
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
