import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFilter, FaEye, FaDownload, FaUpload, FaComments } from 'react-icons/fa';
import DashboardLayout from './layouts/DashboardLayout';
import { axiosInstance } from '../config/api';
import './StudentDashboard.css';

export default function StudentDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const navigate = useNavigate();

  const handleDownload = async (fileUrl, fileName, assignmentId) => {
    if (!fileUrl || !fileName) {
      setError('File information is missing');
      return;
    }

    try {
        setDownloadingId(assignmentId);
        setDownloadProgress(0);
        setError('');
        
        // Use the fileUrl directly as it should contain the complete path
        // If fileUrl starts with '/uploads/', use it directly
        // If it's just a filename, construct the download URL
        let downloadUrl;
        if (fileUrl.startsWith('/uploads/') || fileUrl.startsWith('uploads/')) {
            // Direct file access
            downloadUrl = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
        } else {
            // Use the download endpoint with filename
            const filename = fileUrl.split('/').pop();
            downloadUrl = `/student/download/${filename}`;
        }
        
        const response = await axiosInstance.get(downloadUrl, {
            responseType: 'blob',
            onDownloadProgress: (progressEvent) => {
                const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setDownloadProgress(progress);
            }
        });
        
        // Create download link
        const blob = new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        setSuccess('Download completed successfully!');
        setTimeout(() => setSuccess(''), 3000);
        
    } catch (error) {
        console.error('Download error:', error);
        setError(
          error.response?.status === 404
            ? 'File not found on the server. Please contact support.'
            : 'Failed to download file. Please try again.'
        );
    } finally {
        setDownloadingId(null);
        setDownloadProgress(0);
    }
  };

  // Update fetchAssignments to use axiosInstance consistently
  const fetchAssignments = useCallback(async () => {
    try {
        const token = localStorage.getItem('studentToken');
        
        if (!token) {
            navigate('/');
            return;
        }

        // Use axiosInstance which handles the base URL and auth
        const response = await axiosInstance.get('/student/assignments');

        if (response.data && Array.isArray(response.data)) {
            setAssignments(response.data);
            setError('');
        } else {
            setAssignments([]);
            setError('No assignments found.');
        }
    } catch (error) {
        console.error('Error fetching assignments:', error);
        setError('Failed to fetch assignments. Please try again.');
        setAssignments([]);
    }
  }, [navigate]);

  useEffect(() => {
    const validateSession = () => {
      const token = localStorage.getItem('studentToken');
      if (!token) {
        navigate('/');
        return false;
      }
      return true;
    };

    if (validateSession()) {
      fetchAssignments();
    }
  }, [fetchAssignments, navigate]);

  // Navigate to upload page instead of inline upload
  const handleUploadClick = () => {
    navigate('/student-upload');
  };

  // Used for inline file upload modal - keeping for backward compatibility
  // eslint-disable-next-line no-unused-vars
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size should not exceed 10MB');
        return;
      }
      setFile(selectedFile);
      setShowDetailsForm(true);
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title) {
      setError('Please provide both title and file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('subject', 'General');
    formData.append('dueDate', deadline);

    try {
      const response = await axiosInstance.post('/student/upload-assignment', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });

      if (response.data) {
        setSuccess('Assignment uploaded successfully!');
        setFile(null);
        setTitle('');
        setDescription('');
        setDeadline('');
        setUploadProgress(0);
        setShowDetailsForm(false);
        fetchAssignments();
      }
    } catch (error) {
      console.error('Upload error:', error.response?.data || error);
      setError(error.response?.data?.error || 'Failed to upload assignment');
    }
  };

  const filteredAssignments = assignments
    .filter(assignment => {
      if (filterStatus === 'all') return true;
      return assignment.status === filterStatus;
    })
    .sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate))
    .slice(0, 6);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'status-completed';
      case 'pending': return 'status-pending';
      case 'assigned': return 'status-assigned';
      default: return '';
    }
  };

  return (
    <DashboardLayout>
      <div className="dashboard-content">
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}
        
        {downloadingId && downloadProgress > 0 && (
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
        
        <div className="assignments-section">
          <div className="section-header">
            <h2>Recent Assignments</h2>
            <div className="header-actions">
              <div className="filter-group">
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Assignments</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="assigned">Assigned</option>
                </select>
                <FaFilter className="filter-icon" />
              </div>
              <button 
                className="view-all-btn"
                onClick={() => navigate('/assignments')}
              >
                View All Assignments
              </button>
            </div>
          </div>

          <div className="assignments-list">
            {filteredAssignments.length === 0 ? (
              <div className="no-assignments">
                <i className="fas fa-folder-open"></i>
                <p>No {filterStatus !== 'all' ? filterStatus : ''} assignments found</p>
              </div>
            ) : (
              filteredAssignments.map((assignment) => (
                <div 
                  key={assignment._id} 
                  className={`assignment-card ${getStatusColor(assignment.status)}`}
                >
                  <div className="assignment-header">
                    <h3>{assignment.title}</h3>
                    <span className="status-badge">{assignment.status}</span>
                  </div>
                  
                  {assignment.description && (
                    <p className="assignment-description">{assignment.description}</p>
                  )}
                  
                  <div className="assignment-info">
                    <span>
                      <i className="far fa-calendar"></i>
                      {new Date(assignment.submittedDate).toLocaleDateString()}
                    </span>
                    <span>
                      <i className="fas fa-file"></i>
                      {assignment.fileType}
                    </span>
                  </div>

                  {/* Inside the assignment-actions div, add a View Bids button */}
                  <div className="assignment-actions">
                    <button 
                      className="action-btn view"
                      onClick={() => navigate('/assignments', { state: { assignmentId: assignment._id } })}
                    >
                      <FaEye /> View
                    </button>
                    {assignment.bids && assignment.bids.length > 0 && (
                      <button 
                        className="action-btn bids"
                        onClick={() => navigate(`/assignments/${assignment._id}/bids`)}
                      >
                        <FaComments /> Bids ({assignment.bids.length})
                      </button>
                    )}
                    <button 
                      className={`action-btn download ${downloadingId === assignment._id ? 'downloading' : ''}`}
                      onClick={() => handleDownload(assignment.fileUrl, assignment.fileName, assignment._id)}
                      disabled={downloadingId === assignment._id}
                    >
                      <FaDownload /> 
                      {downloadingId === assignment._id 
                        ? `Downloading ${downloadProgress}%` 
                        : 'Download'
                      }
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upload Button - Navigate to upload page */}
        <div className="upload-section">
          <button className="upload-button" onClick={handleUploadClick}>
            <FaUpload /> Upload Assignment
          </button>
        </div>

        {/* Keep the modal for backward compatibility but recommend using the dedicated upload page */}
        {showDetailsForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Assignment Details</h3>
              <form onSubmit={handleFinalSubmit}>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Deadline</label>
                  <input
                    type="datetime-local"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
                {uploadProgress > 0 && (
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}
                <div className="modal-actions">
                  <button type="submit" className="submit-btn">
                    Upload
                  </button>
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => {
                      setShowDetailsForm(false);
                      setFile(null);
                      setTitle('');
                      setDescription('');
                      setDeadline('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}