import React from 'react'
import ExpertNavbar from '../../components/Expert/ExpertNavbar/ExpertNavbar'
import './YourBids.css'
import { User, Eye } from 'lucide-react'

const YourBids = () => {
  // Sample bid data - replace with your actual data
  const bids = [
    {
      id: 1,
      assignmentName: "React Component Development",
      studentUsername: "john_doe_2024",
      status: "pending"
    },
    {
      id: 2,
      assignmentName: "Database Design Project",
      studentUsername: "sarah_smith",
      status: "accepted"
    },
    {
      id: 3,
      assignmentName: "Machine Learning Algorithm",
      studentUsername: "mike_johnson",
      status: "pending"
    },
    {
      id: 4,
      assignmentName: "Web API Integration",
      studentUsername: "emma_wilson",
      status: "not accepted"
    }
  ];

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
        <div className='yourbids-section'>
          <div className='bid-rows'>
            {bids.map((bid) => (
              <div key={bid.id} className='bid-row'>
                <div className='bid-row-title-section'>
                  <div className='bid-title-info'>
                    <h3>{bid.assignmentName}</h3>
                    <div className='student-info-bid'>
                      <User className='user-icon'></User>
                      <span>{bid.studentUsername}</span>
                    </div>
                  </div>
                </div>
                <div className='bid-row-action'>
                  <button className='view-button'>
                    <Eye className='view-icon'></Eye>
                    <span>View</span>
                  </button>
                  <span className={`bid-status-${bid.status.replace(' ', '-')}`}>
                    {bid.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default YourBids