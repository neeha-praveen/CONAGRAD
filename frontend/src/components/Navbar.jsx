import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    console.log("User logged out");
    // Implement logout logic, e.g., clearing auth tokens
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">
          <img src="/path-to-your-logo.png" alt="Logo" />
        </Link>
      </div>

      <div className="navbar-right">
        <Link to="/history" className="history-link">
          📜 {/* Replace with an actual SVG or icon */}
          <span>History</span>
        </Link>

        <div className="profile-container">
          <div
            className="profile-trigger"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <img
              src="/path-to-profile-image.jpg"
              alt="Profile"
              className="profile-image"
            />
            <span className="profile-name">John Doe</span>
          </div>

          {isDropdownOpen && (
            <div className="profile-dropdown">
              <ul className="dropdown-menu">
                <li>
                  <Link to="/profile" className="dropdown-item">👤 Profile</Link>
                </li>
                <li>
                  <Link to="/settings" className="dropdown-item">⚙️ Settings</Link>
                </li>
                <li>
                  <Link to="/help" className="dropdown-item">❓ Help</Link>
                </li>
                <li className="dropdown-divider"></li>
                <li>
                  <button onClick={handleLogout} className="dropdown-item">
                    🚪 Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
