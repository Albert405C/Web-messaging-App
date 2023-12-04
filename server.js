const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const messageRouter = require('./messageRouter');
const Message = require('./messageModel');
const fs = require('fs');
const csvParser = require('csv-parser');

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

const port = 3000;
const filePath = 'C:\\Users\\ADMIN\\OneDrive\\Desktop\\messages.csv';

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
});

// Seed messages
const seedMessages = async () => {
 const messages = [];
 fs.createReadStream(filePath)
    .pipe(csvParser())
    .on('data', (row) => {
      // Check if the required columns exist in the row
      if (row['User ID'] && row['Timestamp (UTC)'] && row['Message Body']) {
        const newMessage = new Message({
          _id: new mongoose.Types.ObjectId(), // Generate a new ObjectId
          customer_name: row['User ID'].toString(),
          customer_email: '', // You can leave customer_email empty or set it based on your data
          message: row['Message Body'],
          timestamp: new Date(row['Timestamp (UTC)']),
        });
        messages.push(newMessage);
      } else {
        console.error('Invalid row format:', row);
      }
    })
    .on('end', async () => {
      await Message.insertMany(messages);
      io.emit('seededMessages', messages);
    });
};

seedMessages();

// Use the routes from messageRouter
app.use('/api', messageRouter);

server.listen(port, () => {
 console.log(`Server is running on port ${port}`);
});