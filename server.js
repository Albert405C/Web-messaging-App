const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const messageRouter = require('./messageRouter');
const Message = require('./messageModel');
const fs = require('fs');
const csvParser = require('csv-parser');
const cors = require('cors');
const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
app.use(cors({ origin: 'http://localhost:3001' }));
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// MongoDB connection
mongoose.connect('mongodb://localhost/messaging_app', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Client connected');

  // Socket event handler for new messages
  socket.on('newMessage', async (data, callback) => {
    const { userId, messageBody } = data;

    if (!userId || !messageBody) {
      return console.error('Invalid message data');
    }

    const newMessage = new Message({
      customer_name: userId.toString(),
      customer_email: '', // You can leave customer_email empty or set it based on your data
      message: messageBody,
      timestamp: new Date(),
    });

    // Implement basic authentication
    if (!socket.handshake.session.loggedIn) {
      return callback({ error: 'Unauthorized access' });
    }

    try {
      await newMessage.save();
      io.emit('messageAdded', newMessage);
      callback({ success: true });
    } catch (error) {
      console.error('Error saving message:', error);
      callback({ error: 'Internal server error' });
    }
  });

  // Socket event handler for assigning messages to agents
  socket.on('assignMessage', async (data, callback) => {
    const { messageId, agentId } = data;

    try {
      const message = await Message.findById(messageId);

      if (!message) {
        return callback({ error: 'Message not found' });
      }

      if (message.status === 'unassigned') {
        // Assign the message to the agent
        message.status = 'assigned';
        message.agentId = agentId;

        await message.save();
        io.emit('messageAssigned', { messageId, agentId });

        callback({ success: true });
      } else {
        // Message is already assigned or completed
        callback({ error: 'Message already assigned or completed' });
      }
    } catch (error) {
      console.error('Error assigning message:', error);
      callback({ error: 'Internal server error' });
    }
  });

  // Rest of your existing socket.io connection handling code
});

// Endpoint to seed messages from CSV file
app.get('/seed-messages', async (req, res) => {
  try {
    const seededMessages = await seedMessages();  // Assuming seedMessages returns the seeded messages
    io.emit('seededMessages', seededMessages);  // Emit the 'seededMessages' event to connected clients
    res.json({ success: true, message: 'Messages seeded successfully' });
  } catch (error) {
    console.error('Error seeding messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to get messages
app.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find();
    // Sort messages based on urgency (this is just an example, adjust as needed)
    const sortedMessages = messages.sort((a, b) => (a.isUrgent ? -1 : 1));
    res.json(sortedMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Use the routes from messageRouter
app.use('/', messageRouter);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
