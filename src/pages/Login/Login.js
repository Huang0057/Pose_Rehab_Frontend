import React, { useState } from "react";
import { useAuth } from "../../context/authContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:8000/api/users/login", formData);
      login(response.data);
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.detail || "登入失敗");
    }
  };

  return (
    <>
      <div className="login-container">
        <h1 className="login-h1">歡迎回來！請登入</h1>
        <form className="login-form" onSubmit={(e) => e.preventDefault()}>
          <label className="login-label">
            帳號：
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              className="login-input"
            />
            <div className="login-input-underline"></div>
          </label>
          <label className="login-label">
            密碼：
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className="login-input"
            />
            <div className="login-input-footer">
              <div className="login-input-underline-footer"></div>
              <a href="#" className="forgot-password">
                忘記密碼？
              </a>
            </div>
          </label>
        </form>
        <div className="login-footer">
          {error && <div className="error-message">{error}</div>}
          <button className="login-button" onClick={handleLogin}>
            登入
          </button>
          <button className="loginfooter-register-button" onClick={() => navigate("/register")}>
            註冊
          </button>
        </div>
      </div>
    </>
  );
};

export default Login;