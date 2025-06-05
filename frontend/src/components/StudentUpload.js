import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { API_ENDPOINTS, axiosInstance } from '../config/api';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaTimes } from 'react-icons/fa';
import './StudentUpload.css';
import DashboardLayout from './layouts/DashboardLayout';  

const StudentUpload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('No file selected');

  // List of available subjects
  const availableSubjects = [
    'Mathematics', 
    'Physics', 
    'Chemistry', 
    'Biology', 
    'Computer Science',
    'English',
    'History',
    'Geography',
    'Economics',
    'Business Studies',
    'Psychology',
    'Sociology',
    'Political Science',
    'Philosophy',
    'Engineering',
    'Medicine',
    'Law',
    'Arts'
  ];

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }
  };

  const toggleSubjectDropdown = () => {
    setShowSubjectDropdown(!showSubjectDropdown);
  };

  const handleSubjectSelect = (subject) => {
    if (!selectedSubjects.includes(subject)) {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };

  const handleRemoveSubject = (subject) => {
    setSelectedSubjects(selectedSubjects.filter(s => s !== subject));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('subject', selectedSubjects.join(', '));
      formData.append('dueDate', dueDate);

      // Use axiosInstance instead of axios directly
      // The interceptors will automatically add the auth header
      const response = await axiosInstance.post(
        API_ENDPOINTS.UPLOAD_ASSIGNMENT,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.response?.data?.error || 'Failed to upload assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <DashboardLayout>
      <div className="student-upload-container">
        <div className="upload-card">
          <h2>Upload Assignment</h2>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>1. Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Enter assignment title"
              />
            </div>
            
            <div className="form-group">
              <label>2. Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Enter assignment description"
                rows="4"
              />
            </div>
            
            <div className="form-group">
              <label>3. Subject</label>
              <div className="subject-selector">
                <div className="selected-subjects">
                  {selectedSubjects.map(subject => (
                    <div key={subject} className="subject-tag">
                      {subject}
                      <button 
                        type="button" 
                        className="remove-subject" 
                        onClick={() => handleRemoveSubject(subject)}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                  <input
                    type="text"
                    className="subject-input"
                    placeholder={selectedSubjects.length ? "" : "Select subjects"}
                    onClick={toggleSubjectDropdown}
                    readOnly
                  />
                </div>
                {showSubjectDropdown && (
                  <div className="subject-dropdown">
                    {availableSubjects
                      .filter(subject => !selectedSubjects.includes(subject))
                      .map(subject => (
                        <div 
                          key={subject} 
                          className="subject-option"
                          onClick={() => handleSubjectSelect(subject)}
                        >
                          {subject}
                          <span className="add-subject"><FaPlus /></span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="form-group">
              <label>4. Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group file-upload">
              <label>5. Select File</label>
              <div className="file-input-container">
                <div className="file-name">{fileName}</div>
                <label className="file-input-label">
                  Browse
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx"
                    required
                    className="file-input"
                  />
                </label>
              </div>
            </div>
            
            <div className="form-actions">
              <motion.button
                type="submit"
                className="submit-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading}
              >
                {loading ? 'Uploading...' : 'Upload'}
              </motion.button>
              <motion.button
                type="button"
                className="cancel-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancel}
              >
                Cancel
              </motion.button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentUpload;