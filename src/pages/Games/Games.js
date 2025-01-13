import React from "react";
import { useNavigate } from "react-router-dom";
import "./Games.css";

const Games = () => {
  const navigate = useNavigate();

  const handleButtonClick = (bodyPart) => {
    navigate(`/difficulty`, { state: { bodyPart } });
  };

  return (
    <div className="games-container">
      <div className="game-item" onClick={() => handleButtonClick("upperBody")}>
        <button className="game-button">
          <img
            src={"/images/upperBody.png"}
            alt="上肢"
            className="game-image"
          />
        </button>
        <span className="game-text">上肢</span>
      </div>
      <div className="game-item" onClick={() => handleButtonClick("lowerBody")}>
        <button className="game-button">
          <img
            src={"/images/lowerBody.png"}
            alt="下肢"
            className="game-image"
          />
        </button>
        <span className="game-text">下肢</span>
      </div>
      <div className="game-item" onClick={() => handleButtonClick("fullBody")}>
        <button className="game-button">
          <img src={"/images/fullBody.png"} alt="四肢" className="game-image" />
        </button>
        <span className="game-text">四肢</span>
      </div>
      <div className="game-item" onClick={() => handleButtonClick("hand")}>
        <button className="game-button">
          <img src={"/images/hand.png"} alt="手部" className="game-image" />
        </button>
        <span className="game-text">手部</span>
      </div>
    </div>
  );
};

export default Games;
