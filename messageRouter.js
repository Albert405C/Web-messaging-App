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
router.post('/', async (req, res) => {
    const { sender, content } = req.body;
    if (!sender || !content) {
       return res.status(400).json({ error: 'Both Sender and Content are required' });
    }
    const newMessage = new Message({
       customer_name: sender,
       message: content,
    });
    await newMessage.save();
    res.status(201).json(newMessage);
   });

  try {
    const savedMessage = await message.save();
    res.json(savedMessage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }


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
