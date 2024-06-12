import React from "react";
import "./Header.css";

const Header = () => {
  return (
    <div className="header">
      <div className="left-content">
        <img
          src={`${process.env.PUBLIC_URL}/images/coin-icon.png`}
          alt="Coin Image"
        />
        <div className="capsule">
          <span className="coins-num">9999</span>
        </div>
      </div>
      <div className="right-content">
        <a>
          <img
            src={`${process.env.PUBLIC_URL}/images/user-icon.png`}
            alt="User Image"
          />
        </a>
      </div>
    </div>
  );
};

export default Header;
