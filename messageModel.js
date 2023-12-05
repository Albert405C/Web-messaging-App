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
        // Check if the message exists
        const message = await Message.findById(messageId);
  
        if (!message) {
          return callback({ error: 'Message not found' });
        }
  
        // Check if the agent (user) exists
        const isAgentExists = await User.exists({ userID: agentId });
  
        if (!isAgentExists) {
          return callback({ error: 'Agent not found' });
        }
  
        if (message.status === 'unassigned') {
          // Use $set to update specific fields without affecting others
          await message.updateOne({ $set: { status: 'assigned', agentId: agentId } });
  
          io.emit('messageAssigned', { messageId, agentId });
  
          callback({ success: true });
        } else {
          // Message is already assigned or completed
          callback({ error: 'Message already assigned or completed' });
        }
      } catch (error) {
        console.error('Error assigning message:', error);
  
        if (error.code === 11000) {
          // Handle duplicate key error (unique constraint violation) for 'userID'
          return callback({ error: 'Agent with the same userID already exists' });
        }
  
        callback({ error: 'Internal server error', details: error.message });
      }
    });
  };
  
  module.exports = { Message, User, initializeSocketListener };
  