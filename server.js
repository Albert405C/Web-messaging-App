const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const { parse } = require("csv-parse");

const User = require("C:\\Users\\ADMIN\\OneDrive\\Desktop\\Messaging Web App\\userModel.js"); // Import the User model
const fs = require('fs');
const csvParser = require('csv-parser');
const cors = require('cors');
const messageRouter = require('./messageRouter.js');
const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const Message = require("C:\\Users\\ADMIN\\OneDrive\\Desktop\\Messaging Web App\\messageModel.js");
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
const seedUsers = async () => {
  const data = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream("C:\\Users\\ADMIN\\OneDrive\\Desktop\\messages.csv")
      .pipe(parse({ delimiter: ",", from_line: 2 }))
      .on("data", async function (row) {
        try {
          const userId = row[0].toString();
          const timestamp = new Date(row[1]);
          const messageBody = row[2];

          // Create the user data
          const userData = {
            userID: userId,
            timestamp: timestamp,
            messageBody: messageBody,
          };

          data.push(userData);
        } catch (error) {
          console.error("Error processing CSV row:", error);
          reject(error);
        }
      })
      .on("error", function (error) {
        console.log(error.message);
        reject(error);
      })
      .on("end", async function () {
        try {
          // Insert users into the 'users' collection
          await User.insertMany(data);
          console.log("CSV data saved to MongoDB");
          resolve(data);
        } catch (error) {
          console.error("Error saving CSV data to MongoDB:", error);
          reject(error);
        }
      });
  });
};

// Call the seedUsers function to insert user data
seedUsers();

// Socket.io connection
// ... (existing code)

// Endpoint to fetch users from the "messaging_app" database
app.get('/users', async (req, res) => {
  try {
    const users = await User.find(); // Fetch users from the "users" collection
    // Sort users or perform any other processing as needed
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ... (existing code)

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Client connected');

  // ... (existing code)

  // Listen for 'messageAdded' event from the client
  socket.on('newMessage', (newMessage) => {
    // ... (existing code)
    io.emit('messageAdded', newMessage);
  });

  // ... (existing code)
});

// Endpoint to fetch messages from the "messaging_app" database
app.get('/messages', async (req, res) => {
  try {
    const messages = await User.find(); // Fetch users from the "users" collection
    // Sort users or perform any other processing as needed
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.use('/', messageRouter);
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
