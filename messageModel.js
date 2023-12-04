const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  customer_name: String,
  customer_email: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
  isUrgent: { type: Boolean, default: false },
  status: { type: String, default: 'unassigned' }, // Add status field
  agentId: String, // Assuming agentId is a string, adjust as needed
});

const Message = mongoose.model('Message', messageSchema);

// Define a function that takes 'socket' and 'io' as parameters
const initializeSocketListener = (socket, io) => {
  socket.on('assignMessage', async (data, callback) => {
    const { messageId, agentId } = data;

    try {
      const message = await Message.findById(messageId);

      if (!message) {
        return callback({ error: 'Message not found' });
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
      callback({ error: 'Internal server error', details: error.message });
    }
  });
};

module.exports = mongoose.model('Message', MessageSchema);
