import React from 'react'
import Sidebar from '../Components/Sidebar'
import Chat_comp from '../Components/Chat_comp'

const PdfChat = () => {
  return (
    <div className='flex'>
        <Sidebar/>
        <Chat_comp/>
    </div>
  )
}

export default PdfChat
