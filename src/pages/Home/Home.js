import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  return (
    <div className="home-container">
      <h1>開始運動吧!XXX</h1>
      <p>這是你連續運動的第XX天</p>
      <Link to="/games">
        <button>開始遊戲</button>
      </Link>
    </div>
  );
};

export default Home;
