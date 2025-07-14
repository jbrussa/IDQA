import React from 'react'
import './Container.css'

const Container = ( {children, className = ' '} ) => {
  return (
    <div className={`${className}`}>
      {children}
    </div>
  )
}

export default Container
