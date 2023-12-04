const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  customer_name: String,
  customer_email: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
  isUrgent: { type: Boolean, default: false },
});

const Message = mongoose.model('Message', messageSchema);

// Define a function that takes 'socket' as a parameter
const initializeSocketListener = (socket) => {
  socket.on('assignMessage', async (data, callback) => {
    const { messageId, agentId } = data;

    try {
      const message = await Message.findById(messageId);

      if (!message) {
        return callback({ error: 'Message not found' });
      }

      if (message.status === 'unassigned') {
        // Assign the message to the agent
        message.status = 'assigned';
        message.agentId = agentId;

        await message.save();
        io.emit('messageAssigned', { messageId, agentId });

        callback({ success: true });
      } else {
        // Message is already assigned or completed
        callback({ error: 'Message already assigned or completed' });
      }
    } catch (error) {
      console.error('Error assigning message:', error);
      callback({ error: 'Internal server error' });
    }
  });
};

module.exports = { Message, initializeSocketListener };
