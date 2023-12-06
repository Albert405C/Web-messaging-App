// src/App.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

function App() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState({ sender: '', content: '' });

  useEffect(() => {
    // Fetch initial messages from the server
    axios.get('http://localhost:3000/messages')
      .then(response => setMessages(response.data))
      .catch(error => console.error(error));

    // Listen for 'newMessage' events from the server
    socket.on('newMessage', (newMessage) => {
      setMessages(prevMessages => [...prevMessages, newMessage]);
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
    axios.post('http://localhost:3000/messages', newMessage)
      .then(response => {
        // Clear the form and let Socket.IO handle real-time updates
        setNewMessage({ sender: '', content: '' });
      })
      .catch(error => console.error(error));
  };

  return (
    <div>
      <h1>Branch Messaging App</h1>
      <ul>
        {messages.map(message => (
          <li key={message._id}>
            <strong>{message.sender}:</strong> {message.content}
          </li>
        ))}
      </ul>

      {/* Form for sending new messages */}
      <form onSubmit={handleSubmit}>
        <label>
          Sender:
          <input
            type="text"
            name="sender"
            value={newMessage.sender}
            onChange={handleInputChange}
          />
        </label>
        <br />
        <label>
          Content:
          <input
            type="text"
            name="content"
            value={newMessage.content}
            onChange={handleInputChange}
          />
        </label>
        <br />
        <button type="submit">Send Message</button>
      </form>
    </div>
  );
}

export default App;
