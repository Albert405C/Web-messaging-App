// messageRouter.js
const express = require('express');
const router = express.Router();
const { Message } = require('./messageModel'); // Adjust the path accordingly

// GET all messages
router.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find();
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new customer message
router.post('/messages', async (req, res) => {
  const { userId, messageBody } = req.body;

  const newMessage = new Message({
    userId,
    messageBody,
  });

  try {
    const savedMessage = await newMessage.save();
    io.emit('messageAdded', savedMessage); // Emit event to notify clients about the new message
    res.json(savedMessage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
