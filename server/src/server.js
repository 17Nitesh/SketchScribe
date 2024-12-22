import app from './app.js';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { getRoomCode } from './utils/GameLogic.js';
import { words } from './utils/words.js';
dotenv.config();
const PORT = process.env.PORT || 3000;

const GameServer = http.createServer(app);
const io = new Server(GameServer, {
    cors: {
        origin: process.env.CLIENT_URL || '*' // Allow all origins for now,
    },
    methods: ['GET', 'POST'],
});

const rooms = {};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        for (const roomCode in rooms) {
            const room = rooms[roomCode];
            room.players = room.players.filter(player => player.id !== socket.id);
            if (room.players.length === 0) {
                console.log(`Room ${roomCode} deleted`);
                delete rooms[roomCode];
            } else {
                io.to(roomCode).emit('playerLeft', room.players);
            }
        }
    });
    

    // Handle game creation
    socket.on('createGame', () => {
        let roomCode;
        do {
            roomCode = getRoomCode();
        } while (rooms[roomCode]);

        rooms[roomCode] = { players: [], round: 0, maxRounds: 5 };
        socket.emit('gameCreated', roomCode);
        console.log(`Game created with room code: ${roomCode}`);
    });

    socket.on('getPlayers', (roomCode) => {
        const room = rooms[roomCode];
        if (!room) {
            socket.emit('invalidRoomCode');
            return;
        }
        console.log(`Emitting players list for room: ${roomCode}`, room.players); // Debug log
        socket.emit('playerJoined', room.players);
    });

    // Handle joining a room
    socket.on('joinRoom', ({ roomCode, username }) => {
        const maxPlayers = 5;
        const room = rooms[roomCode];

        if (!room) {
            socket.emit('invalidRoomCode');
            return;
        }

        if (room.players.length >= maxPlayers) {
            socket.emit('roomFull');
            return;
        }

        if (room.players.some(player => player.username === username)) {
            socket.emit('usernameTaken');
            return;
        }

        socket.username = username;
        socket.join(roomCode);
        room.players.push({ id: socket.id, username, score: 0 });
        console.log(`User ${username} joined room ${roomCode}`);

        io.to(roomCode).emit('playerJoined', room.players);
        socket.emit('roomJoined', roomCode);
    });

    socket.on('getRoomState', (roomCode) => {
        if (rooms[roomCode]) {
            socket.emit('roomExists', true);
        } else {
            socket.emit('roomNotFound');
        }
    });

    // Handle starting the game
    socket.on('startGame', (roomCode) => {
        console.log(`Starting game for room: ${roomCode}`);
        const room = rooms[roomCode];
        if (!room) {
            socket.emit('invalidRoomCode');
            return;
        }
        if (room.players.length < 5) {
            socket.emit('notEnoughPlayers');
            return;
        }
    
        // Function to start a round
        const startRound = () => {
            console.log(`Starting round ${room.round + 1} for room: ${roomCode}`);
            room.round++;
            if (room.players.length < 5) {
                socket.emit('notEnoughPlayers');
                return;
            }
            if (room.round > room.maxRounds) {
                io.to(roomCode).emit('gameOver', room.players);
                delete rooms[roomCode];
                return;
            }
    
            const drawerIndex = (room.round - 1) % room.players.length;
            const drawer = room.players[drawerIndex];
            if (!drawer) {
                console.log(`No drawer found for room: ${roomCode}`);
                delete rooms[roomCode]; // Cleanup if no players are left
                return;
            }
    
            room.currentDrawer = drawer;
            const randomIndex = Math.floor(Math.random() * words.length);
            const selectedWord = words[randomIndex];
            room.wordSelected = selectedWord;
    
            console.log(`Word auto-selected for drawer ${drawer.username}: ${selectedWord}`);
            
            io.to(drawer.id).emit('yourTurn', selectedWord);
            io.to(roomCode).emit('playerTurn', drawer);
            io.to(roomCode).emit('wordSelected', selectedWord.length);
            io.to(roomCode).emit('roundStarted', { round: room.round, drawer: drawer.username });
    
            const roundDuration = 60000;
            let timeLeft = roundDuration;
    
            const interval = setInterval(() => {
                timeLeft -= 1000;
    
                if (!rooms[roomCode]) {
                    clearInterval(interval); // Stop timer if room is deleted
                    return;
                }
    
                io.to(roomCode).emit('timer', timeLeft);
    
                if (timeLeft <= 0) {
                    clearInterval(interval);
                    io.to(roomCode).emit('roundOver');
                    io.to(roomCode).emit('playerJoined', room.players);
                    startRound(); // Start the next round
                }
            }, 1000);
    
            room.roundInterval = interval;
        };
    
        // Initialize the first round
        startRound();
    });
    
    
    
    

    // Handle drawing events
    socket.on('draw', (line, roomCode) => {
        // Broadcast the drawing data to all clients in the room except the sender
        socket.to(roomCode).emit('draw', line);
    });

    socket.on('sendMessage', ({ username, message }, roomCode) => {
        console.log(`Message from ${username}: ${message}`);
        io.to(roomCode).emit('receiveMessage', { username, msg:  message }); // Broadcast to all clients in the room
    });


    socket.on('guess', (guess, roomCode, username) => {
        const room = rooms[roomCode];
        console.log(`Guess received from ${username}: ${guess}`);
        if (!room) {
            socket.emit('invalidRoomCode');
            return;
        }
        guess = guess.toLowerCase();
        if (guess === room.wordSelected.toLowerCase()) {
            const player = room.players.find(player => player.username === username);
            player.score += 1;
            io.to(roomCode).emit('correctGuess', username);
            io.to(roomCode).emit('playerJoined', room.players);
        }
    });

    // Handle game over
    socket.on('gameOver', (roomCode) => {


        if (rooms[roomCode]) {
            delete rooms[roomCode];
            io.to(roomCode).emit('gameOver');
        }
    });
});

GameServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
