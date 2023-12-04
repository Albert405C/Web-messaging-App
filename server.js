const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const parse = require('csv-parse');
const fs = require('fs');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/messaging', {
 useNewUrlParser: true,
 useUnifiedTopology: true,
});

const messageSchema = new mongoose.Schema({
 sender: String,
 content: String,
 timestamp: { type: Date, default: Date.now },
 isRead: { type: Boolean, default: false },
 assignedAgent: { type: String, default: null },
 lockedBy: { type: String, default: null },
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

io.on('connection', (socket) => {
 console.log('Client connected');
});

const seedMessages = async () => {
 const messages = [];

 fs.writeFile('C:\\Users\\ADMIN\\OneDrive\\Desktop\\Messaging Web App\\UsersADMINOneDrive Documents\\messages.csv', '', (err) => {
    if (err) {
      console.error('An error occurred while creating the file:', err);
    } else {
      console.log('File created successfully.');
    }
 });

 fs.createReadStream("C:\Users\ADMIN\OneDrive\Documents\messages.csv")
    .pipe(parse())
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

app.get('/messages', async (req, res) => {
 const messages = await Message.find();
 res.json(messages);
});

app.post('/messages', async (req, res) => {
 const { sender, content, assignedAgent, lockedBy } = req.body;
 const newMessage = new Message({ sender, content, assignedAgent, lockedBy });
 await newMessage.save();

 io.emit('newMessage', newMessage);

 res.status(201).json(newMessage);
});

app.post('/messages/assign/:messageId/:agentId', async (req, res) => {
 const { messageId, agentId } = req.params;
 const message = await Message.findById(messageId);

 if (!message) {
    return res.status(404).json({ error: 'Message not found' });
 }

 if (message.lockedBy && message.lockedBy !== agentId) {
    return res.status(403).json({ error: 'Message is locked by another agent' });
 }

 message.assignedAgent = agentId;
 await message.save();

 io.emit('assignedMessage', message);

 res.json(message);
});

app.post('/messages/lock/:messageId/:agentId', async (req, res) => {
 const { messageId, agentId } = req.params;
 const message = await Message.findById(messageId);

 if (!message) {
    return res.status(404).json({ error: 'Message not found' });
 }

 if (message.assignedAgent !== agentId) {
    return res.status(403).json({ error: 'Message is not assigned to the requesting agent' });
 }

 message.lockedBy = agentId;
 await message.save();

 io.emit('lockedMessage', message);

 res.json(message);
});

app.post('/messages/unlock/:messageId/:agentId', async (req, res) => {
 const { messageId, agentId } = req.params;
 const message = await Message.findById(messageId);

 if (!message) {
    return res.status(404).json({ error: 'Message not found' });
 }

 if (message.lockedBy !== agentId) {
    return res.status(403).json({ error: 'Message is locked by another agent' });
 }

 message.lockedBy = null;
 await message.save();

 io.emit('unlockedMessage', message);

 res.json(message);
});

server.listen(port, () => {
 console.log(`Server is running on port ${port}`);
});