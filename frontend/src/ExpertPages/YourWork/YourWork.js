import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import axios from 'axios'
import './YourWork.css'
import { Calendar, Clock, FileText, User, Coins, File, Send, CheckCircle, Upload, X, Edit } from 'lucide-react';

const YourWork = () => {
    const [loading, setLoading] = useState(false);
    const { assignmentId: assignmentId } = useParams();
    const [assignment, setAssignment] = useState(null);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    // Form states
    const [workDescription, setWorkDescription] = useState('');
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [existingFile, setExistingFile] = useState(null); // Track existing submitted file

    useEffect(() => {
        const fetchAssignment = async () => {
            try {
                setLoading(true)
                const token = localStorage.getItem('expertToken');
                if (!token) {
                    console.error('No authentication token found');
                    return;
                }
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                };
                const res = await axios.get(`http://localhost:4000/api/expert/assignment/${assignmentId}`, config)
                setAssignment(res.data)
                
                // Initialize form with existing submission data if available
                if (res.data.submissionNote) {
                    setWorkDescription(res.data.submissionNote);
                }
                
                // Set existing file info if available
                if (res.data.submittedFileName) {
                    setExistingFile({
                        name: res.data.submittedFileName,
                        url: res.data.submittedFileUrl
                    });
                }
            } catch (error) {
                console.error('Failed to fetch assignment:', error)
                setError('Failed to fetch assignment')
            } finally {
                setLoading(false)
            }
        }
        if (assignmentId) {
            fetchAssignment();
        } else {
            console.log('Assignment not found - assignmentId is:', assignmentId);
        }
    }, [assignmentId])

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

    const handleFileView = () => {
        if (assignment?.fileUrl) {
            window.open(`http://localhost:4000${assignment.fileUrl}`, '_blank');
        }
    };

    const handleSubmittedFileView = () => {
        if (assignment?.submittedFileUrl) {
            window.open(`http://localhost:4000${assignment.submittedFileUrl}`, '_blank');
        }
    };

    const handleExistingFileView = () => {
        if (existingFile?.url) {
            window.open(`http://localhost:4000${existingFile.url}`, '_blank');
        }
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

    const removeExistingFile = () => {
        setExistingFile(null);
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const refreshAssignmentData = async () => {
        try {
            const token = localStorage.getItem('expertToken');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            };
            const res = await axios.get(`http://localhost:4000/api/expert/assignment/${assignmentId}`, config);
            setAssignment(res.data);
            
            // Update form state with new data
            setWorkDescription(res.data.submissionNote || '');
            if (res.data.submittedFileName) {
                setExistingFile({
                    name: res.data.submittedFileName,
                    url: res.data.submittedFileUrl
                });
            } else {
                setExistingFile(null);
            }
        } catch (error) {
            console.error('Error refreshing assignment data:', error);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (uploadedFiles.length === 0) {
            alert("Please upload a file before submitting.");
            return;
        }

        const formData = new FormData();
        formData.append('note', workDescription);
        formData.append('file', uploadedFiles[0].file); // Only submitting 1 file based on your current backend

        try {
            setSubmitting(true);
            const token = localStorage.getItem('expertToken');
            await axios.post(
                `http://localhost:4000/api/expert/submit-assignment/${assignmentId}`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            // Refresh assignment data to get the updated submission info
            await refreshAssignmentData();
            
            setShowSuccess(true);
            setUploadedFiles([]);
            
            // Hide success message after 3 seconds
            setTimeout(() => {
                setShowSuccess(false);
            }, 3000);
            
        } catch (error) {
            console.error('Error submitting work:', error);
            alert("Submission failed. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditSubmission = () => {
        setIsEditing(true);
        setShowSuccess(false);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setUploadedFiles([]);
        // Reset form to original values
        setWorkDescription(assignment.submissionNote || '');
        if (assignment.submittedFileName) {
            setExistingFile({
                name: assignment.submittedFileName,
                url: assignment.submittedFileUrl
            });
        }
    };

    const handleSaveSubmission = async (event) => {
        event.preventDefault();
        
        // Check if we have either existing file or new file
        if (!existingFile && uploadedFiles.length === 0) {
            alert("Please keep the existing file or upload a new one.");
            return;
        }

        const formData = new FormData();
        formData.append('note', workDescription);
        
        // Only append new file if uploaded, otherwise keep existing
        if (uploadedFiles.length > 0) {
            formData.append('file', uploadedFiles[0].file);
        }

        try {
            setSubmitting(true);
            const token = localStorage.getItem('expertToken');
            await axios.post(
                `http://localhost:4000/api/expert/submit-assignment/${assignmentId}`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            // Refresh assignment data
            await refreshAssignmentData();
            
            setIsEditing(false);
            setUploadedFiles([]);
            setShowSuccess(true);
            
            setTimeout(() => {
                setShowSuccess(false);
            }, 3000);
            
        } catch (error) {
            console.error('Error updating submission:', error);
            alert("Update failed. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const isSubmitted = assignment?.status === 'to be reviewed' || assignment?.status === 'completed';
    const isCompleted = assignment?.status === 'completed';

    return (
        <div className='your-work-container'>
            <div className='your-work-content'>
                <div className='your-work-header'>
                    <h1>Your Work</h1>
                </div>

                {loading ? (
                    <div className='loading-spinner'>
                        <div className='spinner'></div>
                    </div>
                ) : error ? (
                    <div className='error-message'>
                        {error}
                        <button className='retry-btn'>Retry</button>
                    </div>
                ) : !assignment ? (
                    <div className='error-message'>
                        Assignment not found.
                    </div>
                ) : (
                    <div className='your-work-body'>
                        {/* Assignment info */}
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
                            
                            <div className='details-grid'>
                                <div className="detail-card due-date-card">
                                    <div className="detail-header">
                                        <Calendar className="detail-icon" />
                                        <h4>Due Date</h4>
                                    </div>
                                    <div className="detail-content">
                                        <div className="due-date-text">
                                            {new Date(assignment.dueDate).toLocaleDateString()}
                                        </div>
                                        <div className="time-remaining">
                                            <Clock className="clock-icon" />
                                            <span>{calculateTimeRemaining(assignment.dueDate)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Amount */}
                                <div className='detail-card'>
                                    <div className='detail-header'>
                                        <Coins className='detail-icon' />
                                        <h4>Amount</h4>
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

                            {/* Student file */}
                            {assignment.fileName && (
                                <div className='file-section'>
                                    <File className='file-icon-section' />
                                    <span className='file-name-dark'>{assignment.fileName}</span>
                                    <button className='download-btn' onClick={handleFileView}>View</button>
                                </div>
                            )}
                        </div>
                        
                        {/* Submission section */}
                        <div className='submission-section'>
                            <div className='submission-header'>
                                <div className='submission-icon'><Send className='icon'/></div>
                                <h3>
                                    {isCompleted ? 'Completed Work' : 
                                     isSubmitted ? 'Submitted Work' : 
                                     'Submit Your Work'}
                                </h3>
                            </div>

                            {showSuccess && (
                                <div className='success-message'>
                                    <CheckCircle className='success-icon' />
                                    {isEditing ? 'Submission updated successfully!' : 'Work submitted successfully!'}
                                </div>
                            )}

                            {isSubmitted && !isEditing ? (
                                <div className='submitted-work'>
                                    {/* Submitted Note */}
                                    <div className='submitted-note'>
                                        <h4>Your Note:</h4>
                                        <div className='note-content'>
                                            {assignment.submissionNote || 'No note provided'}
                                        </div>
                                    </div>

                                    {/* Submitted File */}
                                    {assignment.submittedFileName && (
                                        <div className='submitted-file'>
                                            <h4>Submitted File:</h4>
                                            <div className='file-section'>
                                                <File className='file-icon-section' />
                                                <span className='file-name-dark'>{assignment.submittedFileName}</span>
                                                <button className='download-btn' onClick={handleSubmittedFileView}>View</button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Edit button (only if not completed) */}
                                    {!isCompleted && (
                                        <button className='edit-submission-btn' onClick={handleEditSubmission}>
                                            <Edit className='edit-icon' />
                                            Edit Submission
                                        </button>
                                    )}
                                </div>
                            ) : (!isSubmitted || isEditing) ? (
                                <form className='submission-form' onSubmit={isEditing ? handleSaveSubmission : handleSubmit}>
                                    <div className='form-group'>
                                        <label className='work-form-label'>Notes</label>
                                        <textarea
                                            className={`workform-textarea ${isEditing ? 'editing' : ''}`}
                                            placeholder="Describe your work or any notes you have for the student."
                                            value={workDescription}
                                            onChange={(e) => setWorkDescription(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className='form-group'>
                                        <label className="work-form-label">Upload Files</label>
                                        
                                        {/* Show existing file when editing */}
                                        {isEditing && existingFile && (
                                            <div className="existing-file-section" style={{ marginBottom: '12px' }}>
                                                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '8px' }}>
                                                    Current file:
                                                </div>
                                                <div className="uploaded-file">
                                                    <div className="file-info">
                                                        <File className="file-icon" />
                                                        <span>{existingFile.name}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button 
                                                            type="button" 
                                                            className="download-btn" 
                                                            onClick={handleExistingFileView}
                                                            style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                                                        >
                                                            View
                                                        </button>
                                                        <button 
                                                            type="button" 
                                                            className="remove-file" 
                                                            onClick={removeExistingFile}
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

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
                                        
                                        <div
                                            className={`file-upload-area ${isDragOver ? 'drag-over' : ''}`}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                            onClick={() => document.getElementById('file-input').click()}
                                        >
                                            <Upload className="upload-icon" />
                                            <div className="upload-text">
                                                {isEditing ? 'Click to upload a new file or drag and drop' : 'Click to upload or drag and drop files here'}
                                            </div>
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
                                    </div>

                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button
                                            type="submit"
                                            className="submit-button"
                                            disabled={!workDescription.trim() || submitting || (!existingFile && uploadedFiles.length === 0)}
                                        >
                                            <Send className="submit-icon" />
                                            {submitting ? 
                                                (isEditing ? 'Saving...' : 'Submitting...') : 
                                                (isEditing ? 'Save Submission' : 'Submit Work')
                                            }
                                        </button>
                                        
                                        {isEditing && (
                                            <button
                                                type="button"
                                                className="cancel-edit-btn"
                                                onClick={handleCancelEdit}
                                                style={{
                                                    padding: '14px 24px',
                                                    background: '#6b7280',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    fontWeight: '600',
                                                    fontSize: '0.95rem',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </form>
                            ) : null}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default YourWork