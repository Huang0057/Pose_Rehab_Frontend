import React, { useState } from "react";
import { useEffect } from 'react';
import { useAuth } from "../../../context/authContext";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./Header.css";

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const { user, logout, login } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    if (!user?.token) return;
    
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/users/me', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        
        if (user.coins !== response.data.coins) {
          login({
            ...user,
            coins: response.data.coins
          });
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };
    
    fetchUserData();
  }, [user, login]);
  
  return (
    <div className="header">
      <div className="left-content">
        <img
          src={`${process.env.PUBLIC_URL}/images/coin-icon.png`}
          alt="Coin"
        />
        <div className="capsule">
          <span className="coins-num">{user?.coins}</span>
        </div>
      </div>
      <div className="right-content">
        <div className="dropdown">
          <img
            src={`${process.env.PUBLIC_URL}/images/user-icon.png`}
            alt="User"
            onClick={toggleDropdown}
            className="dropdown-toggle"
          />
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <span>歡迎，{user?.username}!</span>
              <button className="logout-button" onClick={handleLogout}>登出</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
