import React from "react";
import { useNavigate } from "react-router-dom";
import "./LoginFooter.css";

const LoginFooter = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/home");
  };

  const handleRegisterClick = () => {
    navigate("/register");
  };

  return (
    <div className="login-footer">
      <button className="login-button" onClick={handleLoginClick}>
        登入
      </button>
      <button className="loginfooter-register-button" onClick={handleRegisterClick}>
        註冊
      </button>
    </div>
  );
};

export default LoginFooter;
