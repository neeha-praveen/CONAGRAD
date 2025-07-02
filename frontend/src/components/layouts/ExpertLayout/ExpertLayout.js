import React from 'react'
import ExpertNavbar from '../../Expert/ExpertNavbar/ExpertNavbar'
import { Outlet } from 'react-router-dom'

const ExpertLayout = () => {
  return (
    <>
        <ExpertNavbar/>
        <main>
            <Outlet/>
        </main>
    </>
  )
}

export default ExpertLayout