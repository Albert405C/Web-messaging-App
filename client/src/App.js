// App.js

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
  const [newMessage, setNewMessage] = useState({ userId: '', messageBody: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch initial messages from the server
    axios.get('http://localhost:3000/messages')
      .then(response => {
        setMessages(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error(error);
        setError('Error fetching messages');
        setLoading(false);
      });

    // Listen for 'messageAdded' events from the server
    socket.on('messageAdded', (newMessage) => {
      setMessages(prevMessages => [newMessage, ...prevMessages]);
    });

    // Listen for 'seededMessages' events from the server
    socket.on('seededMessages', (seededMessages) => {
      console.log('Received seededMessages:', seededMessages);
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

    // Emit 'newMessage' event to the server
    socket.emit('newMessage', { userId: newMessage.userId, messageBody: newMessage.messageBody }, (response) => {
      // Handle the acknowledgment from the server (if needed)
      console.log(response);
    });

    // Clear the form
    setNewMessage({ userId: '', messageBody: '' });
  };

  const handleSeedMessages = () => {
    // Seed messages from CSV to MongoDB
    axios.post('http://localhost:3000/seed-messages')
      .then(response => {
        console.log('Seeded messages:', response.data);
      })
      .catch(error => {
        console.error(error);
      });
  };

  return (
    <div className="container mt-4">
      {/* ... (existing code) */}
      <button className="btn btn-primary" onClick={handleSeedMessages}>
        Seed Messages
      </button>
      <form onSubmit={handleSubmit}>
        {/* ... (existing code) */}
      </form>
    </div>
  );
}

export default App;
