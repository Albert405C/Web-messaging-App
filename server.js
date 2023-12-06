const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const { parse } = require("csv-parse");


const fs = require('fs');
const csvParser = require('csv-parser');
const cors = require('cors');
const messageRouter = require('./messageRouter.js');
const PORT = process.env.PORT || 3000;
port = 3000;
const app = express();
const server = http.createServer(app);
const Message = require('./messageModel.js');
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors({ origin: 'http://localhost:3001' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/messaging', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// CSV Parsing and Saving to MongoDB
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

// Socket.io connection
// ... (existing code)

// Endpoint to fetch users from the "messaging_app" database


// ... (existing code)

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Client connected');

  // ... (existing code)

  // Listen for 'messageAdded' event from the client
  socket.on('newMessage', (newMessage) => {
    io.emit('messageAdded', newMessage); // Broadcast the new message to all clients
  });

  // ... (existing code)
});


app.post('/messages', async (req, res) => {
  const { sender, content } = req.body;
  const newMessage = new Message({ sender, content });
  await newMessage.save();

  io.emit('newMessage', newMessage);

  res.status(201).json(newMessage);
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

app.use('/', messageRouter);
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
