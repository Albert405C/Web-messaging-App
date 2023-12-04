// client/src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import 'bootstrap/dist/css/bootstrap.min.css';

const socket = io('http://localhost:3000', {
  withCredentials: true,
  extraHeaders: {
    "my-custom-header": "some-value"
  }
});

function App() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState({ sender: '', content: '' });

  useEffect(() => {
    console.log('Messages:', messages);
    // Fetch initial messages from the server
    axios.get('http://localhost:3000/messages')
    .then(response => {
      console.log('Received messages from server:', response.data);
      setMessages(response.data);
    })
    .catch(error => console.error(error));
      

  
    // Listen for 'newMessage' events from the server
    socket.on('newMessage', (newMessage) => {
      console.log('Received new message:', newMessage);
      setMessages(prevMessages => [newMessage, ...prevMessages]);
    });

    // Listen for 'seededMessages' events from the server
    socket.on('seededMessages', (seededMessages) => {
      console.log('Received seeded messages:', seededMessages);
      // Update the state with the seeded messages
      setMessages(seededMessages);
    });

    return () => {
      // Disconnect the socket when the component unmounts
      socket.disconnect();
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMessage(prevMessage => ({ ...prevMessage, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simulate sending a message to the server
    axios.post('http://localhost:3000/messages', { ...newMessage })
      .then(response => {
        // Clear the form and let Socket.IO handle real-time updates
        setNewMessage({ sender: '', content: '' });
      })
      .catch(error => console.error(error));
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Branch Messaging App</h1>
      <div className="row">
        <div className="col-md-8">
          <ul className="list-group">
            {messages.map(message => (
              <li key={message._id} className={`list-group-item ${message.isUrgent ? 'urgent-message' : ''}`}>
                <strong>{message.sender}:</strong> {message.content}
              </li>
            ))}
          </ul>
        </div>
        <div className="col-md-4">
          {/* Form for sending new messages */}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label" htmlFor="sender">Sender:</label>
              <input
                type="text"
                className="form-control"
                id="sender"
                name="sender"
                value={newMessage.sender}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Content:</label>
              <input
                type="text"
                className="form-control"
                name="content"
                value={newMessage.content}
                onChange={handleInputChange}
              />
            </div>
            <button type="submit" className="btn btn-primary">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
