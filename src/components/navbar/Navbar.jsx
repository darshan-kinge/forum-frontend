import { useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { FaBars, FaTimes } from 'react-icons/fa'
import './Navbar.css'
import CommBtn from '../btn/community-btn/CommBtn'

const Navbar = () => {

  const navRef = useRef(null);

  const handleClick = () => {
    navRef.current.classList.toggle('nav-active')
  }

  const closeMenuOnClick = () => {
    navRef.current.classList.toggle('nav-active')
  }

  return (
    <>
      <header>
        <div className="nav-brand">
          <a href="/">
            <img src="/logo-white.png" alt="" />
          </a>
          <div className='vertical-line'></div>
          <a href="/">
            <img src="/mitwpu_white.png" alt="" />
          </a>
        </div>
        <nav ref={navRef}>
          <NavLink onClick={closeMenuOnClick} className='nav-links' to="/events">Events</NavLink>
          <NavLink onClick={closeMenuOnClick} className='nav-links' to="/gallery">Gallery</NavLink>
          <NavLink onClick={closeMenuOnClick} className='nav-links' to="/blogs">Blogs</NavLink>
          <NavLink onClick={closeMenuOnClick} className='nav-links' to="/team">Team</NavLink>
          <div className='vertical-line-links'></div>
          <div className="join-us-nav-btn">
            <CommBtn title={'Become a Member!'} to={'/join-us'} click={closeMenuOnClick} />
          </div>
          <button className='nav-btn nav-close-btn' onClick={handleClick}>
            <FaTimes />
          </button>
        </nav>
        <button className='nav-btn' onClick={handleClick}>
          <FaBars />
        </button>
      </header>
    </>
  )
}

export default Navbar