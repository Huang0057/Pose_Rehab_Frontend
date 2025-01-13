import React from "react";
import "./Login.css";

const Login = () => {
  return (
    <div className="login-container">
      <h1 className="login-h1">歡迎回來！請登入</h1>
      <form className="login-form">
        <label>
          帳號：
          <input type="text" name="username" />
          <div className="input-underline"></div>
        </label>
        <label>
          密碼：
          <input type="password" name="password" />
          <div className="input-footer">
            <div className="input-underline-footer"></div>
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
