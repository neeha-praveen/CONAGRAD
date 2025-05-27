import React, { useState, useEffect } from 'react';
import ExpertNavbar from '../../ExpertNavbar/ExpertNavbar';
import './ExpertProfile/ExpertProfile.css';

const ExpertProfile = () => {
  const [profile, setProfile] = useState({
    name: localStorage.getItem('expertUsername') || 'Expert User',
    username: localStorage.getItem('expertUsername') || 'expert_user',
    email: 'expert@example.com',
    bio: 'Experienced professional with expertise in various subjects.',
    expertise: ['General', 'Math', 'Science', 'English'],
    education: 'Master\'s Degree in Education',
    experience: '5+ years of teaching and tutoring experience'
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExpertiseChange = (e) => {
    const expertise = e.target.value.split(',').map(item => item.trim());
    setProfile(prev => ({
      ...prev,
      expertise
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update localStorage with new name
      localStorage.setItem('expertUsername', profile.name);
      
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="expert-profile-container">
      <ExpertNavbar />
      <div className="profile-content">
        <div className="profile-header">
          <h1>Expert Profile</h1>
          {!isEditing && (
            <button 
              className="edit-profile-btn"
              onClick={() => setIsEditing(true)}
            >
              <i className="bx bx-edit"></i> Edit Profile
            </button>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <div className="profile-card">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  value={profile.username}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Bio</label>
                <textarea
                  name="bio"
                  value={profile.bio || ''}
                  onChange={handleChange}
                  rows="4"
                ></textarea>
              </div>
              
              <div className="form-group">
                <label>Areas of Expertise (comma separated)</label>
                <input
                  type="text"
                  name="expertise"
                  value={profile.expertise ? profile.expertise.join(', ') : ''}
                  onChange={handleExpertiseChange}
                />
              </div>
              
              <div className="form-group">
                <label>Education</label>
                <textarea
                  name="education"
                  value={profile.education || ''}
                  onChange={handleChange}
                  rows="3"
                ></textarea>
              </div>
              
              <div className="form-group">
                <label>Experience</label>
                <textarea
                  name="experience"
                  value={profile.experience || ''}
                  onChange={handleChange}
                  rows="3"
                ></textarea>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="save-btn" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-details">
              <div className="profile-section">
                <h3>Personal Information</h3>
                <div className="info-group">
                  <span className="info-label">Name:</span>
                  <span className="info-value">{profile.name}</span>
                </div>
                <div className="info-group">
                  <span className="info-label">Username:</span>
                  <span className="info-value">{profile.username}</span>
                </div>
                <div className="info-group">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{profile.email}</span>
                </div>
              </div>
              
              {profile.bio && (
                <div className="profile-section">
                  <h3>Bio</h3>
                  <p className="bio-text">{profile.bio}</p>
                </div>
              )}
              
              {profile.expertise && profile.expertise.length > 0 && (
                <div className="profile-section">
                  <h3>Areas of Expertise</h3>
                  <div className="expertise-tags">
                    {profile.expertise.map((item, index) => (
                      <span key={index} className="expertise-tag">{item}</span>
                    ))}
                  </div>
                </div>
              )}
              
              {profile.education && (
                <div className="profile-section">
                  <h3>Education</h3>
                  <p>{profile.education}</p>
                </div>
              )}
              
              {profile.experience && (
                <div className="profile-section">
                  <h3>Experience</h3>
                  <p>{profile.experience}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpertProfile;