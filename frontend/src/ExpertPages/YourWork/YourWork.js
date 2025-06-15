import React, { useEffect, useState } from 'react';
import './YourWork.css';
import ExpertNavbar from '../../components/Expert/ExpertNavbar/ExpertNavbar';
import {
  Calendar, CheckCircle, Clock, File, FileText, Send,
  Upload, User, X
} from 'lucide-react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const YourWork = () => {
  const [workDescription, setWorkDescription] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { assignmentId } = useParams();

  // Fetch assignment data
  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('expertToken');
        if (!token) {
          setError('No authentication token found');
          return;
        }

        const res = await axios.get('/api/expert/assigned-assignments', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const matched = res.data.find(a => a._id === assignmentId);
        if (!matched) {
          setError('Assignment not found');
          return;
        }

        setAssignment(matched);
      } catch (err) {
        console.error('Failed to fetch assignment:', err);
        setError('Failed to load assignment details');
      } finally {
        setLoading(false);
      }
    };

    if (assignmentId) {
      fetchAssignment();
    }
  }, [assignmentId]);

  const calculateTimeRemaining = (dueDate) => {
    if (!dueDate) return 'No due date';
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Due today";
    if (diffDays === 1) return "1 day left";
    return `${diffDays} days left`;
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      file: file
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);
    const files = Array.from(event.dataTransfer.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      file: file
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (uploadedFiles.length === 0) {
      alert("Please upload a file before submitting.");
      return;
    }

    const formData = new FormData();
    formData.append('note', workDescription);
    formData.append('file', uploadedFiles[0].file); // Only submitting 1 file

    try {
      setSubmitting(true);
      const token = localStorage.getItem('expertToken');
      await axios.post(
        `/api/expert/submit-assignment/${assignmentId}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setWorkDescription('');
        setUploadedFiles([]);
      }, 3000);
    } catch (error) {
      console.error('Error submitting work:', error);
      alert("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileView = () => {
    if (assignment?.fileUrl) {
      window.open(`http://localhost:4000${assignment.fileUrl}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className='your-work-container'>
        <ExpertNavbar />
        <div className='your-work-content'>
          <div className='loading-message'>Loading assignment details...</div>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className='your-work-container'>
        <ExpertNavbar />
        <div className='your-work-content'>
          <div className='error-message'>{error || 'Assignment not found'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className='your-work-container'>
      <ExpertNavbar />
      <div className='your-work-content'>
        <div className='your-work-header'>
          <h2>Your Work</h2>
        </div>
        <div className='your-work-body'>

          {/* Assignment Info */}
          <div className='assignment-info'>
            <div className='assignment-header'>
              <div className='assignment-title'>
                <div className='assignment-icon'><FileText className='icon' /></div>
                <div className='title'>
                  <h2>{assignment.title}</h2>
                  <div className='student-name'>
                    <User className='user-icon' />
                    <span>{assignment.studentId?.username || 'Unknown Student'}</span>
                  </div>
                </div>
              </div>
              <div className={`assignment-status status-${assignment.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                {assignment.status || 'Pending'}
              </div>
            </div>

            {/* Due Date */}
            <div className='details-grid'>
              <div className="detail-card due-date-card">
                <div className="detail-header">
                  <Calendar className="detail-icon" />
                  <h4>Due Date</h4>
                </div>
                <div className="detail-content">
                  {new Date(assignment.dueDate).toLocaleDateString()}
                  <div className="time-remaining">
                    <Clock className="clock-icon" />
                    <span>{calculateTimeRemaining(assignment.dueDate)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className='description'>
              <h3><FileText size={20} /> Description</h3>
              <div className='description-text'>
                {assignment.description || 'No description provided'}
              </div>
            </div>

            {/* Attached File (from student) */}
            {assignment.fileName && (
              <div className="file-section">
                <File className="file-icon-section" />
                <span className="file-name-dark">{assignment.fileName}</span>
                <button className="download-btn" onClick={handleFileView}>View</button>
              </div>
            )}
          </div>

          {/* Submission */}
          <div className='submission-section'>
            <div className='submission-header'>
              <div className='submission-icon'><Send className='icon' /></div>
              <h3>Submit Your Work</h3>
            </div>

            {isSubmitted ? (
              <div className='success-message'>
                <CheckCircle className='success-icon' />
                Work submitted successfully!
              </div>
            ) : (
              <form className='submission-form' onSubmit={handleSubmit}>
                <div className='form-group'>
                  <label className='work-form-label'>Notes</label>
                  <textarea
                    className="workform-textarea"
                    placeholder="Describe your work or any notes you have for the student."
                    value={workDescription}
                    onChange={(e) => setWorkDescription(e.target.value)}
                    required
                  />
                </div>

                <div className='form-group'>
                  <label className="work-form-label">Upload Files</label>
                  <div
                    className={`file-upload-area ${isDragOver ? 'drag-over' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-input').click()}
                  >
                    <Upload className="upload-icon" />
                    <div className="upload-text">Click to upload or drag and drop files here</div>
                    <div className="upload-hint">Supported formats: .zip, .js, .jsx, .html, .css, .pdf, .md</div>
                    <input
                      id="file-input"
                      type="file"
                      className="file-input"
                      multiple
                      accept=".zip,.js,.jsx,.html,.css,.pdf,.md,.txt,.json"
                      onChange={handleFileUpload}
                    />
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="uploaded-files">
                      {uploadedFiles.map((file) => (
                        <div key={file.id} className="uploaded-file">
                          <div className="file-info">
                            <File className="file-icon" />
                            <span>{file.name}</span>
                            <span style={{ color: '#888', fontSize: '0.8rem' }}>
                              ({formatFileSize(file.size)})
                            </span>
                          </div>
                          <button type="button" className="remove-file" onClick={() => removeFile(file.id)}>
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="submit-button"
                  disabled={!workDescription.trim() || submitting}
                >
                  <Send className="submit-icon" />
                  {submitting ? 'Submitting...' : 'Submit Work'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default YourWork;
