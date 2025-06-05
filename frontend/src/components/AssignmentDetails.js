import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaDownload, FaArrowLeft, FaUser, FaFile, FaClock } from 'react-icons/fa';
import { axiosInstance } from '../config/api';
import './AssignmentDetails.css';

const AssignmentDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [assignment, setAssignment] = useState(null);
    const [expertDetails, setExpertDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [downloading, setDownloading] = useState(false);

    const fetchAssignmentDetails = useCallback(async () => {
        try {
            const [assignmentRes, expertRes] = await Promise.all([
                axiosInstance.get(`/student/assignments/${id}`),
                axiosInstance.get(`/student/assignments/${id}/expert-document`)
            ]);

            setAssignment(assignmentRes.data);
            setExpertDetails(expertRes.data);
        } catch (error) {
            setError('Failed to fetch assignment details');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchAssignmentDetails();
    }, [fetchAssignmentDetails]);

    const handleDownloadExpertDocument = async () => {
        try {
            setDownloading(true);
            const response = await axiosInstance.get(
                `/student/assignments/${id}/download-expert-document`,
                { responseType: 'blob' }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', expertDetails.document.fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            setError('Failed to download expert document');
            console.error('Error:', error);
        } finally {
            setDownloading(false);
        }
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!assignment || !expertDetails) return <div className="error">Assignment not found</div>;

    return (
        <div className="assignment-details">
            <div className="header">
                <button className="back-button" onClick={() => navigate(-1)}>
                    <FaArrowLeft /> Back
                </button>
                <h1>{assignment.title}</h1>
            </div>

            <div className="content">
                <div className="assignment-info">
                    <h2>Assignment Details</h2>
                    <p>{assignment.description}</p>
                    <p><strong>Status:</strong> {assignment.status}</p>
                    <p><strong>Due Date:</strong> {new Date(assignment.dueDate).toLocaleDateString()}</p>
                </div>

                {assignment.status === 'completed' && expertDetails && (
                    <div className="expert-info">
                        <h2>Expert Information</h2>
                        <div className="expert-profile">
                            <FaUser className="expert-icon" />
                            <div>
                                <p><strong>Name:</strong> {expertDetails.expertDetails.name}</p>
                                <p><strong>Email:</strong> {expertDetails.expertDetails.email}</p>
                                <p><strong>Expertise:</strong> {expertDetails.expertDetails.expertise}</p>
                            </div>
                        </div>

                        <div className="expert-message">
                            <h3>Expert's Message</h3>
                            <p>{expertDetails.message}</p>
                        </div>

                        {expertDetails.document && (
                            <div className="expert-document">
                                <h3>Expert's Document</h3>
                                <div className="document-info">
                                    <FaFile className="file-icon" />
                                    <div>
                                        <p>{expertDetails.document.fileName}</p>
                                        <p>{Math.round(expertDetails.document.fileSize / 1024)} KB</p>
                                    </div>
                                    <button
                                        className={`download-button ${downloading ? 'downloading' : ''}`}
                                        onClick={handleDownloadExpertDocument}
                                        disabled={downloading}
                                    >
                                        <FaDownload />
                                        {downloading ? 'Downloading...' : 'Download'}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="completion-info">
                            <FaClock className="clock-icon" />
                            <p>
                                <strong>Completed on:</strong>{' '}
                                {new Date(expertDetails.completionDate).toLocaleString()}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssignmentDetails;