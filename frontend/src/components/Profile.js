import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUserCircle, FaEnvelope, FaPhone, FaUniversity, FaGraduationCap, FaCalendar } from 'react-icons/fa';
import DashboardLayout from './layouts/DashboardLayout';
import './Profile.css';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [userData, setUserData] = useState({
    name: localStorage.getItem('name') || '',
    email: localStorage.getItem('email') || '',
    phone: '',
    university: '',
    course: '',
    year: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    // Load profile data from localStorage if available
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
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Only allow changes to fields other than name and email
    if (name !== 'name' && name !== 'email') {
      setUserData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      // Save only the editable fields
      localStorage.setItem('userPhone', userData.phone);
      localStorage.setItem('userUniversity', userData.university);
      localStorage.setItem('userCourse', userData.course);
      localStorage.setItem('userYear', userData.year);

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      
      // Clear the editable fields after successful update
      setUserData(prev => ({
        ...prev,
        phone: '',
        university: '',
        course: '',
        year: ''
      }));
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    }
  };

  return (
    <DashboardLayout>
      <motion.div
        className="profile-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="profile-header">
          <motion.h2
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.5 }}
          >
            My Profile
          </motion.h2>
          <motion.button
            className="edit-button"
            onClick={() => setIsEditing(!isEditing)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </motion.button>
        </div>

        <div className="profile-content">
          <div className="profile-image-section">
            <div className="profile-image-container">
              {previewImage ? (
                <motion.img
                  src={previewImage}
                  alt="Profile"
                  className="profile-image"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              ) : (
                <motion.div
                  className="default-profile-icon"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <FaUserCircle size={120} />
                </motion.div>
              )}
              {isEditing && (
                <label className="image-upload-label">
                  Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="image-upload-input"
                  />
                </label>
              )}
            </div>
          </div>

          <form className="profile-details" onSubmit={handleSubmit}>
            {message.text && (
              <div className={`alert alert-${message.type}`}>
                {message.text}
              </div>
            )}

            <div className="detail-group">
              <label><FaUserCircle className="detail-icon" /> Name</label>
              <input
                type="text"
                name="name"
                value={userData.name}
                disabled={true}
              />
            </div>

            <div className="detail-group">
              <label><FaEnvelope className="detail-icon" /> Email</label>
              <input
                type="email"
                name="email"
                value={userData.email}
                disabled={true}
              />
            </div>

            <div className="detail-group">
              <label><FaPhone className="detail-icon" /> Phone</label>
              <input
                type="tel"
                name="phone"
                value={userData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="education-section">
              <h3><FaGraduationCap /> Education Details</h3>
              <div className="detail-group">
                <label><FaUniversity className="detail-icon" /> University</label>
                <input
                  type="text"
                  name="university"
                  value={userData.university}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Enter your university"
                />
              </div>

              <div className="detail-group">
                <label><FaGraduationCap className="detail-icon" /> Course</label>
                <input
                  type="text"
                  name="course"
                  value={userData.course}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Enter your course"
                />
              </div>

              <div className="detail-group">
                <label><FaCalendar className="detail-icon" /> Year</label>
                <input
                  type="text"
                  name="year"
                  value={userData.year}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Enter your year"
                />
              </div>
            </div>

            {isEditing && (
              <motion.button
                type="submit"
                className="edit-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Save Changes
              </motion.button>
            )}
          </form>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Profile;