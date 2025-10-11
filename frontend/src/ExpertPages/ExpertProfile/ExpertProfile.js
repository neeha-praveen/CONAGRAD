import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import expertApi from '../../config/expertApi.js';
import './ExpertProfile.css';
import ExpertNavbar from "../../components/Expert/ExpertNavbar/ExpertNavbar.js";

const ExpertProfile = () => {
  const { expertId } = useParams();

  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [editedData, setEditedData] = useState(null);
  const [newExpertise, setNewExpertise] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const predefinedExpertise = [
    'Biology', 'Chemistry', 'Mathematics', 'Computer Science', 'Development',
    'Physics', 'Engineering', 'Medicine', 'Law', 'Business', 'Arts',
    'Humanities', 'Social Sciences', 'Other'
  ];

  useEffect(() => {
    const fetchExpertData = async () => {
      try {
        const response = await expertApi.get(`/expert/profile/${expertId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("expertToken")}`
          }
        });
        setUserData(response.data);
        setEditedData(response.data);
      } catch (error) {
        console.error('Error fetching expert data:', error);
      }
    };

    fetchExpertData();
  }, [expertId]);
const handleEdit = () => {
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await expertApi.put(`/expert/profile/${expertId}`, editedData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("expertToken")}`
        }
      });

      setUserData(response.data);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile' });
    }
  };

  const handleAddExpertise = () => {
    if (newExpertise.trim() !== '') {
      const expertiseValue = predefinedExpertise.includes(newExpertise.trim())
        ? newExpertise.trim()
        : `Custom: ${newExpertise.trim()}`;

      setEditedData(prev => ({
        ...prev,
        expertise: [...prev.expertise, expertiseValue]
      }));
      setNewExpertise('');
    }
  };

  const handleRemoveExpertise = (index) => {
    setEditedData(prev => ({
      ...prev,
      expertise: prev.expertise.filter((_, i) => i !== index)
    }));
  };

  if (!userData) return <div>Loading...</div>;


  return (
    <div className="expert-profile-container">
      <ExpertNavbar/>
      <div className="expert-profile-content">
        <div className="profile-header-row">
          <h2>Profile</h2>
          {isEditing ? (
            <button className="save-btn" onClick={handleSave}>Save Changes</button>
          ) : (
            <button className="edit-btn" onClick={handleEdit}>Edit Profile</button>
          )}
        </div>
        <div className="profile-section">
          <div className="profile-section col1">
            <img src={`${process.env.PUBLIC_URL}/default-profile.jpg`} alt="Profile" className="profile-image" />
            <h3 className="profile-name">{userData.username}</h3>
            <p className="rating">Rating: 4.5/5</p>
            <p className="assignment-count">Assignments Completed: 100</p>
          </div>
          <div className="profile-section col2">
            <h3 className='personal-info'>Personal Information</h3>
            <div className='info-item name'>
              <p className='info-item-heading'>Name: </p>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={editedData.name}
                  onChange={handleInputChange}
                  className="info-item-value"
                />
              ) : (
                <p className='info-item-value'>{userData.name}</p>
              )}
            </div>
            <div className='info-item email'>
              <p className='info-item-heading'>Email: </p>
              <p className='info-item-value'>{userData.email}</p>
            </div>
            <div className='info-item bio'>
              <p className='info-item-heading'>Bio: </p>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={editedData.bio}
                  onChange={handleInputChange}
                  className="info-item-value"
                />
              ) : (
                <p className='info-item-value'>{userData.bio}</p>
              )}
            </div>
            <div className='info-item expertise'>
              <p className='info-item-heading'>Areas of Expertise: </p>
              <div className='expertise-tags'>
                {(isEditing ? editedData.expertise : userData.expertise).map((topic, index) => (
                  <span key={index} className="expertise-tag">
                    {topic}
                    {isEditing && (
                      <button
                        className="remove-expertise-btn"
                        onClick={() => handleRemoveExpertise(index)}
                      >
                        &times;
                      </button>
                    )}
                  </span>
                ))}
              </div>
              {isEditing && (
                <div className="add-expertise">
                  <select
                    value={newExpertise}
                    onChange={(e) => setNewExpertise(e.target.value)}
                    className="new-expertise-select"
                  >
                    <option value="">Select an expertise</option>
                    {predefinedExpertise.map((expertise) => (
                      <option key={expertise} value={expertise}>
                        {expertise}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={newExpertise}
                    onChange={(e) => setNewExpertise(e.target.value)}
                    placeholder="Or type a custom expertise"
                    className="new-expertise-input"
                  />
                  <button className="add-expertise-btn" onClick={handleAddExpertise}>
                    Add
                  </button>
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