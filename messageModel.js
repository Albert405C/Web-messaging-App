const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the Message schema
const messageSchema = new Schema({
 text: { type: String, required: true },
 timestamp: { type: Date, default: Date.now },
 status: { type: String, default: 'unassigned' },
}, { collection: 'users' }); // Specify the collection name here

const Message = mongoose.model('Message', messageSchema); // No need to pass the collection name here

module.exports = { Message };