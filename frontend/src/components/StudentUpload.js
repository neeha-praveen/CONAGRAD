import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./StudentUpload.css";

const StudentUpload = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    dueDate: '',
    file: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('subject', formData.subject);
    data.append('dueDate', formData.dueDate);
    data.append('file', formData.file);
    // For testing purposes - replace with actual student ID from auth
    data.append('studentId', '123456789');

    try {
      const response = await axios.post('http://localhost:4000/upload-assignment', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSuccess('Assignment uploaded successfully!');
      // Clear form
      setFormData({
        title: '',
        description: '',
        subject: '',
        dueDate: '',
        file: null
      });
      // Reset file input
      document.getElementById('file-input').value = '';
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || 'Failed to upload assignment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-upload-page">
      <nav className="navbar">
        <div className="navbar-logo">
          <img src="/Conagrad.jpg" alt="Platform Logo" />
        </div>
        <div className="navbar-menu">
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/history">History</Link>
            </li>
            <li className="profile-dropdown">
              <Link to="/profile">Profile</Link>
              <ul className="dropdown">
                <li>
                  <Link to="/help">Help</Link>
                </li>
                <li>
                  <Link to="/settings">Settings</Link>
                </li>
                <li>
                  <Link to="/logout">Logout</Link>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </nav>

      <div className="upload-container">
        <h2>Upload Assignment</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Subject</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Assignment File</label>
            <input
              id="file-input"
              type="file"
              onChange={(e) => setFormData({...formData, file: e.target.files[0]})}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Uploading...' : 'Upload Assignment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentUpload;