import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import expertApi from '../../config/expertApi'
import ExpertNavbar from '../../components/Expert/ExpertNavbar/ExpertNavbar'
import './YourBids.css'
import { User, Eye, Frown, Banknote, Calendar, Vote, X, PencilLine } from 'lucide-react'

const YourBids = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState(null);
  const [filteredBids, setFilteredBids] = useState([]);
  const [viewedBid, setViewedBid] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedBid, setEditedBid] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const navigate = useNavigate();
  const textareaRef = useRef();

  useEffect(() => {
    const token = localStorage.getItem('expertToken');
    if (!token) {
      navigate('/expert-login');
      return;
    }
    fetchBids();
  }, [navigate]);

  useEffect(() => {
    filterBids();
  }, [bids, statusFilter]);

  const fetchBids = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('expertToken');

      const response = await expertApi.get('/expert/bids', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(response.data);
      setBids(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching bids:', error);
      setError('Failed to fetch bids');
    } finally {
      setLoading(false);
    }
  };

  const filterBids = () => {
    if (statusFilter === 'all') {
      setFilteredBids(bids);
    } else {
      setFilteredBids(bids.filter(bid => bid.bidStatus === statusFilter));
    }
  };

  const handleViewBid = (bid) => {
    setViewedBid(bid);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleEditBid = () => {
    setIsEditing(true);
    setEditedBid({
      bidAmount: viewedBid.bidAmount,
      bidMessage: viewedBid.bidMessage || ''
    });
  };


  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedBid({
      bidAmount: viewedBid.bidAmount,
      bidMessage: viewedBid.bidMessage
    });
  };

  const handleSaveBid = async () => {
    try {
      setSaveLoading(true);
      const token = localStorage.getItem('expertToken');

      const amountToSave =
        editedBid.bidAmount === '' || isNaN(parseFloat(editedBid.bidAmount))
          ? viewedBid.bidAmount
          : parseFloat(editedBid.bidAmount);

      const messageToSave =
        editedBid.bidMessage === undefined ? viewedBid.bidMessage : editedBid.bidMessage;

      const response = await expertApi.put(
        `/expert/bids/${viewedBid.bidId}`,
        {
          bidAmount: amountToSave,
          bidMessage: messageToSave
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Update the local state
      const updatedBids = bids.map(bid =>
        bid.bidId === viewedBid.bidId
          ? { ...bid, bidAmount: editedBid.bidAmount, bidMessage: editedBid.bidMessage }
          : bid
      );
      setBids(updatedBids);

      // Update the viewed bid
      setViewedBid({
        ...viewedBid,
        bidAmount: editedBid.bidAmount,
        bidMessage: editedBid.bidMessage
      });

      setIsEditing(false);

      // Optional: Show success message
      console.log('Bid updated successfully');

    } catch (error) {
      console.error('Error updating bid:', error);
      // Optional: Show error message to user
      alert('Failed to update bid. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  useEffect(() => {
    if (textareaRef.current && !isEditing) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [viewedBid, isEditing]);

  const handleFileClick = (fileName) => {
    if (fileName) {
      // Construct the file URL - adjust this based on your backend file serving setup
      const fileUrl = `http://localhost:4000/uploads/${fileName}`;
      window.open(fileUrl, '_blank');
    }
  };

  const closeModal = () => {
    setViewedBid(null);
    setIsEditing(false);
    setEditedBid({});
  };


  if (loading) {
    return (
      <div className='yourbids-container'>
        <ExpertNavbar />
        <div className='yourbids-content'>
          <div className='yourbids-header-row'>
            <h2>Your Bids</h2>
            <div className='yourbids-filter'>
              <select className='status-filter'>
                <option>All Status</option>
                <option>pending</option>
                <option>accepted</option>
                <option>not accepted</option>
              </select>
            </div>
          </div>
          <div className='loading-spinner'>Loading your bids...</div>
        </div>
      </div>
    );
  }

  return (
    <div className='yourbids-container'>
      <ExpertNavbar />
      <div className='yourbids-content'>
        <div className='yourbids-header-row'>
          <h2>Your Bids</h2>
          <div className='yourbids-filter'>
            <select className='status-filter' value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option>all</option>
              <option>pending</option>
              <option>accepted</option>
              <option>not accepted</option>
            </select>
          </div>
        </div>

        <div className='yourbids-section'>
          {error ? (
            <div className="error-message">
              <span>{error}</span>
              <button onClick={fetchBids} className="retry-btn">
                Retry
              </button>
            </div>
          ) : filteredBids.length === 0 ? (
            <div className="no-bids">
              <Frown />
              <p>No bids found</p>
              {statusFilter !== 'all' && (
                <p>Try changing the filter to see more bids</p>
              )}
            </div>
          ) : (
            <div className='bid-rows'>
              {filteredBids.map((bid) => (
                <div key={bid.bidId} className='bid-row'>
                  <div className='bid-row-title-section'>
                    <div className='bid-icon'>
                      < Vote className='icon' />
                    </div>
                    <div className='bid-title-info'>
                      <h3>{bid.assignmentTitle}</h3>
                      <div className='meta-info-bid'>
                        <div className='student-info-bid'>
                          <User className='bid-icons'></User>
                          <span>{bid.studentUsername}</span>
                        </div>
                        <div className='bid-amount'>
                          <Banknote className='bid-icons' />
                          <span>{formatCurrency(bid.bidAmount)}</span>
                        </div>
                        <div className='bid-date'>
                          <Calendar className='bid-icons' size={16} />
                          <span>{formatDate(bid.bidTimestamp)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='bid-row-action'>
                    <button className='bid-view-button' onClick={() => handleViewBid(bid)}>
                      <Eye className='view-icon'></Eye>
                      <span>VIEW</span>
                    </button>
                    <span className={`bid-status bid-status-${bid.bidStatus.replace(' ', '-')}`}>
                      {bid.bidStatus.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {viewedBid && (
          <div className='bid-modal'>
            <div className='bid-modal-content'>
              <div className='bid-modal-header'>
                <h2>{viewedBid.assignmentTitle}</h2>
                <span className={`bid-status bid-status-${viewedBid.bidStatus.replace(' ', '-')}`}>
                  {viewedBid.bidStatus.toUpperCase()}
                </span>
                <button className="close-btn" onClick={closeModal}><X /></button>
              </div>
              <div className='bid-detail-section'>
                <div className='bid-detail-header'>
                  <div className='bid-title'>
                    <h3>Bid Details</h3>
                  </div>
                  {!isEditing && viewedBid.bidStatus === 'pending' ? (
                    <button className='bid-edit-btn' onClick={handleEditBid}>
                      <PencilLine className='bid-edit' />
                    </button>
                  ) : isEditing ? (
                    <button className='bid-edit-save' onClick={handleSaveBid} disabled={saveLoading}>SAVE</button>
                  ) : null}

                </div>
                <div className='bid-detail-content'>
                  <div className='bid-amount'>
                    <label className='form-label-bid'><strong>Amount :</strong></label>
                    <div className='form-bid-content amnt'>
                      <input
                        type="number"
                        className='bid-input-field'
                        value={isEditing ? editedBid.bidAmount : viewedBid.bidAmount}
                        onChange={(e) => {
                          if (isEditing) {
                            setEditedBid({
                              ...editedBid,
                              bidAmount: e.target.value
                            });
                          }
                        }}
                        readOnly={!isEditing}
                      />
                    </div>
                  </div>
                  <div className='bid-msg'>
                    <label className='form-label-bid'><strong>Message :</strong></label>
                    <div className='form-bid-content msg'>
                      <textarea
                        ref={textareaRef}
                        className='bid-textarea-field auto-resize'
                        value={isEditing ? editedBid.bidMessage : viewedBid.bidMessage}
                        onChange={(e) => {
                          if (isEditing) {
                            e.target.style.height = 'auto';
                            e.target.style.height = `${e.target.scrollHeight}px`;
                            setEditedBid((prev) => ({
                              ...prev,
                              bidMessage: e.target.value
                            }));
                          }
                        }}
                        readOnly={!isEditing}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className='assignment-detail-section'>
                <div className='assignment-detail-header'>
                  <h3>Assignment Details</h3>
                </div>
                <div className='assignment-detail-content'>
                  <div className='assignment-field'>
                    <i className="bx bx-book" />
                    <strong>Subject:</strong>
                    <span>{viewedBid.assignmentSubject || 'Not specified'}</span>
                  </div>
                  <div className='assignment-field'>
                    <i className="bx bx-calendar" />
                    <strong>Due:</strong>
                    <span>{formatDate(viewedBid.assignmentDueDate)}</span>
                  </div>
                  <div className='assignment-field'>
                    <i className="bx bx-user" />
                    <strong>Student:</strong>
                    <span>{viewedBid.studentUsername}</span>
                  </div>
                  <div className='assignment-field' style={{ gridColumn: '1 / -1' }}>
                    <i className="bx bx-text" />
                    <strong>Description:</strong>
                    <span>{viewedBid.assignmentDescription}</span>
                  </div>
                  <div className='assignment-field assignment-file-link'>
                    <i className="bx bx-file" />
                    <strong>File:</strong>
                    <a
                      href={`http://localhost:4000/uploads/${viewedBid.fileName}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {viewedBid.fileName}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default YourBids 