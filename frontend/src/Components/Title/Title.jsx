import React from 'react'
import './Title.css'

const Title = ({ children, clase}) => {
  return (
    <div className={`title ${clase}`}>
      {children}
    </div>
  )
}

export default Title
