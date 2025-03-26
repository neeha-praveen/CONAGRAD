import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUpload, FaTimes } from 'react-icons/fa';
import DashboardLayout from './layouts/DashboardLayout';
import { API_ENDPOINTS, getAuthHeader } from '../config/api';
import './AssignmentDetails.css';

export default function AssignmentDetails() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    // Get the file data from sessionStorage
    const fileData = sessionStorage.getItem('tempAssignmentFile');
    if (!fileData) {
      navigate('/dashboard');
      return;
    }

    // Validate token
    const token = localStorage.getItem('studentToken');
    if (!token) {
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Clear previous states
    setError('');
    setSuccess('');
    setUploadProgress(0);

    // Form validation
    if (!title.trim()) {
      setError('Please provide a title');
      return;
    }

    if (!deadline) {
      setError('Please set a deadline');
      return;
    }

    try {
      const fileData = JSON.parse(sessionStorage.getItem('tempAssignmentFile'));
      if (!fileData || !fileData.file) {
        setError('No file selected');
        return;
      }

      const formData = new FormData();
      formData.append('assignment', fileData.file);
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('deadline', deadline);
      formData.append('status', 'pending');

      const response = await axios.post(
        API_ENDPOINTS.UPLOAD_ASSIGNMENT,
        formData,
        {
          headers: {
            ...getAuthHeader(),
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        }
      );

      if (response.data) {
        setSuccess('Assignment uploaded successfully!');
        sessionStorage.removeItem('tempAssignmentFile');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(
        error.response?.data?.error || 
        'Failed to upload assignment. Please try again.'
      );
    }
  };

  const handleCancel = () => {
    sessionStorage.removeItem('tempAssignmentFile');
    navigate('/dashboard');
  };

  return (
    <DashboardLayout>
      <div className="assignment-details-page">
        <div className="details-container">
          <div className="details-card">
            <div className="card-header">
              <h2>Submit Assignment</h2>
              <button className="close-btn" onClick={handleCancel}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="details-form">
              <div className="form-group">
                <label>Assignment Title*</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter assignment title"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter assignment description"
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label>Deadline*</label>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                />
              </div>

              <div className="file-preview">
                <h3>Selected File</h3>
                <div className="file-info">
                  {sessionStorage.getItem('tempAssignmentFile') && (
                    <p>{JSON.parse(sessionStorage.getItem('tempAssignmentFile')).name}</p>
                  )}
                </div>
              </div>

              {uploadProgress > 0 && (
                <div className="progress-container">
                  <div className="progress-bar">
                    <div 
                      className="progress" 
                      style={{ width: `${uploadProgress}%` }}
                    >
                      {uploadProgress}%
                    </div>
                  </div>
                </div>
              )}

              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <div className="form-actions">
                <button type="button" onClick={handleCancel} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  <FaUpload /> Submit Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}