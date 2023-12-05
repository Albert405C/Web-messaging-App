const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const { parse } = require("csv-parse");
const  { Message } = require("C:\\Users\\ADMIN\\OneDrive\\Desktop\\Messaging Web App\\messageModel.js");
const User = require("C:\\Users\\ADMIN\\OneDrive\\Desktop\\Messaging Web App\\userModel.js"); // Import the User model
const fs = require('fs');
const csvParser = require('csv-parser');
const cors = require('cors');
const messageRouter = require('./messageRouter.js');
const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
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
mongoose.connect('mongodb://localhost:27017/messaging_app', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// CSV Parsing and Saving to MongoDB

const seedMessages = async () => {
  const messages = [];

  // Read the CSV file
  fs.createReadStream("C:\\Users\\ADMIN\\OneDrive\\Desktop\\messages.csv")
    .pipe(csv-parse({ separator: '\t' })) // Adjust the separator based on your CSV file
    .on('data', (row) => {
      // Process each row from the CSV file
      const newMessage = new Message({
        sender: `User ${row['User ID']}`,
        content: `${row['Timestamp (UTC)']} - ${row['Message Body']}`,
      });
      messages.push(newMessage);
    })
    .on('end', async () => {
      // Save all messages to the database
      for (const message of messages) {
        await message.save();
      }
    });
};

seedMessages();

// ... (rest of your code)


// Socket.io connection
io.on('connection', (socket) => {
  console.log('Client connected');

  // Emit 'seededMessages' event after saving CSV data to MongoDB
  seedMessages()
    .then((seededMessages) => {
      io.emit('seededMessages', seededMessages);
    })
    .catch((error) => {
      console.error('Error seeding messages:', error);
    });

  // Rest of your existing socket.io connection handling code
});

// Endpoint to fetch messages from the "messaging_app" database
app.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find();
    // Sort messages or perform any other processing as needed
    res.json(messages);
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