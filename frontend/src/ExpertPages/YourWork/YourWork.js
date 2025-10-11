import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import expertApi from '../../config/expertApi';
import './YourWork.css'
import { Calendar, Clock, FileText, User, Coins, File, Send, CheckCircle, Upload, X, Edit, MessagesSquare } from 'lucide-react';
import ChatBox from '../../components/Expert/ChatBox/ChatBox';

const YourWork = () => {
    const [loading, setLoading] = useState(false);
    const { assignmentId: assignmentId } = useParams();
    const [assignment, setAssignment] = useState(null);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);

    // Form states
    const [workDescription, setWorkDescription] = useState('');
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [existingFiles, setExistingFiles] = useState([]); // Track existing files separately
    const [isDragOver, setIsDragOver] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const expertId = localStorage.getItem("expertId");

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
                const res = await expertApi.get(`/expert/assignment/${assignmentId}`, config)
                setAssignment(res.data)

                // Initialize form with existing submission data if available
                if (res.data.submission && res.data.submission.length > 0) {
                    const latestSubmission = res.data.submission[res.data.submission.length - 1];
                    setWorkDescription(latestSubmission.expertMessage || '');

                    // Initialize existing files
                    if (latestSubmission.files && latestSubmission.files.length > 0) {
                        const existingFilesList = latestSubmission.files.map((file, index) => ({
                            id: `existing-${index}`,
                            name: file.fileName,
                            url: file.fileUrl,
                            existing: true
                        }));
                        setExistingFiles(existingFilesList);
                    }
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

    const handleSubmittedFileView = (fileUrl) => {
        if (fileUrl) {
            window.open(`http://localhost:4000${fileUrl}`, '_blank');
        }
    };

    const handleFileUpload = (event) => {
        const files = Array.from(event.target.files);
        const totalFiles = uploadedFiles.length + existingFiles.length + files.length;
        if (totalFiles > 3) {
            alert("You can upload a maximum of 3 files.");
            return;
        }
        const newFiles = files.map(file => ({
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            file: file,
            existing: false
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
        const totalFiles = uploadedFiles.length + existingFiles.length + files.length;
        if (totalFiles > 3) {
            alert("You can upload a maximum of 3 files.");
            return;
        }
        const newFiles = files.map(file => ({
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            file: file,
            existing: false
        }));
        setUploadedFiles(prev => [...prev, ...newFiles]);
    };

    const removeFile = (fileId) => {
        setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    };

    const removeExistingFile = (fileId) => {
        setExistingFiles(prev => prev.filter(file => file.id !== fileId));
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
            const res = await expertApi.get(`/expert/assignment/${assignmentId}`, config);
            setAssignment(res.data);

            // Update form state with new data
            if (res.data.submission && res.data.submission.length > 0) {
                const latestSubmission = res.data.submission[res.data.submission.length - 1];
                setWorkDescription(latestSubmission.expertMessage || '');

                // Update existing files
                if (latestSubmission.files && latestSubmission.files.length > 0) {
                    const existingFilesList = latestSubmission.files.map((file, index) => ({
                        id: `existing-${index}`,
                        name: file.fileName,
                        url: file.fileUrl,
                        existing: true
                    }));
                    setExistingFiles(existingFilesList);
                }
            } else {
                setWorkDescription('');
                setExistingFiles([]);
            }

        } catch (error) {
            console.error('Error refreshing assignment data:', error);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (uploadedFiles.length === 0) {
            alert("Please upload at least one file before submitting.");
            return;
        }

        const formData = new FormData();
        formData.append('note', workDescription);
        uploadedFiles.forEach(fileObj => {
            formData.append('files', fileObj.file);
        });

        try {
            setSubmitting(true);
            const token = localStorage.getItem('expertToken');
            await expertApi.post(
                `/expert/submit-assignment/${assignmentId}`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            await refreshAssignmentData();
            setShowSuccess(true);
            setUploadedFiles([]);

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
        // Reset new uploaded files for editing
        setUploadedFiles([]);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setUploadedFiles([]);

        // Reset form to original values
        if (assignment.submission && assignment.submission.length > 0) {
            const latestSubmission = assignment.submission[assignment.submission.length - 1];
            setWorkDescription(latestSubmission.expertMessage || '');

            // Reset existing files
            if (latestSubmission.files && latestSubmission.files.length > 0) {
                const existingFilesList = latestSubmission.files.map((file, index) => ({
                    id: `existing-${index}`,
                    name: file.fileName,
                    url: file.fileUrl,
                    existing: true
                }));
                setExistingFiles(existingFilesList);
            }
        }
    };

    const handleSaveSubmission = async (event) => {
        event.preventDefault();

        const totalFiles = uploadedFiles.length + existingFiles.length;
        if (totalFiles === 0) {
            alert("Please keep at least one file or upload a new one.");
            return;
        }

        const formData = new FormData();
        formData.append('note', workDescription);

        // Add new files
        uploadedFiles.forEach(fileObj => {
            formData.append('files', fileObj.file);
        });

        // Add existing files that should be kept (send their IDs or URLs)
        formData.append('existingFiles', JSON.stringify(existingFiles.map(file => ({
            fileName: file.name,
            fileUrl: file.url
        }))));

        try {
            setSubmitting(true);
            const token = localStorage.getItem('expertToken');
            await expertApi.put(
                `/expert/edit-submission/${assignmentId}`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

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

    // Determine submission state based on assignment status
    const getSubmissionState = () => {
        if (!assignment) return 'not-submitted';

        if (assignment.status === 'completed') return 'completed';
        if (assignment.status === 'to be reviewed') return 'submitted';
        return 'not-submitted';
    };

    const submissionState = getSubmissionState();
    const latestSubmission = assignment?.submission && assignment.submission.length > 0
        ? assignment.submission[assignment.submission.length - 1]
        : null;

    const renderSubmissionContent = () => {

        switch (submissionState) {
            case 'not-submitted':
                return (
                    <form onSubmit={handleSubmit} className='submission-form'>
                        {/* File Upload */}
                        <div className='workform-group'>
                            <label className='work-form-label'>Upload Files (Max 3 files)</label>
                            <div
                                className={`file-upload-area ${isDragOver ? 'drag-over' : ''}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => document.getElementById('file-input').click()}
                            >
                                <Upload className='upload-icon' />
                                <div className='upload-text'>
                                    Click to upload or drag and drop files here
                                </div>
                                <div className='upload-hint'>
                                    Maximum 3 files allowed
                                </div>
                                <input
                                    id='file-input'
                                    type='file'
                                    className='file-input'
                                    multiple
                                    onChange={handleFileUpload}
                                />
                            </div>

                            {/* Uploaded Files Preview */}
                            {uploadedFiles.length > 0 && (
                                <div className='uploaded-files'>
                                    <div className='files-header'>
                                        <span className='files-count'>{uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} selected</span>
                                    </div>
                                    {uploadedFiles.map(file => (
                                        <div key={file.id} className='uploaded-file'>
                                            <div className='file-info-submitted'>
                                                <div className='file-icon-wrapper'>
                                                    <File className='file-icon' />
                                                </div>
                                                <div className='file-details'>
                                                    <div className='file-name'>{file.name}</div>
                                                    <div className='file-size'>{formatFileSize(file.size)}</div>
                                                </div>
                                            </div>
                                            <button
                                                type='button'
                                                className='remove-file-btn'
                                                onClick={() => removeFile(file.id)}
                                                title="Remove file"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Note */}
                        <div className='workform-group'>
                            <label className='work-form-label'>Add a note for submission</label>
                            <textarea
                                className='workform-textarea'
                                value={workDescription}
                                onChange={(e) => setWorkDescription(e.target.value)}
                                placeholder='Add your submission notes here...'
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type='submit'
                            className='submit-button'
                            disabled={submitting || uploadedFiles.length === 0}
                        >
                            <Send className='submit-icon' />
                            {submitting ? 'Submitting...' : 'Submit Work'}
                        </button>
                    </form>
                );

            case 'submitted':
                return (
                    <div className='submitted-work'>
                        {/* Inline editing or display mode */}
                        <div className='submission-content'>
                            {/* Note section */}
                            <div className='submitted-note'>
                                <div className='note-header'>
                                    <h4>{isEditing ? 'Edit Submission Note' : 'Submission Note'}</h4>
                                </div>

                                {isEditing ? (
                                    <textarea
                                        className='workform-textarea editing'
                                        value={workDescription}
                                        onChange={(e) => setWorkDescription(e.target.value)}
                                        placeholder='Update your submission notes...'
                                    />
                                ) : (
                                    <div className='note-content'>
                                        {workDescription || 'No note provided'}
                                    </div>
                                )}
                            </div>

                            {/* Files section */}
                            <div className='submitted-file'>
                                <h4>{isEditing ? 'Manage Files' : 'Submitted Files'}</h4>

                                {/* Existing files */}
                                {existingFiles.length > 0 && (
                                    <div className='existing-files-section'>
                                        {!isEditing && <div className='files-label'>Current Files:</div>}
                                        {existingFiles.map((file) => (
                                            <div key={file.id} className={`file-section ${isEditing ? 'editing-mode' : ''}`}>
                                                <File className='file-icon-section' />
                                                <span className='file-name-dark'>{file.name}</span>
                                                <div className='file-actions'>
                                                    <button
                                                        className='download-btn'
                                                        onClick={() => handleSubmittedFileView(file.url)}
                                                    >
                                                        View
                                                    </button>
                                                    {isEditing && (
                                                        <button
                                                            type='button'
                                                            className='remove-file'
                                                            onClick={() => removeExistingFile(file.id)}
                                                            title="Remove file"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* New file upload when editing */}
                                {isEditing && (
                                    <div className='add-files-section'>
                                        <div className='files-label'>Add New Files:</div>
                                        <div
                                            className={`file-upload-area compact ${isDragOver ? 'drag-over' : ''}`}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                            onClick={() => document.getElementById('file-input-edit').click()}
                                        >
                                            <Upload className='upload-icon' size={24} />
                                            <div className='upload-text'>Click to add more files</div>
                                            <input
                                                id='file-input-edit'
                                                type='file'
                                                className='file-input'
                                                multiple
                                                onChange={handleFileUpload}
                                            />
                                        </div>

                                        {/* Preview of newly added files */}
                                        {uploadedFiles.length > 0 && (
                                            <div className='new-files-section'>
                                                <div className='files-label'>New Files to Add:</div>
                                                {uploadedFiles.map(file => (
                                                    <div key={file.id} className='file-section editing-mode'>
                                                        <File className='file-icon-section' />
                                                        <span className='file-name-dark'>{file.name}</span>
                                                        <div className='file-size'>{formatFileSize(file.size)}</div>
                                                        <button
                                                            type='button'
                                                            className='remove-file'
                                                            onClick={() => removeFile(file.id)}
                                                            title="Remove file"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {!isEditing && (
                                <div className='edit-submission'>'
                                    <button
                                        className='edit-submission-btn'
                                        onClick={handleEditSubmission}
                                    >
                                        <Edit className='edit-icon' />
                                        Edit
                                    </button>
                                </div>
                            )}

                            {/* Action buttons when editing */}
                            {isEditing && (
                                <div className='edit-actions'>
                                    <button
                                        type='button'
                                        className='cancel-edit-btn'
                                        onClick={handleCancelEdit}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type='button'
                                        className='edit-submit-button'
                                        onClick={handleSaveSubmission}
                                        disabled={submitting || (uploadedFiles.length + existingFiles.length) === 0}
                                    >
                                        <Send className='submit-icon' />
                                        {submitting ? 'Updating...' : 'Save Changes'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'completed':
                return (
                    <div className='submitted-work'>
                        {/* Display completed note */}
                        {latestSubmission?.expertMessage && (
                            <div className='submitted-note'>
                                <h4>Final Submission Note</h4>
                                <div className='note-content'>
                                    {latestSubmission.expertMessage}
                                </div>
                            </div>
                        )}

                        {/* Display completed files */}
                        {latestSubmission?.files && latestSubmission.files.length > 0 && (
                            <div className='submitted-file'>
                                <h4>Completed Work Files</h4>
                                {latestSubmission.files.map((file, index) => (
                                    <div key={index} className='file-section'>
                                        <File className='file-icon-section' />
                                        <span className='file-name-dark'>{file.fileName}</span>
                                        <button
                                            className='download-btn'
                                            onClick={() => handleSubmittedFileView(file.fileUrl)}
                                        >
                                            View
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Success message for completed work */}
                        <div className='success-message'>
                            <CheckCircle className='success-icon' />
                            Work completed successfully!
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    const getSubmissionHeaderTitle = () => {
        switch (submissionState) {
            case 'not-submitted':
                return 'Submit Your Work';
            case 'submitted':
                return isEditing ? 'Edit Submission' : 'Submitted Work';
            case 'completed':
                return 'Completed Work';
            default:
                return 'Submit Your Work';
        }
    };

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
                                    <div className="detail-header due-date">
                                        <div className='detail-header-right'>
                                            <Calendar className="detail-icon" />
                                            <h4>Due Date</h4>
                                        </div>
                                        <div className='detail-header-left'>
                                            <div className="time-remaining">
                                                <Clock className="clock-icon" />
                                                <span>{calculateTimeRemaining(assignment.dueDate)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="detail-content">
                                        <div className="due-date-text">
                                            {new Date(assignment.dueDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                {/* Amount */}
                                <div className='detail-card'>
                                    <div className='detail-header'>
                                        <Coins className='detail-icon' />
                                        <h4>Amount</h4>
                                    </div>
                                    <div className='detail-content'>
                                        {/* Add your amount logic here */}
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
                            {/* Chat box */}
                            {chatOpen && (
                                <ChatBox
                                    open={chatOpen}
                                    onClose={() => setChatOpen(false)}
                                    assignmentId={assignmentId}
                                    currentUser={{ _id: expertId, name: "Expert Name", role: "expert" }}
                                    socketUrl="http://localhost:4000"  // Explicitly pass the socket URL
                                    otherUser={assignment.studentId?.username}
                                />
                            )}

                            <div className='submission-header'>
                                <div className='submission-header-left'>
                                    <div className='submission-icon'><Send className='icon' /></div>
                                    <h3>{getSubmissionHeaderTitle()}</h3>
                                </div>
                                <div className='submission-header-right'>
                                    <button className='chat-btn' onClick={() => setChatOpen(true)}>
                                        <MessagesSquare className='chat-icon' />
                                    </button>
                                </div>
                            </div>

                            {/* Success message */}
                            {showSuccess && (
                                <div className='success-message'>
                                    <CheckCircle className='success-icon' />
                                    {submissionState === 'not-submitted' ?
                                        'Work submitted successfully!' :
                                        'Submission updated successfully!'}
                                </div>
                            )}

                            {/* Dynamic content based on submission state */}
                            {renderSubmissionContent()}
                        </div>

                    </div>
                )}
            </div>
        </div>
    )
}

export default YourWork