import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUserCircle, FaEnvelope, FaPhone, FaUniversity, FaGraduationCap, FaBriefcase, FaAward } from 'react-icons/fa';
import './ExpertProfile.css';
import ExpertNavbar from '../../ExpertNavbar/ExpertNavbar';

const ExpertProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [userData, setUserData] = useState({
    username: localStorage.getItem('username') || 'Expert Username',
    name: localStorage.getItem('name') || 'Expert Name',
    email: localStorage.getItem('email') || 'Expert Email',
    phone: '0000000000000',
    education: 'xxxx',
    expertise: ['General', 'Math', 'Science', 'English'],
    bio: 'Experienced professional with expertise in various subjects.',
    experience: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const savedName = localStorage.getItem('name');
    const savedEmail = localStorage.getItem('email');
    
    if (savedName && savedEmail) {
      setUserData(prev => ({
        ...prev,
        name: savedName,
        email: savedEmail
      }));
    }
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Here you would typically make an API call to update the profile
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    }
  };

  return (
    <div className="expert-profile-container">
      <ExpertNavbar/>
      <div className="expert-profile-content">
        <div className="profile-header-row">
          <h2>Profile</h2>
          <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit Profile</button>
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
              <p className='info-item-value'>{userData.name}</p>
            </div>
            <div className='info-item email'>
              <p className='info-item-heading'>Email: </p>
              <p className='info-item-value'>{userData.email}</p>
            </div>
            <div className='info-item bio'>
              <p className='info-item-heading'>Bio: </p>
              <p className='info-item-value'>{userData.bio}</p>
            </div>
            <div className='info-item expertise'>
              <p className='info-item-heading'>Areas of Expertise: </p>
              <div className='expertise-tags'>
                {userData.expertise.map((topic, index) => (
                  <span key={index} className="expertise-tag">{topic}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertProfile;