import { useState } from 'react';
import './styles/App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Lobby from './components/Lobby';
import Gameboard from './components/Gameboard';
import GameOver from './components/GameOver';
function App() {
  const [socket, setSocket] = useState(null);

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Lobby setSocket={setSocket} />} />
          <Route path="/game/:roomCode" element={<Gameboard socket={socket} />} />
          <Route path="/gameover" element={<GameOver socket={socket} />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
