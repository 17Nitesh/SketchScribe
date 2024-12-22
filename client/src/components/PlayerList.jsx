import React, { useEffect, useState } from 'react';

const PlayerList = ({ socket, roomCode }) => {
    const [players, setPlayers] = useState([]);

    useEffect(() => {
        if (!socket || !roomCode) return;

        // Request the list of players for the room
        socket.emit('getPlayers', roomCode);

        const handlePlayerJoined = (updatedPlayers) => {
            console.log('Updated players:', updatedPlayers);
            setPlayers(updatedPlayers); // Update the player list when received
        };

        // Listen for player updates
        socket.on('playerJoined', handlePlayerJoined);

        // Cleanup the listener on unmount
        return () => {
            socket.off('playerJoined', handlePlayerJoined);
        };
    }, [socket, roomCode]);

    return (
        <div className="player-list">
            <h2>Players</h2>
            <div className="player-items">
                {players.map((player) => (
                    <div key={player.username} className="player-item">
                        <span className="username">{player.username || 'Anonymous Player'}</span>
                        {player.score !== undefined ? (
                            <span className="score"> - Score: {player.score}</span>
                        ) : (
                            <span className="score"> - Score: N/A</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PlayerList;
