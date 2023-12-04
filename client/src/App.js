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
    // Fetch initial messages from the server
    axios.get('http://localhost:3000/messages')
      .then(response => setMessages(response.data))
      .catch(error => console.error(error));

    // Listen for 'newMessage' events from the server
    socket.on('newMessage', (newMessage) => {
      setMessages(prevMessages => [newMessage, ...prevMessages]);
    });

    // Listen for 'assignedMessage' events from the server
    socket.on('assignedMessage', (assignedMessage) => {
      setMessages(prevMessages => prevMessages.map(message =>
        (message._id === assignedMessage._id ? assignedMessage : message)
      ));

      // Prompt the user to lock the message after assigning
      alert('Message assigned. Please lock the message to start working on it.');
    });

    // Listen for 'lockedMessage' events from the server
    socket.on('lockedMessage', (lockedMessage) => {
      setMessages(prevMessages => prevMessages.map(message =>
        (message._id === lockedMessage._id ? lockedMessage : message)
      ));
    });

    // Listen for 'seededMessages' events from the server
    socket.on('seededMessages', (seededMessages) => {
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
    axios.post('http://localhost:3000/messages', { ...newMessage, assignedAgent: null, lockedBy: null })
      .then(response => {
        // Clear the form and let Socket.IO handle real-time updates
        setNewMessage({ sender: '', content: '' });
      })
      .catch(error => console.error(error));
  };

  const assignMessage = (messageId, agentId) => {
    axios.post(`http://localhost:3000/messages/assign/${messageId}/${agentId}`)
      .catch(error => console.error(error));
  };

  const lockMessage = (messageId, agentId) => {
    axios.post(`http://localhost:3000/messages/lock/${messageId}/${agentId}`)
      .catch(error => console.error(error));
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Branch Messaging App</h1>
      <div className="row">
        <div className="col-md-8">
          <ul className="list-group">
            {messages.map(message => (
              <li key={message._id} className="list-group-item">
                <strong>{message.sender}:</strong> {message.content}
                {!message.assignedAgent && (
                  <button
                    className="btn btn-sm btn-success ms-2"
                    onClick={() => assignMessage(message._id, 'locked by Albert')}
                  >
                    Assign
                  </button>
                )}
                {message.assignedAgent === 'Albert' && !message.lockedBy && (
                  <button
                    className="btn btn-sm btn-warning ms-2"
                    onClick={() => lockMessage(message._id, 'agent123')}
                  >
                    Lock
                  </button>
                )}
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
