import React from 'react'
import './Home.css'
import { Link } from 'react-router-dom'
import CommBtn from '../../components/btn/community-btn/CommBtn'


const Home = () => {
  return (
    <>
      <section className="hero">

        <div className="title">

          <div className='hero-title'>

            <div className='quote'>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M13 14.725c0-5.141 3.892-10.519 10-11.725l.984 2.126c-2.215.835-4.163 3.742-4.38 5.746 2.491.392 4.396 2.547 4.396 5.149 0 3.182-2.584 4.979-5.199 4.979-3.015 0-5.801-2.305-5.801-6.275zm-13 0c0-5.141 3.892-10.519 10-11.725l.984 2.126c-2.215.835-4.163 3.742-4.38 5.746 2.491.392 4.396 2.547 4.396 5.149 0 3.182-2.584 4.979-5.199 4.979-3.015 0-5.801-2.305-5.801-6.275z"/></svg>
            </div>

            <h2 id='hero-h2'>Embark On A Transformative Journey, Our Science and Spirituality Forum</h2>
            
            <div className="quote">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M11 9.275c0 5.141-3.892 10.519-10 11.725l-.984-2.126c2.215-.835 4.163-3.742 4.38-5.746-2.491-.392-4.396-2.547-4.396-5.149 0-3.182 2.584-4.979 5.199-4.979 3.015 0 5.801 2.305 5.801 6.275zm13 0c0 5.141-3.892 10.519-10 11.725l-.984-2.126c2.215-.835 4.163-3.742 4.38-5.746-2.491-.392-4.396-2.547-4.396-5.149 0-3.182 2.584-4.979 5.199-4.979 3.015 0 5.801 2.305 5.801 6.275z"/></svg>
            </div>

          </div>

        </div>

        <CommBtn to={'/join-us'} />

        <div className="hero-video">
          <video loop autoPlay muted>
            <source src="/bg_video_compressed.mp4" type="video/mp4" />
          </video>
        </div>
        {/* <div className="community-overview">
          <div className="community-overview-sec">
            <div className='statistics'>
              <h2>100+</h2>
              <p>Members</p>
            </div>
            <div className="vert-line"></div>
            <div className='statistics'>
              <h2>10+</h2>
              <p>Events & Workshops</p>
            </div>
            <div className="vert-line"></div>
            <div className='statistics'>
              <h2>800+</h2>
              <p>Members</p>
            </div>
          </div>
        </div> */}
      </section>
      <section className='sec-section'>

      </section>
    </>
  )
}

export default Home