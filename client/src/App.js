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

  return (
    <div className="container mt-4">
      {/* ... (existing code) */}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="userId" className="form-label">
            User ID:
            <input
              type="text"
              className="form-control"
              id="userId"
              name="userId"
              value={newMessage.userId}
              onChange={handleInputChange}
            />
          </label>
        </div>
        <div className="mb-3">
          <label htmlFor="messageBody" className="form-label">
            Message Body:
            <input
              type="text"
              className="form-control"
              id="messageBody"
              name="messageBody"
              value={newMessage.messageBody}
              onChange={handleInputChange}
            />
          </label>
        </div>
        <button type="submit" className="btn btn-primary">
          Send Message
        </button>
      </form>
    </div>
  );
}
export default App;