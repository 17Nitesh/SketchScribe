import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const GameOver = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const players = location.state?.players || [];

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Game Over!</h1>
      <h2>Final Scores</h2>
      {/* Table Styling with border-collapse */}
      <table style={{ margin: 'auto', border: '1px solid black', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid black', padding: '10px', backgroundColor: '#f0f0f0' }}>
              Player
            </th>
            <th style={{ border: '1px solid black', padding: '10px', backgroundColor: '#f0f0f0' }}>
              Score
            </th>
          </tr>
        </thead>
        <tbody>
          {/* Conditional rendering in case of no players */}
          {players.length > 0 ? (
            players.map((player, index) => (
              <tr key={index}>
                <td style={{ border: '1px solid black', padding: '10px' }}>
                  {player.username || 'Anonymous Player'}
                </td>
                <td style={{ border: '1px solid black', padding: '10px' }}>
                  {player.score}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2" style={{ textAlign: 'center', padding: '10px' }}>
                No players available.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <button
        onClick={() => navigate('/')}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Back to Lobby
      </button>
    </div>
  );
};

export default GameOver;
