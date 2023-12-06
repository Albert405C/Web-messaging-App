// messageRouter.js
const express = require('express');
const router = express.Router();
const { Message } = require('./messageModel'); // Adjust the path accordingly
const app = require('./server.js');
app.get('/messages', async (req, res) => {
  try {
     const messages = await Message.find();
     res.json(messages);
  } catch (error) {
     console.error(error);
     res.status(500).send('Failed to fetch messages');
  }
 });
 app.post('/messages', async (req, res) => {
  try {
     const newMessage = new Message(req.body);
     const savedMessage = await newMessage.save();
     res.json(savedMessage);
  } catch (error) {
     console.error(error);
     res.status(500).send('Failed to create new message');
  }
 });
 app.put('/messages/:id', async (req, res) => {
  try {
     const updatedMessage = await Message.findByIdAndUpdate(req.params.id, req.body, { new: true });
     res.json(updatedMessage);
  } catch (error) {
     console.error(error);
     res.status(500).send('Failed to update message');
  }
 });
 app.delete('/messages/:id', async (req, res) => {
  try {
     await Message.findByIdAndDelete(req.params.id);
     res.status(204).send();
  } catch (error) {
     console.error(error);
     res.status(500).send('Failed to delete message');
  }
 });
module.exports = router;
