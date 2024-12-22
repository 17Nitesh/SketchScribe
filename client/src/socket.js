import { io } from 'socket.io-client';

const socket = io('wss://sketch-scribe-server-hxnpqco4f-niteshs-projects-08f90836.vercel.app');  // Make sure this string is properly quoted

socket.on('connect', () => {
    console.log('Connected to server with socket ID:', socket.id);
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

export default socket;
