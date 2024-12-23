import React, { use, useEffect, useState } from 'react';
import PlayerList from './PlayerList.jsx';
import ChatBox from './ChatBox.jsx';
import DrawingCanvas from './DrawingCanvas.jsx';
import '../styles/Gameboard.css';
import { toast, ToastContainer } from 'react-toastify';
import { useParams } from 'react-router-dom';
import Guessing from './Guessing.jsx';
import { useNavigate } from 'react-router-dom';
import logo from "./logo1.webp";
const Gameboard = ({ socket }) => {
  const [drawer, setDrawer] = useState({ id: '', username: '' });
  const [gameStarted, setGameStarted] = useState(false);
  const [roomExists, setRoomExists] = useState(false);
  const [word, setWord] = useState([]);
  const [wordLength, setWordLength] = useState(0);
  const [round, setRound] = useState(0);
  const [timer, setTimer] = useState(0);
  const [alreadyGuessed, setAlreadyGuessed] = useState(false);
  const { roomCode } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;

    // Validate room existence
    socket.emit('getRoomState', roomCode);

    const handleRoomExists = () => setRoomExists(true);
    const handleRoomNotFound = () => {
      setRoomExists(false);
      toast('Room not found');
    };


    socket.on('roomExists', handleRoomExists);
    socket.on('roomNotFound', handleRoomNotFound);
    socket.on('correctGuess', (username) => {
      toast(`${username} has guessed the word!`);
      const user = localStorage.getItem('username');
      if (username === user) {
        setAlreadyGuessed(true);
      }
    });
    // Game events
    socket.on('yourTurn', (word) => {
      setWord(word);
      setDrawer({ id: socket.id, username: socket.username });
      toast('Your turn to draw!');
    });

    socket.on('playerTurn', (drawer) => {
      setDrawer({ id: drawer.id, username: drawer.username });
      toast(`${drawer.username}'s turn to draw!`);
    });


    socket.on('autoSelectedWord', (word) => {
      setWord(word);
      toast(`Word selected: ${word}`);
    });
    socket.on('wordSelected', (length) => {
      setWordLength(length)
      toast(`Word selected: ${'_  '.repeat(length)}`);
    });
    socket.on('roundStarted', () => {
      setAlreadyGuessed(false);
      setGameStarted(true)
      setRound((prevRound) => prevRound + 1);
      toast('Round started!');
    });
    socket.on('roundOver', () => setGameStarted(false));
    socket.on('timer', (timeLeft) => setTimer(timeLeft));
    
    socket.on('gameOver', (players)=> {
      navigate('/gameover', { state: { players } });
    })

    return () => {
      socket.off('roomExists', handleRoomExists);
      socket.off('roomNotFound', handleRoomNotFound);
      socket.off('yourTurn');
      socket.off('playerTurn');
      socket.off('wordChoices');
      socket.off('autoSelectedWord');
      socket.off('wordSelected');
      socket.off('roundStarted');
      socket.off('roundOver');
      socket.off('timer');
      socket.off('correctGuess');

    };
  }, [socket, roomCode, timer, navigate]);

  const startGame = () => {
    socket.emit('startGame', roomCode);

    socket.on('invalidRoomCode', () => {
      alert('Invalid room code');
      return (
        socket.off('Invalid room code')
      );
    });

    socket.on('notEnoughPlayers', () => {
      alert('Not enough players');

      return socket.off('notEnoughPlayers')
    });
  };

  if (!roomExists) {
    return <h1>Room not found. Please check the code or join another room.</h1>;
  }

  return (
    <div className="">
      <div className="header">
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <div>
  <img src={logo} alt="Game Logo" className="logo" />
</div>

        <h1>Room Code: {roomCode}</h1>
        <h2>Round: {round}</h2>
        <h2>Time: {timer}</h2>
      </div>
      <div className="gameboard">

        <div className="player-list-container">
          <PlayerList socket={socket} roomCode={roomCode} />
        </div>
        {!gameStarted ? (
          <div className="waiting-for-players">
            <div className="loading-animation">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
            {round === 0 ? <button className="btn-start-game" onClick={startGame}>
              Start Game
            </button> : null}

          </div>
        ) : (
          <div className="game-started">

            <div className="canvas-container">
              {drawer.id === socket.id ? <h2>Draw the word: {word}</h2> : <h2>Guess the word</h2>}
              <DrawingCanvas socket={socket} roomCode={roomCode} drawer={drawer} />
            </div>
            {alreadyGuessed ? (
              <h2>You have already guessed the word</h2>
            ) : (
              drawer.id === socket.id ? null : (
                <div className="">
                  <Guessing socket={socket} roomCode={roomCode} wordLength={wordLength} />
                </div>
              )
            )}



          </div>
        )}
        <div className="chat-box-container">
          <ChatBox socket={socket} roomCode={roomCode} />
        </div>
      </div>
    </div>
  );
};

export default Gameboard;
