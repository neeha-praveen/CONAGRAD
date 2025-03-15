import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ExpertDashboard.css'; // Reusing the dashboard styles

const YourWork = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [displayName, setDisplayName] = useState(localStorage.getItem('expertUsername') || 'Expert');

    useEffect(() => {
        fetchAssignedWork();
    }, []);

    const fetchAssignedWork = async () => {
        try {
            const token = localStorage.getItem('expertToken');
            const response = await axios.get('http://localhost:4000/expert/current-assignment', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAssignments(Array.isArray(response.data) ? response.data : [response.data].filter(Boolean));
            setLoading(false);
        } catch (error) {
            console.error('Error fetching assignments:', error);
            setError('Failed to fetch assignments');
            setLoading(false);
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
                    <Link to="/expert-dashboard" className="nav-link">
                        <i className="bx bx-home"></i>
                        <span>Home</span>
                    </Link>

                    <Link to="/history" className="nav-link">
                        <i className="bx bx-history"></i>
                        <span>History</span>
                    </Link>

                    <Link to="/your-work" className="nav-link active">
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
                            <span className="profile-name">{displayName}</span>
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

            {/* Main Content */}
            <div className="dashboard-content">
                <h2>Your Current Work</h2>
                
                {loading ? (
                    <div className="loading-spinner"></div>
                ) : error ? (
                    <div className="error-message">
                        {error}
                        <button onClick={fetchAssignedWork} className="retry-btn">
                            Retry
                        </button>
                    </div>
                ) : assignments.length === 0 ? (
                    <div className="no-work-message">
                        <i className="bx bx-info-circle"></i>
                        <p>You haven't been assigned any work yet</p>
                        <Link to="/expert-dashboard" className="browse-btn">
                            Browse Available Assignments
                        </Link>
                    </div>
                ) : (
                    <div className="assignments-grid">
                        {assignments.map((assignment) => (
                            <div key={assignment._id} className="assignment-card">
                                <h3>{assignment.title}</h3>
                                <div className="assignment-details">
                                    <p>
                                        <i className="bx bx-user"></i>
                                        Student: {assignment.studentId?.name || 'Unknown Student'}
                                    </p>
                                    <p>
                                        <i className="bx bx-book"></i>
                                        Subject: {assignment.subject}
                                    </p>
                                    <p>
                                        <i className="bx bx-calendar"></i>
                                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                                    </p>
                                    <p>
                                        <i className="bx bx-text"></i>
                                        Description: {assignment.description}
                                    </p>
                                    {assignment.fileUrl && (
                                        <div className="file-section">
                                            <i className="bx bx-file"></i>
                                            <span>{assignment.fileName}</span>
                                            <button 
                                                className="download-btn"
                                                onClick={() => window.open(`http://localhost:4000${assignment.fileUrl}`, '_blank')}
                                            >
                                                Download
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default YourWork; 