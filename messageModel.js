const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the Message schema
const messageSchema = new Schema({
 text: { type: String, required: true },
 timestamp: { type: Date, default: Date.now },
 status: { type: String, default: 'unassigned' },
}, { collection: 'users' }); // Specify the collection name here
messageSchema.statics.createMessage = async function(message) {
  return await this.create(message);
};

messageSchema.statics.getAllMessages = async function() {
  return await this.find().sort({ createdAt: -1 });
};

messageSchema.statics.getMessageById = async function(id) {
  return await this.findById(id);
};

messageSchema.statics.updateMessageById = async function(id, message) {
  return await this.findByIdAndUpdate(id, message, { new: true });
};

messageSchema.statics.deleteMessageById = async function(id) {
  return await this.findByIdAndDelete(id);
};
const Message = mongoose.model('Message', messageSchema); // No need to pass the collection name here

module.exports = { Message };