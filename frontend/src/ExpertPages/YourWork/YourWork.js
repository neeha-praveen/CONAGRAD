import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './YourWork.css';
import ExpertNavbar from '../../ExpertNavbar/ExpertNavbar';

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
            <ExpertNavbar/>
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