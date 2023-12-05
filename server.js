const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const { parse } = require("csv-parse");
const Message = require('./messageModel');
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
mongoose.connect('mongodb://localhost/messaging_app', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// CSV Parsing and Saving to MongoDB
const seedMessages = async () => {
  const data = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream("C:\\Users\\ADMIN\\OneDrive\\Desktop\\messages.csv")
      .pipe(parse({ delimiter: ",", from_line: 2 }))
      .on("data", function (row) {
        data.push(row);
      })
      .on("error", function (error) {
        console.log(error.message);
        reject(error);
      })
      .on("end", async function () {
        try {
          const messages = data.map((row) => ({
            customer_name: row[0].toString(),
            message: row[2],
            timestamp: new Date(row[1]),
          }));

          await Message.insertMany(messages);
          console.log("CSV data saved to MongoDB");
          resolve(messages);
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

// Endpoint to fetch messages from the database
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
