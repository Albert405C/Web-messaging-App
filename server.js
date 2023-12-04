const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const csv = require('csv-parser');

const app = express();

const port = 3000;

// Use the cors middleware
app.use(cors());

app.use(bodyParser.json());

mongoose.connect('mongodb://localhost/Messaging-Web-App', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

fs.createReadStream('C:\\Users\\ADMIN\\OneDrive\\Documents\\messages.csv')
  .pipe(csv())
  .on('data', async (row) => {
    // Save each row as a message in the database
    const newMessage = new Message(row);
    await newMessage.save();
  })
  .on('end', () => {
    console.log('CSV file successfully processed and messages imported.');
  });

const messageSchema = new mongoose.Schema({
  sender: String,
  content: String,
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
});

const Message = mongoose.model('Message', messageSchema);

const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
  console.log('Client connected');
});



app.get('/messages', async (req, res) => {
  // Set CORS headers in the response
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  const messages = await Message.find();
  res.json(messages);
});

app.post('/messages', async (req, res) => {
  // Set CORS headers in the response
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  const { sender, content } = req.body;
  const newMessage = new Message({ sender, content });
  await newMessage.save();

  io.emit('newMessage', newMessage);

  res.status(201).json(newMessage);
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
