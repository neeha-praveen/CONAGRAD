import React, { useEffect, useState } from 'react';
import './ExpertHistory.css'
import axios from 'axios';
import { Book, FileText, User, Calendar, DollarSign, Star, Eye } from 'lucide-react';

const ExpertHistory = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [sortOrder, setSortOrder] = useState('latest');

    useEffect(() => {
        const fetchCompletedAssignments = async () => {
            try {
                const token = localStorage.getItem('expertToken');
                if (!token) {
                    setError('No authentication token found');
                    setLoading(false);
                    return;
                }

                const response = await axios.get('/api/expert/completed-assignments', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setAssignments(response.data);
            }
            catch (error) {
                console.error('Error fetching completed assignments:', error);
                setError('Failed to fetch assignments');
            }
            finally {
                setLoading(false);
            }
        }
        fetchCompletedAssignments();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const sortedAssignments = [...assignments].sort((a, b) => {
        const dateA = new Date(a.completedDate || a.createdAt);
        const dateB = new Date(b.completedDate || b.createdAt);

        if (sortOrder === 'latest') {
            return dateB - dateA;
        } else {
            return dateA - dateB;
        }
    });

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, index) => (
            <Star
                key={index}
                className={`star-icon ${index < rating ? 'filled' : ''}`}
                size={14}
            />
        ));
    };

    const handleRetry = () => {
        setError(null);
        setLoading(true);
        // Re-fetch assignments
        const fetchCompletedAssignments = async () => {
            try {
                const token = localStorage.getItem('expertToken');
                const response = await axios.get('/api/expert/completed-assignments', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setAssignments(response.data);
            }
            catch (error) {
                console.error('Error fetching completed assignments:', error);
                setError('Failed to fetch assignments');
            }
            finally {
                setLoading(false);
            }
        }
        fetchCompletedAssignments();
    };

    const handleViewAssignment = (assignmentId) => {
        // Add your navigation logic here
        console.log('View assignment:', assignmentId);
        // For example: navigate(`/expert/assignment/${assignmentId}`);
    };

    return (
        <div className='expert-history'>
            <div className='expert-history-content'>
                <div className='expert-history-header'>
                    <h1>History</h1>
                    <select
                        className='expert-history-sort'
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                    >
                        <option value="latest">Latest</option>
                        <option value="oldest">Oldest</option>
                    </select>
                </div>

                {loading ? (
                    <div className='loading-spinner'>
                        <div className="spinner"></div>
                    </div>
                ) : error ? (
                    <div className='error-message'>
                        {error}
                        <button className='retry-btn' onClick={handleRetry}>
                            Retry
                        </button>
                    </div>
                ) : sortedAssignments.length === 0 ? (
                    <div className='error-message'>
                        No completed assignments found
                    </div>
                ) : (
                    <div className="expert-history-grid">
                        {sortedAssignments.map((assignment) => (
                            <div key={assignment._id} className='expert-history-card'>
                                <div className='expert-history-header-section'>
                                    <div className='expert-history-header-title'>
                                        <div className='assignment-icon'>
                                            <FileText className='icon' />
                                        </div>
                                        <div className='title-info'>
                                            <h3>{assignment.title}</h3>
                                            <div className="student-info">
                                                <User className="user-icon" />
                                                <span>{assignment.studentId?.username || 'Unknown Student'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="header-actions">
                                        <button
                                            className='view-button'
                                        >
                                            <Eye className="button-icon" />
                                            <span>VIEW</span>
                                        </button>
                                    </div>

                                </div>

                                <div className='history-details'>
                                    <div className="history-detail-item">
                                        <div className="detail-content">
                                            <Book className="detail-icon" />
                                            <div className="field-label-value">
                                                <h4>Subject: </h4>
                                                <p>{assignment.subject || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="history-detail-item">
                                        <div className="detail-content">
                                            <Calendar className="detail-icon" />
                                            <div className="field-label-value">
                                                <h4>Completed on: </h4>
                                                <p>{formatDate(assignment.completedDate)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="history-detail-item">
                                        <div className="detail-content">
                                            <Calendar className="detail-icon" />
                                            <div className="field-label-value">
                                                <h4>Amount: </h4>
                                                <p>₹{assignment.amountPaid || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="history-detail-item">
                                        <div className="detail-content">
                                            <Star className="detail-icon" />
                                            <div className="field-label-value">
                                                <h4>Rating: </h4>
                                                <div className="rating-stars">{renderStars(assignment.rating || 0)}</div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div >
    );
}

export default ExpertHistory