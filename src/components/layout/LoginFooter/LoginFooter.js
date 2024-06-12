import React from "react";
import { useNavigate } from "react-router-dom";
import "./LoginFooter.css";

const LoginFooter = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/home");
  };

  const handleRegisterClick = () => {
    console.log("Navigate to register page");
  };

  return (
    <div className="login-footer">
      <button className="login-button" onClick={handleLoginClick}>
        登入
      </button>
      <button className="register-button" onClick={handleRegisterClick}>
        註冊
      </button>
    </div>
  );
};

export default LoginFooter;
