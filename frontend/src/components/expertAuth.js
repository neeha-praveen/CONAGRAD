import React, { useState } from "react";
import "./exp_style.css"; // Import the CSS
import "boxicons/css/boxicons.min.css"; // Import Boxicons

const ExpertAuth = () => {
  const [isActive, setIsActive] = useState(false);

  return (
    <div className={`container ${isActive ? "active" : ""}`}>
      {/* Login Form */}
      <div className="form-box login">
        <form>
          <h1>Login</h1>
          <div className="input-box">
            <input type="text" placeholder="Username" required />
            <i className="bx bx-user"></i>
          </div>
          <div className="input-box">
            <input type="password" placeholder="Password" required />
            <i className="bx bx-lock-alt"></i>
          </div>
          <div className="forgot-link">
            <a href="#">Forgot password?</a>
          </div>
          <button type="submit" className="btn">
            Login
          </button>
          <p>or login with social platforms</p>
          <div className="social-icons">
            <a href="#">
              <i className="bx bxl-google"></i>
            </a>
          </div>
        </form>
      </div>

      {/* Register Form */}
      <div className="form-box register">
        <form>
          <h1>Registration</h1>
          <div className="input-box">
            <input type="text" placeholder="Username" required />
            <i className="bx bx-user"></i>
          </div>
          <div className="input-box">
            <input type="email" placeholder="Email" required />
            <i className="bx bx-envelope"></i>
          </div>
          <div className="input-box">
            <input type="password" placeholder="Password" required />
            <i className="bx bx-lock-alt"></i>
          </div>
          <div className="input-box">
            <input type="number" placeholder="Age" required />
          </div>
          <button type="submit" className="btn">
            Register
          </button>
          <p>or register with social platforms</p>
          <div className="social-icons">
            <a href="#">
              <i className="bx bxl-google"></i>
            </a>
          </div>
        </form>
      </div>

      {/* Toggle Box */}
      <div className="toggle-box">
        <div className="toggle-panel toggle-left">
          <h1>Hello, Welcome!</h1>
          <p>Don't have an account?</p>
          <button className="btn register-btn" onClick={() => setIsActive(true)}>
            Register
          </button>
        </div>
        <div className="toggle-panel toggle-right">
          <h1>Welcome Back!</h1>
          <p>Already have an account?</p>
          <button className="btn login-btn" onClick={() => setIsActive(false)}>
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpertAuth;
