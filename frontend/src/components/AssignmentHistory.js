import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS, getAuthHeader } from '../config/api';
import DashboardLayout from './layouts/DashboardLayout';
import { FaHistory, FaCheck, FaClock, FaDownload, FaEye, FaArrowLeft } from 'react-icons/fa';
import './AssignmentHistory.css';

const AssignmentHistory = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.STUDENT_ASSIGNMENTS, {
        headers: getAuthHeader()
      });
      setAssignments(response.data);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch assignments');
      setLoading(false);
    }
  };

  const handleDownload = async (fileUrl, fileName, assignmentId) => {
    try {
      setDownloadingId(assignmentId);
      setDownloadProgress(0);
      setError('');
      
      // Extract filename from fileUrl
      const filename = fileUrl.split('/').pop();
      const downloadUrl = API_ENDPOINTS.DOWNLOAD_FILE(filename);
      
      const response = await axios.get(downloadUrl, {
        headers: getAuthHeader(),
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setDownloadProgress(progress);
        }
      });
      
      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] 
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'download-success';
      successMessage.textContent = 'Download completed successfully!';
      document.body.appendChild(successMessage);
      setTimeout(() => successMessage.remove(), 3000);
      
    } catch (error) {
      console.error('Download error:', error);
      setError(
        error.response?.status === 404
          ? 'File not found. Please contact support.'
          : 'Failed to download file. Please try again.'
      );
    } finally {
      setDownloadingId(null);
      setDownloadProgress(0);
    }
  };

  const handleView = (assignment) => {
    setSelectedAssignment(assignment);
    setShowDetails(true);
  };

  const handleBack = () => {
    setShowDetails(false);
    setSelectedAssignment(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'pending':
        return 'status-pending';
      default:
        return 'status-assigned';
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    if (filter === 'all') return true;
    return assignment.status === filter;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading assignments...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="assignment-history-container">
        <div className="history-header">
          <div className="history-header-content">
            <h2><FaHistory /> Assignment History</h2>
            <div className="filter-buttons">
              <button 
                className={filter === 'all' ? 'active' : ''} 
                onClick={() => setFilter('all')}
              >
                All Assignments
              </button>
              <button 
                className={filter === 'completed' ? 'active' : ''} 
                onClick={() => setFilter('completed')}
              >
                <FaCheck /> Completed
              </button>
              <button 
                className={filter === 'pending' ? 'active' : ''} 
                onClick={() => setFilter('pending')}
              >
                <FaClock /> Pending
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => setError('')}>Dismiss</button>
            {error.includes('download') && (
              <button onClick={() => handleDownload(selectedAssignment?.fileUrl, selectedAssignment?.fileName, selectedAssignment?._id)}>
                Try Again
              </button>
            )}
          </div>
        )}

        {downloadingId && (
          <div className="download-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${downloadProgress}%` }}
              ></div>
            </div>
            <p>{downloadProgress}% Downloaded</p>
          </div>
        )}

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading assignments...</p>
          </div>
        ) : showDetails ? (
          <div className="assignment-details-view">
            <button className="back-button" onClick={handleBack}>
              <FaArrowLeft /> Back to Assignments
            </button>
            <div className="details-card">
              <div className="details-header">
                <h3>{selectedAssignment.title}</h3>
                <div className={`status-badge ${getStatusColor(selectedAssignment.status)}`}>
                  {selectedAssignment.status.charAt(0).toUpperCase() + selectedAssignment.status.slice(1)}
                </div>
              </div>
              <div className="details-content">
                <p>
                  <strong>Description</strong>
                  {selectedAssignment.description}
                </p>
                <p>
                  <strong>Submission Date</strong>
                  {new Date(selectedAssignment.submittedDate).toLocaleDateString()}
                </p>
                <p>
                  <strong>File Information</strong>
                  {selectedAssignment.fileName} ({selectedAssignment.fileType}) - {Math.round(selectedAssignment.fileSize / 1024)} KB
                </p>
                <p>
                  <strong>Status</strong>
                  {selectedAssignment.status.charAt(0).toUpperCase() + selectedAssignment.status.slice(1)}
                </p>
              </div>
              <div className="details-actions">
                <button 
                  className={`download-button ${downloadingId === selectedAssignment._id ? 'downloading' : ''}`}
                  onClick={() => handleDownload(selectedAssignment.fileUrl, selectedAssignment.fileName, selectedAssignment._id)}
                  disabled={downloadingId === selectedAssignment._id}
                >
                  <FaDownload /> 
                  {downloadingId === selectedAssignment._id ? 'Downloading...' : 'Download Assignment'}
                </button>
              </div>
            </div>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="no-assignments">
            <p>No {filter !== 'all' ? filter : ''} assignments found.</p>
          </div>
        ) : (
          <div className="assignments-grid">
            {filteredAssignments.map((assignment) => (
              <div key={assignment._id} className="assignment-card">
                <div className="card-header">
                  <h3>{assignment.title}</h3>
                  <div className={`status-badge ${getStatusColor(assignment.status)}`}>
                    {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                  </div>
                </div>
                <div className="card-content">
                  <p>{assignment.description}</p>
                  <p className="submission-date">
                    Submitted: {new Date(assignment.submittedDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="card-actions">
                  <button 
                    className="view-button"
                    onClick={() => handleView(assignment)}
                  >
                    <FaEye /> View Details
                  </button>
                  <button 
                    className="download-button"
                    onClick={() => handleDownload(assignment.fileUrl, assignment.fileName, assignment._id)}
                  >
                    <FaDownload /> Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AssignmentHistory; 