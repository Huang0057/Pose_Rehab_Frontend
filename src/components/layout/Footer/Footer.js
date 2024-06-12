import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-context">
        <a href="/home" className="footer-item">
          <div className="footer-icon">
            <img
              src={`${process.env.PUBLIC_URL}/images/home-icon.png`}
              alt="Home"
            />
            <p>首頁</p>
          </div>
        </a>

        <a href="/games" className="footer-item">
          <div className="footer-icon">
            <img
              src={`${process.env.PUBLIC_URL}/images/game-icon.png`}
              alt="Games"
            />
            <p>遊戲</p>
          </div>
        </a>

        <a href="/checkin" className="footer-item">
          <div className="footer-icon">
            <img
              src={`${process.env.PUBLIC_URL}/images/checkin-icon.png`}
              alt="Sign In"
            />
            <p>簽到</p>
          </div>
        </a>

        <a href="/records" className="footer-item">
          <div className="footer-icon">
            <img
              src={`${process.env.PUBLIC_URL}/images/record-icon.png`}
              alt="Records"
            />
            <p>記錄</p>
          </div>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
