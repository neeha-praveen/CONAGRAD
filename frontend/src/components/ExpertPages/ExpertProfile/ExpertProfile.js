import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ExpertNavbar from '../../ExpertNavbar/ExpertNavbar';
import './ExpertProfile.css';

const ExpertProfile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    expertise: [],
    education: {
      university: '',
      specialization: ''
    }
  });
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchExpertProfile();
    fetchExpertStats();
  }, []);

  const fetchExpertProfile = async () => {
    try {
      const token = localStorage.getItem('expertToken');
      const response = await axios.get('http://localhost:4000/expert/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
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
      console.error('Error fetching stats:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('expertToken');
      await axios.put('http://localhost:4000/expert/profile', profile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="expert-profile-container">
      <ExpertNavbar />
      <div className="profile-content">
        <div className="profile-header">
          <h1>My Profile</h1>
          <button 
            className="edit-profile-btn"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <div className="profile-grid">
          <div className="profile-left">
            <div className="profile-avatar">
              <i className="bx bxs-user-circle"></i>
            </div>
            <div className="stats-container">
              <div className="stat-box">
                <span className="stat-number">{stats.total}</span>
                <span className="stat-label">Assignments</span>
              </div>
              <div className="stat-box">
                <span className="stat-number">{stats.completed}</span>
                <span className="stat-label">Completed</span>
              </div>
              <div className="stat-box">
                <span className="stat-number">{stats.pending}</span>
                <span className="stat-label">Pending</span>
              </div>
            </div>
          </div>

          <div className="profile-right">
            <div className="info-section">
              <h2>Personal Information</h2>
              {isEditing ? (
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <h2>Education Details</h2>
                  <div className="form-group">
                    <label>University</label>
                    <input
                      type="text"
                      value={profile.education.university}
                      onChange={(e) => setProfile({
                        ...profile,
                        education: {...profile.education, university: e.target.value}
                      })}
                      placeholder="Enter your university"
                    />
                  </div>
                  <div className="form-group">
                    <label>Specialization</label>
                    <input
                      type="text"
                      value={profile.education.specialization}
                      onChange={(e) => setProfile({
                        ...profile,
                        education: {...profile.education, specialization: e.target.value}
                      })}
                      placeholder="Enter your specialization"
                    />
                  </div>
                  <button type="submit" className="save-btn">Save Changes</button>
                </form>
              ) : (
                <div className="profile-details">
                  <div className="detail-item">
                    <label>Name</label>
                    <p>{profile.name}</p>
                  </div>
                  <div className="detail-item">
                    <label>Email</label>
                    <p>{profile.email}</p>
                  </div>
                  <div className="detail-item">
                    <label>Phone</label>
                    <p>{profile.phone || 'Not provided'}</p>
                  </div>
                  <h2>Education Details</h2>
                  <div className="detail-item">
                    <label>University</label>
                    <p>{profile.education.university || 'Not provided'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Specialization</label>
                    <p>{profile.education.specialization || 'Not provided'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertProfile;