import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaUser, 
  FaHome, 
  FaUserCircle, 
  FaCog, 
  FaSignOutAlt,
  FaHistory,
  FaUpload,
  FaChevronDown
} from 'react-icons/fa';
import './DashboardLayout.css';

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const userData = JSON.parse(localStorage.getItem('studentData') || 'null');
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('studentToken');
    localStorage.removeItem('studentData');
    setShowProfileMenu(false);
    navigate('/');
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <div className="header-left">
          <Link to="/dashboard" className="logo">
            <h1>CONAGRAD</h1>
          </Link>
          <nav className="main-nav">
            <Link 
              to="/dashboard" 
              className={`nav-item ${isActiveRoute('/student-dashboard') ? 'active' : ''}`}
            >
              <FaHome /> Dashboard
            </Link>
            <Link 
              to="/student-upload" 
              className={`nav-item ${isActiveRoute('/student-upload') ? 'active' : ''}`}
            >
              <FaUpload /> Upload
            </Link>
            <Link 
              to="/assignments" 
              className={`nav-item ${isActiveRoute('/assignments') ? 'active' : ''}`}
            >
              <FaHistory /> History
            </Link>
          </nav>
        </div>
        <div className="header-right">
          <div className="profile-nav" ref={menuRef}>
            <button 
              className="profile-nav-button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="profile-info">
                {userData?.profileImage ? (
                  <img 
                    src={userData.profileImage} 
                    alt="Profile" 
                    className="profile-avatar"
                  />
                ) : (
                  <FaUser className="profile-icon" />
                )}
                <span className="profile-name">{userData?.name || 'Student'}</span>
              </div>
              <FaChevronDown className={`dropdown-arrow ${showProfileMenu ? 'rotate' : ''}`} />
            </button>
            {showProfileMenu && (
              <div className="nav-dropdown">
                <div className="dropdown-header">
                  <div className="user-info">
                    <FaUser className="user-avatar" />
                    <div className="user-details">
                      <span className="user-name">{userData?.name || 'Student'}</span>
                    </div>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <Link 
                  to="/Profile" 
                  className="dropdown-item"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <FaUserCircle /> Profile
                </Link>
                <Link 
                  to="/Settings" 
                  className="dropdown-item"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <FaCog /> Settings
                </Link>
                <Link 
                  to="/Help" 
                  className="dropdown-item"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <FaUserCircle /> Help
                </Link>
                <div className="dropdown-divider"></div>
                <button 
                  onClick={handleLogout} 
                  className="dropdown-item logout-item"
                >
                  <FaSignOutAlt /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;