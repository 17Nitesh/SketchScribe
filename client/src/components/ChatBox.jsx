import React, { useState, useEffect } from 'react';

const ChatBox = ({ socket, roomCode }) => {
  const [messages, setMessages] = useState([]); // Stores all chat messages
  const [newMessage, setNewMessage] = useState(''); // Stores the current message being typed
  const [username, setUsername] = useState(''); // Stores the username of the current user

  useEffect(() => {
    if (!socket) {
      console.log('Socket not connected');
      return;
    }

    const defaultUsername = localStorage.getItem('username') || `User${socket.id}`; // Get username from local storage
    setUsername(defaultUsername); // Assign a default username based on socket ID

    // Listen for 'receiveMessage' event to receive messages
    const handleReceiveMessage = ({ username: sender, msg }) => {
      if(localStorage.getItem('username') === sender) return; // Ignore messages sent by the current user
      console.log('Received message:', sender, msg); // Log the received message for debugging
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender, message: msg }, // Update messages state with new message
      ]);
    };

    socket.on('receiveMessage', handleReceiveMessage); // Add listener for receiving messages

    // Clean up the listener when the component unmounts
    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
    };
  }, [socket]); // Re-run when socket object changes

  const sendMessage = () => {
    if (newMessage.trim() === '') return; // Prevent sending empty messages

    const messageData = {
      username, // Include the sender's username
      message: newMessage, // Include the message text
    };
    
    console.log('Sending message:', messageData); // Log the message before sending
    try {
      socket.emit('sendMessage', messageData, roomCode); // Emit the message to the server with roomCode
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: username, message: newMessage }, // Add sent message locally
      ]);

      setNewMessage(''); // Clear input field after sending the message
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="chat-box">
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.sender === username ? 'my-message' : 'other-message'}`}
          >
            <span className="message-sender">
              {msg.sender === username ? 'You' : msg.sender}
            </span>
            <p className="message-text">{msg.message}</p>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatBox;
