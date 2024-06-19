import React from "react";
import "./GameDescription.css";
import { useLocation } from "react-router-dom";

const GameDescription = () => {
  const location = useLocation();
  const { bodyPart, selectedDifficulty } = location.state;
  const scrollImage = `${process.env.PUBLIC_URL}/images/scroll.png`;

  return (
    <div className="game-level-container">
      <div className="video-section">
        <h2 className="video-title">示範</h2>
        <video controls>
          <source
            src={`${process.env.PUBLIC_URL}/videos/sample-video.mp4`}
            type="video/mp4"
          />
          您的瀏覽器不支援 HTML5 影片。
        </video>
      </div>
      <div className="description-section">
        <div
          className="description-background"
          style={{ backgroundImage: `url(${scrollImage})` }}
        >
          <h2>手軸上舉</h2>
          <p>部位：{bodyPart}</p>
          <p>難度：{selectedDifficulty}</p>
          <p>過關條件：</p>
          <p>每個動作維持5秒</p>
          <p>動作完整次數20次</p>

          <button>開始</button>
        </div>
      </div>
    </div>
  );
};

export default GameDescription;
