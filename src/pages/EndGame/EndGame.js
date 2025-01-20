import React from 'react';
import { useNavigate } from 'react-router-dom';
import './EndGame.css';

const EndGame = () => {
  const navigate = useNavigate();

  const handleViewRecords = () => {
    navigate('/records');
  };

  const handleContinueGame = () => {
    navigate('/games');
  };

  return (
    <div className="endgame-container">
      <h1 className="endgame-title">
        恭喜，已完成遊戲
      </h1>
      <div className="endgame-buttons">
        <button 
          className="continuegame-button"
          onClick={handleContinueGame}
        >
          繼續遊戲
        </button>
        <button 
          className="record-button"
          onClick={handleViewRecords}
          >
            查看紀錄

        </button>
      </div>
    </div>
  );
};

export default EndGame;