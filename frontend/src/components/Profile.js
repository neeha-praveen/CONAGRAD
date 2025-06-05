import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaUniversity, 
  FaGraduationCap, 
  FaCalendar, 
  FaCheck, 
  FaTimes, 
  FaCamera,
  FaEdit,
  FaSave
} from 'react-icons/fa';
import DashboardLayout from './layouts/DashboardLayout';
import './Profile.css';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [userData, setUserData] = useState({
    name: localStorage.getItem('name') || '',
    email: localStorage.getItem('email') || '',
    phone: localStorage.getItem('userPhone') || '',
    university: localStorage.getItem('userUniversity') || '',
    course: localStorage.getItem('userCourse') || '',
    year: localStorage.getItem('userYear') || ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const formRef = useRef(null);

  useEffect(() => {
    // Load all profile data from localStorage if available
    const savedName = localStorage.getItem('name');
    const savedEmail = localStorage.getItem('email');
    const savedPhone = localStorage.getItem('userPhone');
    const savedUniversity = localStorage.getItem('userUniversity');
    const savedCourse = localStorage.getItem('userCourse');
    const savedYear = localStorage.getItem('userYear');
    
    // Load saved profile image if available
    const savedProfileImage = localStorage.getItem('profileImage');
    if (savedProfileImage) {
      setPreviewImage(savedProfileImage);
    }
    
    setUserData({
      name: savedName || '',
      email: savedEmail || '',
      phone: savedPhone || '',
      university: savedUniversity || '',
      course: savedCourse || '',
      year: savedYear || ''
    });
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image size should not exceed 5MB' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result;
        setPreviewImage(imageData);
        localStorage.setItem('profileImage', imageData);
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
      // Save all editable fields
      localStorage.setItem('userPhone', userData.phone);
      localStorage.setItem('userUniversity', userData.university);
      localStorage.setItem('userCourse', userData.course);
      localStorage.setItem('userYear', userData.year);

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      
      // Don't clear the fields after update
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    }
  };

  const cancelEdit = () => {
    // Reset to saved values
    setUserData({
      name: localStorage.getItem('name') || '',
      email: localStorage.getItem('email') || '',
      phone: localStorage.getItem('userPhone') || '',
      university: localStorage.getItem('userUniversity') || '',
      course: localStorage.getItem('userCourse') || '',
      year: localStorage.getItem('userYear') || ''
    });
    setIsEditing(false);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <DashboardLayout>
      <motion.div 
        className="profile-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="profile-card"
          variants={itemVariants}
        >
          <motion.div 
            className="profile-header"
            variants={itemVariants}
          >
            <h2>My Profile</h2>
            <motion.button
              className={isEditing ? "cancel-button" : "edit-button"}
              onClick={() => isEditing ? cancelEdit() : setIsEditing(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isEditing ? (
                <>
                  <FaTimes /> Cancel
                </>
              ) : (
                <>
                  <FaEdit /> Edit Profile
                </>
              )}
            </motion.button>
          </motion.div>

          <AnimatePresence>
            {message.text && (
              <motion.div 
                className={`alert alert-${message.type}`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {message.type === 'success' ? <FaCheck /> : <FaTimes />}
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="profile-content">
            <motion.div 
              className="profile-sidebar"
              variants={itemVariants}
            >
              <div className="profile-image-wrapper">
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
                      <FaUser />
                    </motion.div>
                  )}
                  {isEditing && (
                    <motion.label 
                      className="image-upload-label"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.9)" }}
                    >
                      <FaCamera /> Change Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="image-upload-input"
                      />
                    </motion.label>
                  )}
                </div>
              </div>
              
              <div className="profile-stats">
                <div className="stat-item">
                  <h4>Assignments</h4>
                  <p>12</p>
                </div>
                <div className="stat-item">
                  <h4>Completed</h4>
                  <p>8</p>
                </div>
                <div className="stat-item">
                  <h4>Pending</h4>
                  <p>4</p>
                </div>
              </div>
            </motion.div>

            <motion.form 
              className="profile-details"
              onSubmit={handleSubmit}
              ref={formRef}
              variants={itemVariants}
            >
              <div className="form-section">
                <h3>Personal Information</h3>
                
                <motion.div 
                  className="detail-group"
                  variants={itemVariants}
                  whileHover={{ x: isEditing ? 5 : 0 }}
                >
                  <label><FaUser className="detail-icon" /> Name</label>
                  <input
                    type="text"
                    name="name"
                    value={userData.name}
                    disabled={true}
                    className="disabled-input"
                  />
                </motion.div>

                <motion.div 
                  className="detail-group"
                  variants={itemVariants}
                  whileHover={{ x: isEditing ? 5 : 0 }}
                >
                  <label><FaEnvelope className="detail-icon" /> Email</label>
                  <input
                    type="email"
                    name="email"
                    value={userData.email}
                    disabled={true}
                    className="disabled-input"
                  />
                </motion.div>

                <motion.div 
                  className="detail-group"
                  variants={itemVariants}
                  whileHover={{ x: isEditing ? 5 : 0 }}
                >
                  <label><FaPhone className="detail-icon" /> Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={userData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Enter your phone number"
                    className={isEditing ? "active-input" : ""}
                  />
                </motion.div>
              </div>

              <motion.div 
                className="form-section"
                variants={itemVariants}
              >
                <h3><FaGraduationCap /> Education Details</h3>
                
                <motion.div 
                  className="detail-group"
                  variants={itemVariants}
                  whileHover={{ x: isEditing ? 5 : 0 }}
                >
                  <label><FaUniversity className="detail-icon" /> University</label>
                  <input
                    type="text"
                    name="university"
                    value={userData.university}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Enter your university"
                    className={isEditing ? "active-input" : ""}
                  />
                </motion.div>

                <motion.div 
                  className="detail-group"
                  variants={itemVariants}
                  whileHover={{ x: isEditing ? 5 : 0 }}
                >
                  <label><FaGraduationCap className="detail-icon" /> Course</label>
                  <input
                    type="text"
                    name="course"
                    value={userData.course}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Enter your course"
                    className={isEditing ? "active-input" : ""}
                  />
                </motion.div>

                <motion.div 
                  className="detail-group"
                  variants={itemVariants}
                  whileHover={{ x: isEditing ? 5 : 0 }}
                >
                  <label><FaCalendar className="detail-icon" /> Year</label>
                  <input
                    type="text"
                    name="year"
                    value={userData.year}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Enter your year"
                    className={isEditing ? "active-input" : ""}
                  />
                </motion.div>
              </motion.div>

              {isEditing && (
                <motion.button
                  type="submit"
                  className="save-button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FaSave /> Save Changes
                </motion.button>
              )}
            </motion.form>
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Profile;