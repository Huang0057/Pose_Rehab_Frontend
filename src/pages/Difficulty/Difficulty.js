import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Difficulty.css";

const Difficulty = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bodyPart } = location.state;

  const [difficulty, setDifficulty] = useState("");

  const handleDifficultyClick = (selectedDifficulty) => {
    setDifficulty(selectedDifficulty);
    console.log(
      `Selected Body Part: ${bodyPart}, Selected Difficulty: ${selectedDifficulty}`
    );
    navigate("/description", {
      state: { bodyPart, selectedDifficulty },
    });
  };

  return (
    <div>
      <div className="difficulty-container">
        <div
          className="difficulty-item"
          onClick={() => handleDifficultyClick("簡單")}
        >
          <button className="difficulty-button">
            <img
              src={"/images/star.png"}
              alt="簡單"
              className="difficulty-image-easy"
            />
          </button>
          <span className="difficulty-text">簡單</span>
        </div>
        <div
          className="difficulty-item"
          onClick={() => handleDifficultyClick("普通")}
        >
          <button className="difficulty-button">
            <img
              src={"/images/star2.png"}
              alt="普通"
              className="difficulty-image-medium"
            />
          </button>
          <span className="difficulty-text">普通</span>
        </div>
        <div
          className="difficulty-item"
          onClick={() => handleDifficultyClick("困難")}
        >
          <button className="difficulty-button">
            <img
              src={"/images/star3.png"}
              alt="困難"
              className="difficulty-image-hard"
            />
          </button>
          <span className="difficulty-text">困難</span>
        </div>
      </div>
    </div>
  );
};

export default Difficulty;
