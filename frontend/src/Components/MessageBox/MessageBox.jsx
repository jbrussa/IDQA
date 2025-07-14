import React from 'react'
import './MessageBox.css'

const MessageBox = ( { children, className = ' '}) => {
  return (
    <div className={`message-box ${className}`}>
      {children}
    </div>
  )
}

export default MessageBox
