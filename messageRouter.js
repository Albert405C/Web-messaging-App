const express = require('express');
const Message = require('./messageModel');

const router = express.Router();

// GET all messages
router.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find();
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new message
router.post('/messages', async (req, res) => {
  const message = new Message({
    customer_name: req.body.customer_name,
    customer_email: req.body.customer_email,
    message: req.body.message,
    timestamp: new Date(),
  });

  try {
    const savedMessage = await message.save();
    res.json(savedMessage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT a new response to a message
router.put('/messages/:id', async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    message.response = req.body.response;
    await message.save();
    res.json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = ro