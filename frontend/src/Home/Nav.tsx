import React from 'react'
import { Link } from 'react-router-dom'

const Nav: React.FC = () => {
  return (
    <nav className='flex flex-row w-full p-3 justify-around bg-[#003153] shadow-2xl'>
      <h1 className="text-2xl font-bold tracking-wide text-white">
        SkillSwap
      </h1>
      <a href='#header' className='py-2 px-4 rounded-lg bg-purple-800 hover:bg-purple-900 active:bg-purple-950 text-white transition duration-150'>To Top</a>
      <a href='#about' className='py-2 px-4 rounded-lg bg-purple-800 hover:bg-purple-900 active:bg-purple-950 text-white transition duration-150'>About us</a>
      <a href='#contact' className='py-2 px-4 rounded-lg bg-purple-800 hover:bg-purple-900 active:bg-purple-950 text-white transition duration-150'>Contact us</a>
      <div className='w-1/4 justify-end flex gap-8'>
        <Link to={'/login'} className='bg-[#1F2937] hover:bg-[#111827] active:bg-[#000000] text-white cursor-pointer py-2 px-4 rounded-lg transition duration-150'>Log in</Link>
        <Link to={'/register'} className='bg-gray-400 hover:bg-gray-200 active:bg-white text-black cursor-pointer py-2 px-4 rounded-lg transition duration-150'>Sign Up</Link>
      </div>
    </nav>
  )
}

export default Nav
