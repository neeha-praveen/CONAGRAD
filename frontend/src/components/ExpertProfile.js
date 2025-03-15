import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './ExpertProfile.css';

const ExpertProfile = () => {
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        username: '',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState({});
    const [stats, setStats] = useState({
        completedAssignments: 0,
        activeAssignments: 0,
        rating: 0,
    });

    useEffect(() => {
        fetchProfileData();
        fetchExpertStats();
    }, []);

    const fetchProfileData = async () => {
        try {
            const token = localStorage.getItem('expertToken');
            const response = await axios.get('http://localhost:4000/expert/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfileData(response.data);
            setEditedData(response.data);
            setLoading(false);
        } catch (error) {
            setError('Failed to fetch profile data');
            setLoading(false);
        }
    };

    const fetchExpertStats = async () => {
        try {
            const token = localStorage.getItem('expertToken');
            const response = await axios.get('http://localhost:4000/expert/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch expert stats:', error);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedData(profileData);
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('expertToken');
            await axios.put('http://localhost:4000/expert/profile/update', editedData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfileData(editedData);
            setIsEditing(false);
            // Show success message
        } catch (error) {
            setError('Failed to update profile');
        }
    };

    const handleChange = (e) => {
        setEditedData({
            ...editedData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="dashboard-container">
            {/* Navbar */}
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
                            <span className="profile-name">{profileData.name}</span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Profile Content */}
            <div className="profile-content">
                {loading ? (
                    <div className="loading-spinner"></div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : (
                    <div className="profile-container">
                        <div className="profile-header">
                            <div className="profile-avatar">
                                <img src="/default-profile.jpg" alt="Profile" />
                                <div className="profile-status online"></div>
                            </div>
                            <div className="profile-info">
                                <h1>{profileData.name}</h1>
                                <p className="profile-title">Expert</p>
                            </div>
                        </div>

                        <div className="stats-cards">
                            <div className="stat-card">
                                <i className="bx bx-check-circle"></i>
                                <div className="stat-info">
                                    <h3>{stats.completedAssignments}</h3>
                                    <p>Completed Assignments</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <i className="bx bx-time"></i>
                                <div className="stat-info">
                                    <h3>{stats.activeAssignments}</h3>
                                    <p>Active Assignments</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <i className="bx bx-star"></i>
                                <div className="stat-info">
                                    <h3>{stats.rating.toFixed(1)}</h3>
                                    <p>Average Rating</p>
                                </div>
                            </div>
                        </div>

                        <div className="profile-details">
                            <h2>Profile Details</h2>
                            {isEditing ? (
                                <div className="edit-form">
                                    <div className="form-group">
                                        <label>Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={editedData.name}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={editedData.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Username</label>
                                        <input
                                            type="text"
                                            name="username"
                                            value={editedData.username}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="button-group">
                                        <button className="save-btn" onClick={handleSave}>
                                            Save Changes
                                        </button>
                                        <button className="cancel-btn" onClick={handleCancel}>
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="profile-info-list">
                                    <div className="info-item">
                                        <i className="bx bx-user"></i>
                                        <div>
                                            <label>Name</label>
                                            <p>{profileData.name}</p>
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <i className="bx bx-envelope"></i>
                                        <div>
                                            <label>Email</label>
                                            <p>{profileData.email}</p>
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <i className="bx bx-id-card"></i>
                                        <div>
                                            <label>Username</label>
                                            <p>{profileData.username}</p>
                                        </div>
                                    </div>
                                    <button className="edit-btn" onClick={handleEdit}>
                                        Edit Profile
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExpertProfile; 