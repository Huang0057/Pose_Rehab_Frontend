import React from "react";
import "./Login.css";

const Login = () => {
  return (
    <div className="login-container">
      <h1 className="login-h1">歡迎回來！請登入</h1>
      <form className="login-form">
        <label className="login-label">
          帳號：
          <input type="text" name="username"  className="login-input" />
          <div className="login-input-underline"></div>
        </label>
        <label className="login-label">
          密碼：
          <input type="password" name="password"  className="login-input" />
          <div className="login-input-footer">
            <div className="login-input-underline-footer"></div>
            <a href="#" className="forgot-password">
              忘記密碼？
            </a>
          </div>
        </label>
      </form>
    </div>
  );
};

export default Login;
