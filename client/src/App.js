import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

function App() {
  const [messages, setMessages] = useState([]);

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
    </div>
  );
}

export default App;
