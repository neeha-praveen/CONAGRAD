import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ExpertDashboard.css";

const ExpertDashboard = () => {
  const [userData, setUserData] = useState({
    username: localStorage.getItem('expertUsername') || 'Expert'
  });
  const [assignments, setAssignments] = useState([]);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('Loading...');

  useEffect(() => {
    // Debug logs
    console.log('Stored username:', localStorage.getItem('expertUsername'));
    console.log('Current userData:', userData);
    
    const storedUsername = localStorage.getItem('expertUsername');
    if (storedUsername) {
      console.log('Setting username to:', storedUsername); // Debug log
      setUserData({ username: storedUsername });
    }
    fetchAssignments();
    checkCurrentAssignment();

    const username = localStorage.getItem('expertUsername');
    console.log('Username from storage:', username);
    setDisplayName(username || 'No username found');

    // Check storage changes
    window.addEventListener('storage', () => {
      const updatedUsername = localStorage.getItem('expertUsername');
      setDisplayName(updatedUsername || 'No username found');
    });

    return () => {
      window.removeEventListener('storage', () => {});
    };
  }, []);

  const getUserData = async () => {
    try {
      const token = localStorage.getItem('expertToken');
      const response = await axios.get('http://localhost:4000/expert/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserData(response.data);
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      console.log('Attempting to fetch assignments...');
      const token = localStorage.getItem('expertToken');
      if (!token) {
        throw new Error('No authentication token found.');
      }
  
      const response = await axios.get('http://localhost:4000/available-assignments', {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      console.log('Assignment response:', response.data);
      setAssignments(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setError('Failed to fetch assignments');
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const checkCurrentAssignment = async () => {
    try {
      const token = localStorage.getItem('expertToken');
      if (!token) return;

      const response = await axios.get('http://localhost:4000/expert/current-assignment', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentAssignment(response.data);
    } catch (error) {
      console.error('Error checking current assignment:', error);
    }
  };

  const handleAcceptAssignment = async (assignmentId) => {
    try {
      if (currentAssignment) {
        setError('You already have an active assignment. Please complete it first.');
        return;
      }

      const token = localStorage.getItem('expertToken');
      const response = await axios.post(
        `http://localhost:4000/accept-assignment/${assignmentId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setCurrentAssignment(response.data.assignment);
      fetchAssignments();
    } catch (err) { 
      setError('Failed to accept assignment');
    }
  };

  const handleSubmitAssignment = async () => {
    try {
      const token = localStorage.getItem('expertToken');
      await axios.post(
        `http://localhost:4000/complete-assignment/${currentAssignment._id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setCurrentAssignment(null);
      fetchAssignments();
    } catch (err) {
      setError('Failed to submit assignment');
    }
  };

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="navbar-left">
          <Link to="/" className="navbar-logo">
            <img src="/Conagrad.jpg" alt="Logo" />
          </Link>
        </div>

        <div className="navbar-right">
          <Link to="/expert-dashboard" className="nav-link active">
            <i className="bx bx-home"></i>
            <span>Home</span>
          </Link>

          <Link to="/history" className="nav-link">
            <i className="bx bx-history"></i>
            <span>History</span>
          </Link>

          <Link to="/your-work" className="nav-link">
            <i className="bx bx-briefcase"></i>
            <span>Your Work</span>
          </Link>

          <div className="profile-container">
            <div className="profile-trigger">
              <img 
                src="/default-profile.jpg" 
                alt="Profile" 
                className="profile-image"
              />
              <span className="profile-name">
                {displayName}
              </span>
            </div>

            <div className="profile-dropdown">
              <ul className="dropdown-menu">
                <li>
                  <Link to="/profile" className="dropdown-item">
                    <i className="bx bx-user"></i>
                    Profile
                  </Link>
                </li>
                <li>
                  <Link to="/settings" className="dropdown-item">
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
                  <button onClick={() => {
                    localStorage.removeItem('expertToken');
                    localStorage.removeItem('expertUsername');
                    navigate('/expert-login');
                  }} className="dropdown-item">
                    <i className="bx bx-log-out"></i>
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      <div className="dashboard-content">
        {currentAssignment ? (
          <div className="current-assignment-section">
            <h2>Current Assignment</h2>
            <div className="current-assignment-card">
              <h3>{currentAssignment.title}</h3>
              <div className="assignment-details">
                <p><i className="bx bx-user"></i> Student: {currentAssignment.studentName}</p>
                <p><i className="bx bx-book"></i> Subject: {currentAssignment.subject}</p>
                <p><i className="bx bx-calendar"></i> Due: {new Date(currentAssignment.dueDate).toLocaleDateString()}</p>
                <p><i className="bx bx-text"></i> Description: {currentAssignment.description}</p>
                {currentAssignment.fileUrl && (
                  <div className="file-section">
                    <i className="bx bx-file"></i>
                    <span>{currentAssignment.fileName}</span>
                    <button 
                      className="download-btn"
                      onClick={() => window.open(`http://localhost:4000${currentAssignment.fileUrl}`, '_blank')}
                    >
                      Download
                    </button>
                  </div>
                )}
              </div>
              <button 
                className="submit-btn"
                onClick={handleSubmitAssignment}
              >
                Submit Assignment
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2>Available Assignments</h2>
            {loading ? (
              <div className="loading-spinner"></div>
            ) : error ? (
              <div className="error-message">
                {error}
                <button onClick={fetchAssignments} className="retry-btn">
                  Retry
                </button>
              </div>
            ) : assignments.length === 0 ? (
              <div className="no-assignments">
                No assignments available at the moment
              </div>
            ) : (
              <div className="assignments-grid">
                {assignments.map((assignment) => (
                  <div key={assignment._id} className="assignment-card">
                    <h3>{assignment.title}</h3>
                    <div className="assignment-details">
                      <p><i className="bx bx-user"></i> Student: {assignment.studentName}</p>
                      <p><i className="bx bx-book"></i> Subject: {assignment.subject}</p>
                      <p><i className="bx bx-calendar"></i> Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                      <p><i className="bx bx-text"></i> Description: {assignment.description}</p>
                    </div>
                    <button 
                      className="accept-btn"
                      onClick={() => handleAcceptAssignment(assignment._id)}
                    >
                      Accept Assignment
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ExpertDashboard;