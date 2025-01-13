import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./GameDescription.css";
import descriptions from "./descriptions.js";
import translations from "./translation.js";

const GameDescription = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bodyPart, selectedDifficulty } = location.state;
  const scrollImage = `${process.env.PUBLIC_URL}/images/scroll.png`;

  const bodyPartText = translations.bodyParts[bodyPart] || bodyPart;
  const difficultyText = translations.difficulties[selectedDifficulty] || selectedDifficulty;
 
  const descriptionText = descriptions[bodyPart]?.[selectedDifficulty] || [];

  const titles = {
    upperBody: "手臂側平舉",
    lowerBody: "坐姿抬腿",    
  };

  // 定義路由對應的遊戲頁面
  const gameRoutes = {
    upperBody: "/armgame",
    lowerBody: "/footgame",
  };

  const handleStartClick = () => {
    const route = gameRoutes[bodyPart];
    if (route) {
      navigate(route, { state: { selectedDifficulty } });
    } else {
      console.error("無效的 bodyPart: ", bodyPart);
    }
  };

  return (
    <div className="game-level-container">
      <div className="description-section">
        <div
          className="description-background"
          style={{ backgroundImage: `url(${scrollImage})` }}
        >
          <h2>{titles[bodyPart]}</h2>
          <p>部位：{bodyPartText}</p>
          <p>難度：{difficultyText}</p>
          
          {descriptionText.map((text, index) => (
            <p key={index}>{text}</p>
          ))}

          <button onClick={handleStartClick}>開始</button>
        </div>
      </div>
    </div>
  );
};

export default GameDescription;
