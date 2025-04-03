import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaUser, 
  FaUserEdit,
  FaSignOutAlt, 
  FaHome, 
  FaFileAlt, 
  FaUserCircle, 
  FaCog, 
  FaQuestionCircle,
  FaBell,
  FaShieldAlt,
  FaBookmark
} from 'react-icons/fa';
import './DashboardLayout.css';

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const userData = JSON.parse(localStorage.getItem('studentData') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('studentToken');
    localStorage.removeItem('studentData');
    setShowProfileMenu(false);
    navigate('/');
  };

  return (
    <div className="dashboard-layout">
      {/* Fixed Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <Link to="/dashboard" className="logo">
            <h1>CONAGRAD</h1>
          </Link>
          <nav className="main-nav">
            <Link to="/dashboard" className="nav-item">
              <FaHome /> Dashboard
            </Link>
            <Link to="/assignments" className="nav-item">
              <FaFileAlt /> Assignments
            </Link>
            <Link to="/profile" className="nav-item">
              <FaUserCircle /> Profile
            </Link>
            <Link to="/settings" className="nav-item">
              <FaCog /> Settings
            </Link>
            <Link to="/help" className="nav-item">
              <FaQuestionCircle /> Help
            </Link>
          </nav>
        </div>
        <div className="header-right">
          <div className="profile-menu">
            <button 
              className="profile-button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <FaUser />
              <span>{userData?.name || 'User'}</span>
            </button>
            {showProfileMenu && (
              <div className="profile-dropdown">
                <Link to="/profile" className="dropdown-item">
                  <FaUserEdit /> Edit Profile
                </Link>
                <Link to="/notifications" className="dropdown-item">
                  <FaBell /> Notifications
                </Link>
                <Link to="/saved" className="dropdown-item">
                  <FaBookmark /> Saved Items
                </Link>
                <Link to="/security" className="dropdown-item">
                  <FaShieldAlt /> Security
                </Link>
                <button onClick={handleLogout} className="dropdown-item">
                  <FaSignOutAlt /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout; 