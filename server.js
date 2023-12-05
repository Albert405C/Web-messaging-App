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

          // Create the message data
          const messageData = {
            text: messageBody,
            sender: new mongoose.Types.ObjectId(user._id), // Use the ObjectId of the found or created user
            conversation: new mongoose.Types.ObjectId(), // You might want to replace this with a real conversation ID
            timestamp: new Date(),
            status: 'unassigned',
        };
       // CSV Parsing and Saving to MongoDB
// CSV Parsing and Saving to MongoDB
const seedMessages = async () => {
  const data = [];

  try {
    const stream = fs.createReadStream("C:\\Users\\ADMIN\\OneDrive\\Desktop\\messages.csv")
      .pipe(parse({ delimiter: ",", from_line: 2 }));

    const rows = await new Promise((resolve, reject) => {
      const rows = [];
      stream
        .on("data", (row) => rows.push(row))
        .on("error", (error) => reject(error))
        .on("end", () => resolve(rows));
    });

    for (const row of rows) {
      const userId = row[0].toString();
      const timestamp = new Date(row[1]);
      const messageBody = row[2];

      // Find or create the user based on userID
      let user = await User.findOne({ userID: userId });

      if (!user) {
        user = new User({ userID: userId });
        await user.save();
      }

      // Create the message data
      const messageData = {
        text: messageBody,
        sender: new mongoose.Types.ObjectId(user._id),
        conversation: new mongoose.Types.ObjectId(),
        timestamp: new Date(),
        status: 'unassigned',
      };

      data.push(messageData);
    }

    await Message.insertMany(data);
    console.log("CSV data saved to MongoDB");
  } catch (error) {
    console.error("Error processing CSV:", error);
  }
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