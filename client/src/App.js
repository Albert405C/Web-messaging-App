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

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
 const [messages, setMessages] = useState([]);
 const [newMessage, setNewMessage] = useState({});
 const [error, setError] = useState('');

 useEffect(() => {
    const fetchMessages = async () => {
      const result = await axios.get('http://localhost:3000/messages');
      setMessages(result.data);
    };
    fetchMessages();
 }, []);

 const handleInputChange = (e) => {
    setNewMessage({ ...newMessage, [e.target.name]: e.target.value });
 };

 const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.sender || !newMessage.content) {
      setError('Both Sender and Content are required');
      return;
    }
    setError('');
    const result = await axios.post('http://localhost:3000/messages', newMessage);
    setMessages([...messages, result.data])
    setNewMessage({});
 };

 return (
    <div className="container">
      <h1>Message Board</h1>
      {/* Display the error message if there is one */}
      {error && <div className="alert alert-danger">{error}</div>}
      {/* ...rest of the code */}
    </div>
 );
}





export default App;
