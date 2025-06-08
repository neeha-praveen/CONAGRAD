import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ExpertNavbar.css';

const ExpertNavbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();
  const username = localStorage.getItem('expertUsername') || 'Expert';
  const expertId = localStorage.getItem('expertId');
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        showDropdown
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleLogout = () => {
    setLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem('expertToken');
      localStorage.removeItem('expertUsername');
      navigate('/expert-login');
    }, 2000);
  };

  return (
    <nav className="expert-navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">
          <img src="/Conagrad.jpg" alt="Logo" />
        </Link>
      </div>

      <div className="navbar-right">
        <Link to="/expert-dashboard" className="nav-link">
          <i className="bx bx-home"></i>
          Home
        </Link>

        <Link to="/expert-history" className="nav-link">
          <i className="bx bx-history"></i>
          History
        </Link>

        <Link to="/your-work" className="nav-link">
          <i className="bx bx-briefcase"></i>
          Your Work
        </Link>

        <div className="expertprofile-container">
          <div 
            className="profile-trigger"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <img src="/default-profile.jpg" alt="Profile" className="profile-image" />
            <span className="profile-name">{username}</span>
          </div>

          {showDropdown && (
            <div className="profile-dropdown" ref={dropdownRef}>
              <ul className="dropdown-menu">
                <li>
                  <Link to={`/profile/${expertId}`} className="dropdown-item">
                    <i className="bx bx-user"></i>
                    Profile
                  </Link>
                </li>
                <li>
                  <Link to="/expert-settings" className="dropdown-item">
                    <i className="bx bx-cog"></i>
                    Settings
                  </Link>
                </li>
                <li>
                  <Link to="/help" className="dropdown-item">
                    <i className="bx bx-help-circle"></i>
                    Help
                  </Link>
                </li>
                <li className="dropdown-divider"></li>
                <li>
                  <button onClick={handleLogout} className="dropdown-item" disabled={loggingOut}>
                    <i className="bx bx-log-out"></i>
                    {loggingOut ? 'Logging out...' : 'Logout'}
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

export default ExpertNavbar;