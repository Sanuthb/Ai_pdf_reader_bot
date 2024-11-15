import React from 'react'
import Sidebar from '../Components/Sidebar'
import Hero from '../Components/Hero'

const Dashboard = () => {
  return (
    <div className='flex'>
      <div>
        <Sidebar/>
      </div>
      <Hero/>
    </div>
  )
}

export default Dashboard
