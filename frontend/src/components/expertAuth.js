import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import "./exp_style.css"; 
import "boxicons/css/boxicons.min.css"; 

const ExpertAuth = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  const toggleForm = () => {
    setIsSignUp(!isSignUp);
  };

  return (
    <div className="expert-auth-container">
      <div className={`form-container ${isSignUp ? 'active' : ''}`}>
        <div className="form-box login">
          <h2>Expert Login</h2>
          <form>
            <div className="input-box">
              <input type="email" required />
              <label>Email</label>
            </div>
            <div className="input-box">
              <input type="password" required />
              <label>Password</label>
            </div>
            <div className="remember-forgot">
              <label><input type="checkbox" /> Remember me</label>
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>
            <button type="submit" className="btn">Login</button>
            <div className="login-register">
              <p>Don't have an account? <button type="button" onClick={toggleForm} className="register-link">Register</button></p>
            </div>
          </form>
        </div>

        <div className="form-box register">
          <h2>Expert Registration</h2>
          <form>
            <div className="input-box">
              <input type="text" required />
              <label>Full Name</label>
            </div>
            <div className="input-box">
              <input type="email" required />
              <label>Email</label>
            </div>
            <div className="input-box">
              <input type="password" required />
              <label>Password</label>
            </div>
            <div className="remember-forgot">
              <label><input type="checkbox" required /> I agree to the terms & conditions</label>
            </div>
            <button type="submit" className="btn">Register</button>
            <div className="login-register">
              <p>Already have an account? <button type="button" onClick={toggleForm} className="login-link">Login</button></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExpertAuth;
