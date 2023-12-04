const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const csvParser = require('csv-parser');
const fs = require('fs');

const app = express();

// Mongoose connection
mongoose.connect('mongodb://localhost:27017/messaging', {
 useNewUrlParser: true,
 useUnifiedTopology: true,
});

// Mongoose schema
const messageSchema = new mongoose.Schema({
 sender: String,
 content: String,
 assignedAgent: String,
 lockedBy: String,
});

const Message = mongoose.model('Message', messageSchema);

const server = http.createServer(app);
const io = socketIo(server, {
 cors: {
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST'],
    credentials: true,
 },
});

// Seed messages
const seedMessages = async () => {
 const messages = [];
 fs.writeFile('C:/Users/ADMIN/OneDrive/Desktop/Messaging Web App/UsersADMINOneDrive Documents/messages.csv', '', (err) => {
    if (err) {
      console.error('An error occurred while creating the file:', err);
    } else {
      console.log('File created successfully.');
    }
 });

 fs.createReadStream("C:/Users/ADMIN/OneDrive/Documents/messages.csv")
    .pipe(csvParser())
    .on('data', (row) => {
      const newMessage = new Message({
        sender: row.sender,
        content: row.content,
      });
      messages.push(newMessage);
    })
    .on('end', async () => {
      await Message.insertMany(messages);
    });
};

seedMessages();

// Socket.io connections
io.on('connection', (socket) => {
 console.log('Client connected');

 // Join room
 socket.on('joinRoom', (room) => {
    socket.join(room);
 });

 // Send new message
 socket.on('sendMessage', async (data) => {
    const { sender, content, assignedAgent, lockedBy } = data;
    const newMessage = new Message({ sender, content, assignedAgent, lockedBy });
    await newMessage.save();

    // Emit new message to room
    io.to(newMessage.assignedAgent).emit('newMessage', newMessage);
 });

 // Send assigned message
 socket.on('assignMessage', async (data) => {
    const { messageId, agentId } = data;
    const message = await Message.findById(messageId);

    if (!message) {
      return io.to(agentId).emit('error', 'Message not found');
    }

    if (message.lockedBy && message.lockedBy !== agentId) {
      return io.to(agentId).emit('error', 'Message is locked by another agent');
    }

    message.assignedAgent = agentId;
    await message.save();

    // Emit assigned message to room
    io.to(message.assignedAgent).emit('assignedMessage', message);
 });

 // Send locked message
 socket.on('lockMessage', async (data) => {
    const { messageId, agentId } = data;
    const message = await Message.findById(messageId);

    if (!message) {
      return io.to(agentId).emit('error', 'Message not found');
    }

    if (message.assignedAgent !== agentId) {
      return io.to(agentId).emit('error', 'Message is not assigned to the requesting agent');
    }

    message.lockedBy = agentId;
    await message.save();

    // Emit locked message to room
    io.to(message.assignedAgent).emit('lockedMessage', message);
 });

 // Send unlocked message
 socket.on('unlockMessage', async (data) => {
    const { messageId, agentId } = data;
    const message = await Message.findById(messageId);

    if (!message) {
      return io.to(agentId).emit('error', 'Message not found');
    }

    if (message.lockedBy !== agentId) {
      return io.to(agentId).emit('error', 'Message is not locked by the requesting agent');
    }

    message.lockedBy = null;
    await message.save();

    // Emit unlocked message to room
    io.to(message.assignedAgent).emit('unlockedMessage', message);
 });

 socket.on('disconnect', () => {
    console.log('Client disconnected');
 });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));