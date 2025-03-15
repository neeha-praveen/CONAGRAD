import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">
          <img src="/path-to-your-logo.png" alt="Logo" />
        </Link>
      </div>

      <div className="navbar-right">
        <Link to="/history" className="history-link">
          <svg className="icon" /* Add your history icon SVG here */ />
          <span>History</span>
        </Link>

        <div className="profile-container">
          <div className="profile-trigger">
            <img 
              src="/path-to-profile-image.jpg" 
              alt="Profile" 
              className="profile-image"
            />
            <span className="profile-name">John Doe</span>
          </div>

          <div className="profile-dropdown">
            <ul className="dropdown-menu">
              <li>
                <Link to="/profile" className="dropdown-item">
                  <svg className="icon" /* Add profile icon SVG */ />
                  Profile
                </Link>
              </li>
              <li>
                <Link to="/settings" className="dropdown-item">
                  <svg className="icon" /* Add settings icon SVG */ />
                  Settings
                </Link>
              </li>
              <li>
                <Link to="/help" className="dropdown-item">
                  <svg className="icon" /* Add help icon SVG */ />
                  Help
                </Link>
              </li>
              <li className="dropdown-divider"></li>
              <li>
                <button onClick={handleLogout} className="dropdown-item">
                  <svg className="icon" /* Add logout icon SVG */ />
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 