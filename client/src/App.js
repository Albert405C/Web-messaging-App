import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import 'bootstrap/dist/css/bootstrap.min.css';

const socket = io('http://localhost:3000');

function App() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState({ sender: '', content: '' });

  useEffect(() => {
    axios.get('http://localhost:3000/messages')
      .then(response => setMessages(response.data))
      .catch(error => console.error(error));

    socket.on('newMessage', (newMessage) => {
      setMessages(prevMessages => [...prevMessages, newMessage]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMessage(prevMessage => ({ ...prevMessage, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:3000/messages', newMessage)
      .then(response => {
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
              <li key={message._id} className="list-group-item">
                <strong>{message.sender}:</strong> {message.content}
              </li>
            ))}
          </ul>
        </div>
        <div className="col-md-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Sender:</label>
              <input
                type="text"
                className="form-control"
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
