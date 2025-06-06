import React from 'react'
import { Link } from 'react-router-dom'

const NotFound: React.FC = () => {
  return (
    <div className='h-screen w-screen flex items-center justify-center'>
      <div className='h-1/2 w-1/2 flex items-center justify-center bg-purple-700 rounded-2xl shadow-2xl'>   
        <div className='bg-purple-600 shadow-2xl p-10 flex items-center justify-center flex-col gap-3 rounded-xl'>
          <p className='text-2xl text-red-300'>404: Page not Found</p>
          <Link to={'/'} className='text-amber-400 hover:text-amber-500 active:text-amber-600 cursor-pointer'>Go to home</Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound
