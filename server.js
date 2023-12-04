const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const parse = require('csv-parser/lib/sync');


const app = express();
const port = 3000;

// Use CORS middleware for the entire app
app.use(cors({
  origin: 'http://localhost:3001',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
}));


app.use(bodyParser.json());

mongoose.connect('mongodb://localhost/branch-messaging-app', {
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
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('Client connected');
});
const seedMessages = async () => {
  const messages = [];

  // Assuming your CSV file is named 'yourfile.csv'
  fs.createReadStream("C:\Users\ADMIN\OneDrive\Documents\messages.csv")
    .pipe(parse())
    .on('data', (row) => {
      // Create a new message based on the CSV row
      const newMessage = new Message({
        sender: row.sender,
        content: row.content,
        // Add other fields if needed
      });
      messages.push(newMessage);
    })
    .on('end', async () => {
      // Save all messages to the MongoDB collection
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

// Assign a message to an agent
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

// Lock a message for an agent
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

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
