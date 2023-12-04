const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');  // Import the cors middleware

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Use CORS middleware
app.use(cors());

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
const io = socketIo(server);

io.on('connection', (socket) => {
  console.log('Client connected');
});

// Simulate the presence of 50+ messages in the database
const seedMessages = async () => {
  for (let i = 1; i <= 50; i++) {
    const newMessage = new Message({
      sender: `Customer ${i}`,
      content: `This is message number ${i}`,
    });
    await newMessage.save();
  }
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
  // ... (unchanged)
});

// Lock a message for an agent
app.post('/messages/lock/:messageId/:agentId', async (req, res) => {
  // ... (unchanged)
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
