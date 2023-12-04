const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  customer_name: String,
  customer_email: String,
  message: String,
  response: String,
  timestamp: Date,
});

module.exports = mongoose.model('Message', messageSchema);
