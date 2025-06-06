import React from 'react'
import Nav from './Home/Nav'
import Main from './Home/Main'
import Footer from './Home/Footer'

const Home: React.FC = () => {
  return (
    <>
      <Nav />
      <div className='bg-gradient-to-b from-[#003153] to-purple-900 h-full'>
        <Main />
      </div>
      <Footer />
    </>
  )
}

export default Home
