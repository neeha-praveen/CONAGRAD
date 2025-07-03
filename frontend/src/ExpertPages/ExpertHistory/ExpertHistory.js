import React, { useEffect, useState } from 'react';
import './ExpertHistory.css'
import axios from 'axios';
import { Book, FileText, User, Calendar, DollarSign, Star, Eye, ChevronDown, ChevronUp, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const ExpertHistory = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [sortOrder, setSortOrder] = useState('latest');
    const [expandedGroups, setExpandedGroups] = useState({
        completed: true,
        pending: true,
        'under-review': true,
        rejected: true
    });

    useEffect(() => {
        const fetchAllAssignments = async () => {
            try {
                const token = localStorage.getItem('expertToken');
                if (!token) {
                    setError('No authentication token found');
                    setLoading(false);
                    return;
                }

                // Change the API endpoint to fetch all assignments instead of just completed ones
                const response = await axios.get('/api/expert/assigned-assignments', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setAssignments(response.data);
                console.log("Assignments fetched:", response.data);
            }
            catch (error) {
                console.error('Error fetching assignments:', error);
                setError('Failed to fetch assignments');
            }
            finally {
                setLoading(false);
            }
        }
        fetchAllAssignments();
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

    const groupAssignmentsByStatus = (assignments) => {
        return assignments.reduce((groups, assignment) => {
            const rawStatus = assignment.status || 'pending';
            const normalizedStatus = rawStatus.toLowerCase().replace(/ /g, '-').replace(/_/g, '-');
            if (!groups[normalizedStatus]) {
                groups[normalizedStatus] = [];
            }
            groups[normalizedStatus].push(assignment);
            return groups;
        }, {});
    };

    const sortAssignments = (assignments) => {
        return [...assignments].sort((a, b) => {
            const dateA = new Date(a.completedDate || a.updatedAt || a.createdAt);
            const dateB = new Date(b.completedDate || b.updatedAt || b.createdAt);

            if (sortOrder === 'latest') {
                return dateB - dateA;
            } else {
                return dateA - dateB;
            }
        });
    };

    const getStatusConfig = (status) => {
        const configs = {
            'completed': {
                icon: CheckCircle,
                color: '#22c55e',
                bgColor: '#dcfce7',
                title: '✅ Completed Assignments'
            },
            'in-progress': {
                icon: Clock,
                color: '#f59e0b',
                bgColor: '#fef3c7',
                title: '🟡 In Progress Assignments'
            },
            'to-be-reviewed': {
                icon: AlertCircle,
                color: '#3b82f6',
                bgColor: '#dbeafe',
                title: '🕓 To Be Reviewed'
            },
            'rejected': {
                icon: XCircle,
                color: '#ef4444',
                bgColor: '#fee2e2',
                title: '❌ Rejected Assignments'
            }
        };
        return configs[status] || configs.pending;
    };

    const toggleGroup = (status) => {
        setExpandedGroups(prev => ({
            ...prev,
            [status]: !prev[status]
        }));
    };

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
        const fetchAllAssignments = async () => {
            try {
                const token = localStorage.getItem('expertToken');
                const response = await axios.get('/api/expert/assignments', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setAssignments(response.data);
            }
            catch (error) {
                console.error('Error fetching assignments:', error);
                setError('Failed to fetch assignments');
            }
            finally {
                setLoading(false);
            }
        }
        fetchAllAssignments();
    };

    const handleViewAssignment = (assignmentId) => {
        // Add your navigation logic here
        console.log('View assignment:', assignmentId);
        // For example: navigate(`/expert/assignment/${assignmentId}`);
    };

    const groupedAssignments = groupAssignmentsByStatus(assignments);
    console.log("Grouped:", Object.keys(groupedAssignments));
    const statusOrder = ['completed', 'to-be-reviewed','in-progress', 'rejected'];

    return (
        <div className='expert-history'>
            <div className='expert-history-content'>
                <div className='expert-history-header'>
                    <h1>Assignment History</h1>
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
                ) : assignments.length === 0 ? (
                    <div className='error-message'>
                        No assignments found
                    </div>
                ) : (
                    <div className="status-groups-container">
                        {statusOrder.map((status) => {
                            const statusAssignments = groupedAssignments[status];
                            if (!statusAssignments || statusAssignments.length === 0) return null;

                            const config = getStatusConfig(status);
                            const IconComponent = config.icon;
                            const isExpanded = expandedGroups[status];
                            const sortedStatusAssignments = sortAssignments(statusAssignments);

                            return (
                                <div key={status} className="status-group">
                                    <div
                                        className="status-group-header"
                                        onClick={() => toggleGroup(status)}
                                        style={{ backgroundColor: config.bgColor }}
                                    >
                                        <div className="status-group-title">
                                            <IconComponent
                                                className="status-icon"
                                                style={{ color: config.color }}
                                                size={20}
                                            />
                                            <h2>{config.title}</h2>
                                            <span className="assignment-count">({statusAssignments.length})</span>
                                        </div>
                                        <div className="expand-icon">
                                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="expert-history-grid">
                                            {sortedStatusAssignments.map((assignment) => (
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
                                                                onClick={() => handleViewAssignment(assignment._id)}
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
                                                                    <h4>
                                                                        {status === 'completed' ? 'Completed on: ' :
                                                                            status === 'pending' ? 'Created on: ' :
                                                                                'Updated on: '}
                                                                    </h4>
                                                                    <p>{formatDate(assignment.completedDate || assignment.updatedAt || assignment.createdAt)}</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="history-detail-item">
                                                            <div className="detail-content">
                                                                <DollarSign className="detail-icon" />
                                                                <div className="field-label-value">
                                                                    <h4>Amount: </h4>
                                                                    <p>₹{assignment.amountPaid || assignment.amount || 'N/A'}</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {status === 'completed' && assignment.rating && (
                                                            <div className="history-detail-item">
                                                                <div className="detail-content">
                                                                    <Star className="detail-icon" />
                                                                    <div className="field-label-value">
                                                                        <h4>Rating: </h4>
                                                                        <div className="rating-stars">{renderStars(assignment.rating)}</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ExpertHistory