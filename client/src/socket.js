import { io } from 'socket.io-client';

const socket = io('wss://https://sketch-scribe-server.onrender.com');  // Make sure this string is properly quoted

socket.on('connect', () => {
    console.log('Connected to server with socket ID:', socket.id);
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

export default socket;
