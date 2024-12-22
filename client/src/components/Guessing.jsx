import React, { useState, useEffect } from 'react';
import '../styles/Guessing.css';

const Guessing = ({ socket, roomCode, wordLength, wordToGuess }) => {
  const [guess, setGuess] = useState('');
  const [displayWord, setDisplayWord] = useState('_'.repeat(wordLength));

  const handleChange = (e) => {
    const value = e.target.value;
    if (value.length <= wordLength) {
      setGuess(value.toUpperCase()); // Convert input to uppercase and update state
    }
  };
  

  const submitGuess = () => {
    if (guess.length === wordLength) {
      console.log('Submitting guess:', guess);
      const username = localStorage.getItem('username');
      socket.emit('guess', guess, roomCode, username);
      setGuess(''); // Reset the guess input
    }
  };

  useEffect(() => {
    setDisplayWord('_'.repeat(wordLength)); // Reset the word display when the word length changes
  }, [wordLength]);

  return (
    <div className="guessing-container">
      <h3>Guess the Word:</h3>
      <div className="word-to-guess">
        <span>{displayWord}</span> {/* Display underscores and guessed letters */}
      </div>
      <input
        type="text"
        className="guess-input"
        maxLength={wordLength}
        value={guess}
        onChange={handleChange}
        placeholder="Enter your guess"
      />
      <button className="submit-guess-btn" onClick={submitGuess}>
        Submit Guess
      </button>
    </div>
  );
};

export default Guessing;
