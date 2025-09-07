import React from 'react'
import './YourWorkDashboard.css'
import ExpertNavbar from "../../components/Expert/ExpertNavbar/ExpertNavbar.js";
import AssignedAssignment from "../../components/Expert/AssignedAssignment/AssignedAssignment.js";

const YourWorkDashboard = () => {
  return (
    <div className='your-work-dashboard-container'>
        <AssignedAssignment/>
    </div>
  )
}

export default YourWorkDashboard