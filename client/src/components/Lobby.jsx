import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../socket.js'; // Use the shared socket instance

const Lobby = ({ setSocket }) => {
    const [roomCode, setRoomCode] = useState('');
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    const createRoom = () => {
        setSocket(socket);

        socket.emit('createGame');
        socket.on('gameCreated', (roomCode) => {
            console.log('Room code received from backend:', roomCode);
            localStorage.setItem('roomCode', roomCode);
            setRoomCode(roomCode);
        });
    };

    const joinRoom = () => {
        setSocket(socket);

        socket.emit('joinRoom', { roomCode, username });
        localStorage.setItem('username', username);
        socket.on('roomJoined', (roomCode) => {
            console.log(`Joined room ${roomCode}`);
            localStorage.setItem('roomCode', roomCode);
            navigate(`/game/${roomCode}`);
        });
    };

    return (
        <div>
            <h1>Lobby</h1>
            <button onClick={createRoom}>Create Room</button>
            <input
                type="text"
                placeholder="Room Code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
            />
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <button onClick={joinRoom}>Join Room</button>
        </div>
    );
};

export default Lobby;
