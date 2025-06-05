import React, { useEffect, useState } from 'react';
import { Calendar, Clock, FileText, User, Eye } from 'lucide-react';
import './AssignedAssignment.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AssignedAssignment = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const token = localStorage.getItem('expertToken');
        if (!token) {
          setError('No authentication token found');
          setLoading(false);
          return;
        }

        const res = await axios.get('/api/expert/assigned-assignments', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log('Fetched assignments:', res.data);
        setAssignments(res.data);
      } catch (error) {
        console.error('Error fetching assigned assignments:', error);
        setError('Failed to fetch assignments');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  const handleViewClick = (assignmentId) => {
    navigate(`/your-work/${assignmentId}`);
  };

  const calculateTimeRemaining = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return "Overdue";
    } else if (diffDays === 0) {
      return "Due today";
    } else if (diffDays === 1) {
      return "1 day left";
    } else {
      return `${diffDays} days left`;
    }
  };

  if (loading) {
    return (
      <div className='assigned-container'>
        <div className='assigned-header'>
          <h1>Assigned Assignments</h1>
        </div>
        <div className="loading-message">Loading assignments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='assigned-container'>
        <div className='assigned-header'>
          <h1>Assigned Assignments</h1>
        </div>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className='assigned-container'>
      <div className='assigned-header'>
        <h1>Assigned Assignments</h1>
      </div>
      {assignments.length === 0 ? (
        <div className="no-assignments">
          <p>No assignments assigned to you yet.</p>
        </div>
      ) : (
        assignments.map((assignment) => (
          <div key={assignment._id} className='assigned-assignment-card'>
            <div className="assignment-header">
              <div className="assignment-title-section">
                <div className="assignment-icon">
                  <FileText className="icon" />
                </div>
                <div className="title-info">
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
                  onClick={() => handleViewClick(assignment._id)}
                >
                  <Eye className="button-icon" />
                  <span>VIEW</span>
                </button>
                <span className={`status-badge status-${assignment.status?.toLowerCase() || 'pending'}`}>
                  {assignment.status || 'Pending'}
                </span>
              </div>
            </div>
            <div className='assign-details'>
              <div className="detail-item description-item">
                <div className="detail-content">
                  <FileText className="detail-icon" />
                  <div>
                    <h4>Description</h4>
                    <p>{assignment.description || 'No description provided'}</p>
                  </div>
                </div>
              </div>
              <div className="detail-item due-date-item">
                <div className="detail-content">
                  <Calendar className="detail-icon" />
                  <div>
                    <h4>Due Date</h4>
                    <p>{new Date(assignment.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="time-remaining">
                  <Clock className="clock-icon" />
                  <span>{calculateTimeRemaining(assignment.dueDate)}</span>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AssignedAssignment;