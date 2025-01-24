import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import "./Home.css";

const Home = () => {
  const { user } = useAuth();
  return (
    <div className="home-container">
      <h1>開始運動吧! {user?.username}</h1>
      <p>這是你連續運動的第 {user?.streakDays || 0} 天</p>
      <Link to="/games">
        <button>開始遊戲</button>
      </Link>
    </div>
  );
};

export default Home;
