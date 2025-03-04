import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./stu_style.css";

export default function StudentAuth() {
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({ name: "", email: "", username: "", password: "" });
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await axios.post("http://localhost:4000/login", loginData);
      setMessage(response.data.message);
      setTimeout(() => navigate("/StudentUpload"), 2000); // Redirect after 2 sec
      setLoginData({ username: "", password: "" }); // Clear form
    } catch (error) {
      setError(error.response?.data?.error || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await axios.post("http://localhost:4000/register", registerData);
      setMessage(response.data.message);
      setTimeout(() => setIsActive(false), 2000); // Switch to login form
      setRegisterData({ name: "", email: "", username: "", password: "" }); // Clear form
    } catch (error) {
      setError(error.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`container ${isActive ? "active" : ""}`}>
      {/* Login Section */}
      <div className="form-container login-box">
        <form onSubmit={handleLogin}>
          <h1>LOGIN</h1>
          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}
          <div className="input-box">
            <input
              type="text"
              placeholder="Username"
              required
              value={loginData.username}
              onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
            />
          </div>
          <div className="input-box">
            <input
              type="password"
              placeholder="Password"
              required
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
            />
          </div>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>

      {/* Register Section */}
      <div className="form-container register-box">
        <form onSubmit={handleRegister}>
          <h1>REGISTER</h1>
          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}
          <div className="input-box">
            <input
              type="text"
              placeholder="Name"
              required
              value={registerData.name}
              onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
            />
          </div>
          <div className="input-box">
            <input
              type="email"
              placeholder="Email"
              required
              value={registerData.email}
              onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
            />
          </div>
          <div className="input-box">
            <input
              type="text"
              placeholder="Username"
              required
              value={registerData.username}
              onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
            />
          </div>
          <div className="input-box">
            <input
              type="password"
              placeholder="Password"
              required
              value={registerData.password}
              onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
            />
          </div>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>

      {/* Toggle Section */}
      <div className="toggle-box-stu">
        <div className="toggle-panel-stu toggle-left">
          <h1>Namaste, Welcome!</h1>
          <p>Don't have an account?</p>
          <button className="btn register-btn" onClick={() => setIsActive(true)}>
            REGISTER
          </button>
        </div>
        <div className="toggle-panel toggle-right">
          <h1>Welcome Back</h1>
          <p>Already have an account?</p>
          <button className="btn login-btn" onClick={() => setIsActive(false)}>
            LOGIN
          </button>
        </div>
      </div>
    </div>
  );
}
