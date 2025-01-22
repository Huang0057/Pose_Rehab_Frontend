import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // 確認密碼驗證
    if (formData.password !== formData.confirmPassword) {
      setError("密碼與確認密碼不符");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "註冊失敗");
      }

      await Swal.fire({
        icon: 'success',
        title: '註冊成功！',
        text: '即將跳轉到登入頁面...',
        timer: 1500,  // 1.5秒後自動關閉
        showConfirmButton: false
      });

      // 註冊成功，導向登入頁面
      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="register-container">
      <h1 className="register-h1">註冊會員</h1>
      <form className="register-form" onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}
        <label className="register-label">
          帳號：
          <input 
            type="text" 
            name="username" 
            className="register-input"
            value={formData.username}
            onChange={handleChange}
          />
          <div className="input-underline"></div>
        </label>
        <label className="register-label">
          密碼：
          <input 
            type="password" 
            name="password" 
            className="register-input"
            value={formData.password}
            onChange={handleChange}
          />
          <div className="input-underline"></div>
        </label>
        <label className="register-label">
          確認密碼：
          <input 
            type="password" 
            name="confirmPassword" 
            className="register-input"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          <div className="input-underline"></div>
        </label>
        <div className="register-button-group">
          <button 
            type="button" 
            className="register-return-button"
            onClick={() => navigate("/login")}
          >
            返回登入
          </button>
          <button type="submit" className="register-submit-button">
            加入會員
          </button>
        </div>
      </form>
    </div>
  );
};

export default Register;