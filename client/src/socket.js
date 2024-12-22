import { io } from 'socket.io-client';

const socket = io('https://sketch-scribe-server.onrender.com');  // Replace with your server URL

socket.on('connect', () => {
    console.log('Connected to server with socket ID:', socket.id);  // This should log the socket ID
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});
export default socket;
