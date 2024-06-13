import React, { useState } from "react";
import "./Header.css";

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

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
        <div className="dropdown">
          <img
            src={`${process.env.PUBLIC_URL}/images/user-icon.png`}
            alt="User Image"
            onClick={toggleDropdown}
            className="dropdown-toggle"
          />
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <span>歡迎，XXX!</span>
              <button className="logout-button">登出</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
