const mongoose = require('mongoose');
const { Schema } = mongoose;
const { User } = require("C:\\Users\\ADMIN\\OneDrive\\Desktop\\Messaging Web App\\userModel.js");


// Define the Message schema
const messageSchema = new Schema({
  text: { type: String, required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  conversation: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, default: 'unassigned' },
});

const Message = mongoose.model('Message', messageSchema, 'messages');

// Define a function that takes 'socket' and 'io' as parameters
const initializeSocketListener = (socket, io) => {
    socket.on('assignMessage', async (data, callback) => {
      const { messageId, agentId } = data;
  
      try {
        const message = await Message.findById(messageId);
  
        if (!message) {
          return callback({ error: 'Message not found' });
        }
  
        const isAgentExists = await User.exists({ userID: agentId });
  
        if (!isAgentExists) {
          return callback({ error: 'Agent not found' });
        }
  
        if (message.status === 'unassigned') {
          // Use async/await directly on updateOne
          await message.updateOne({ $set: { status: 'assigned', agentId: agentId } });
  
          io.emit('messageAssigned', { messageId, agentId });
  
          callback({ success: true });
        } else {
          callback({ error: 'Message already assigned or completed' });
        }
      } catch (error) {
        console.error('Error assigning message:', error);
  
        if (error.code === 11000) {
          callback({ error: 'Agent with the same userID already exists' });
        } else {
          callback({ error: 'Internal server error', details: error.message });
        }
      }
    });
  };
  
  module.exports = { Message, User, initializeSocketListener };
  
  
  module.exports = { Message, User, initializeSocketListener };
  