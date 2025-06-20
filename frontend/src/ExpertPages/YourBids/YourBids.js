import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import ExpertNavbar from '../../components/Expert/ExpertNavbar/ExpertNavbar'
import './YourBids.css'
import { User, Eye, Frown, Banknote, Calendar, Vote, X } from 'lucide-react'

const YourBids = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState(null);
  const [filteredBids, setFilteredBids] = useState([]);
  const [viewedBid, setViewedBid] = useState(null);
  const navigate = useNavigate();

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

      const response = await axios.get('http://localhost:4000/api/expert/bids', {
        headers: { Authorization: `Bearer ${token}` }
      });

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
                    <button className='view-button' onClick={() => handleViewBid(bid)}>
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
              <button className="close-btn" onClick={() => setViewedBid(null)}><X /></button>
              <h2>{viewedBid.assignmentTitle}</h2>
              <div className='student-info-bid'>
                <User className='bid-icons'></User>
                <span>{viewedBid.studentUsername}</span>
              </div>
              <div className='bid-detail-section'>
                <div className='bid-detail-header'></div>
              </div>
              <div className='assignment-detail-section'>
                <p><i className="bx bx-book"></i> Subject: {viewedBid.assignmentSubject || 'Not specified'}</p>
                <p><i className="bx bx-calendar"></i> Due: {formatDate(viewedBid.assignmentDueDate)}</p>
                <p><i className="bx bx-text"></i> Description: {viewedBid.assignmentDescription}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default YourBids