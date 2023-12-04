const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const csvParser = require('csv-parser');
const fs = require('fs');
const http = require('http');
const socketIo = require('socket.io');
const PORT = process.env.PORT || 3000;
const port = 3000;
const app = express();
const path = require ('path');
const filePath = path.join(__dirname, 'UsersADMINOneDrive Documents', 'messages.csv');


app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
 });
 

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
  fs.createReadStream("C:\Users\ADMIN\OneDrive\Documents\messages.csv")  // Use the correct file path variable
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
      io.emit('seededMessages', messages);  // Emit event after seeding messages
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

server.listen(port, () => {
 console.log(`Server is running on port ${port}`);
});