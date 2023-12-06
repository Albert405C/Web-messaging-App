// server.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const { parse } = require("csv-parse");

const cors = require('cors');
const messageRouter = require('./messageRouter.js');

const PORT = process.env.PORT || 3000;
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
  const data = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream("C:\\Users\\ADMIN\\OneDrive\\Desktop\\messages.csv")
      .pipe(parse({ delimiter: ",", from_line: 2 }))
      .on("data", async function (row) {
        try {
          const userId = row[0].toString();
          const messageBody = row[1].toString(); // Assuming the second column contains messageBody

          const newMessage = new Message({
            userId,
            messageBody,
          });

          const savedMessage = await newMessage.save();
          data.push(savedMessage);
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
          io.emit('seededMessages', data); // Emit event to notify clients about seeded messages
          resolve(data);
        } catch (error) {
          console.error("Error saving CSV data to MongoDB:", error);
          reject(error);
        }
      });
  });
};

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Client connected');

  // ... (existing code)

  // Listen for 'messageAdded' event from the client
  socket.on('newMessage', async (newMessage) => {
    try {
      const message = new Message(newMessage);
      const savedMessage = await message.save();
      io.emit('messageAdded', savedMessage); // Broadcast the new message to all clients
    } catch (error) {
      console.error("Error saving new message to MongoDB:", error);
    }
  });

  // ... (existing code)
});

app.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find();
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to fetch messages');
  }
});

app.use('/', messageRouter);

// Endpoint to seed messages from CSV to MongoDB
app.post('/seed-messages', async (req, res) => {
  try {
    const seededMessages = await seedMessages();
    res.json(seededMessages);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to seed messages');
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
