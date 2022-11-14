import React from 'react'

type Props = {
  children: React.ReactNode
}

const Layout = ({children}: Props)  => {
  return (
    <div className='flex h-screen bg-blue-400'>
      <div className="m-auto bg-white rounded-md w-3/5 h-3/4 grid">
        <div className='flex flex-col justify-evenly' >
          <div className='text-center py-10' >
        {children}
          </div>
        </div>
      </div>
    </div>
  )
  
    
  
}

export default Layout