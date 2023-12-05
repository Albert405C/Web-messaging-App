const express = require('express');
const  { Message } = require("C:\\Users\\ADMIN\\OneDrive\\Desktop\\Messaging Web App\\messageModel.js");

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
// Add this route in your messageRouter.js

// POST a new customer message
router.post('/customer/messages', async (req, res) => {
  const customerMessage = new Message({
    text: req.body.text,
    timestamp: new Date(),
    status: 'unassigned',
  });

  try {
    const savedMessage = await customerMessage.save();
    io.emit('messageAdded', savedMessage);
    res.json(savedMessage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ... (existing code)


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

module.exports = router;