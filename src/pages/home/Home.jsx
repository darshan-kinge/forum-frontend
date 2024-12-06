import React from 'react'
import './Home.css'
import { Link } from 'react-router-dom'
import CommBtn from '../../components/btn/community-btn/CommBtn'
import ImageMarquee from '../../components/ImageMarquee/ImageMarquee';


const Home = () => {
  return (
    <>
      <section className="hero">

        <div className="title">

          <div className='hero-title desktop-only'>

            <div className='quote'>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M13 14.725c0-5.141 3.892-10.519 10-11.725l.984 2.126c-2.215.835-4.163 3.742-4.38 5.746 2.491.392 4.396 2.547 4.396 5.149 0 3.182-2.584 4.979-5.199 4.979-3.015 0-5.801-2.305-5.801-6.275zm-13 0c0-5.141 3.892-10.519 10-11.725l.984 2.126c-2.215.835-4.163 3.742-4.38 5.746 2.491.392 4.396 2.547 4.396 5.149 0 3.182-2.584 4.979-5.199 4.979-3.015 0-5.801-2.305-5.801-6.275z"/></svg>
            </div>

            <h2 id='hero-h2'>Embark On A Transformative Journey, Our Science and Spirituality Forum</h2>
            
            <div className="quote">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M11 9.275c0 5.141-3.892 10.519-10 11.725l-.984-2.126c2.215-.835 4.163-3.742 4.38-5.746-2.491-.392-4.396-2.547-4.396-5.149 0-3.182 2.584-4.979 5.199-4.979 3.015 0 5.801 2.305 5.801 6.275zm13 0c0 5.141-3.892 10.519-10 11.725l-.984-2.126c2.215-.835 4.163-3.742 4.38-5.746-2.491-.392-4.396-2.547-4.396-5.149 0-3.182 2.584-4.979 5.199-4.979 3.015 0 5.801 2.305 5.801 6.275z"/></svg>
            </div>

          </div>

          <div className='hero-title-mobile mobile-only'>
          <p>Embark On A Transformative Journey, Our Science and Spirituality Forum</p>
          {/* <p>Bridging Knowledge & Wisdom</p> */}
          </div>

        </div>

        <CommBtn to={'/join-us'} />

        <div className="hero-video">
          <video loop autoPlay muted>
            <source src="/bg_video_compressed.mp4" type="video/mp4" />
          </video>
        </div>
      </section>

      {/* Vision and Mission */}
      <section className="vision-mission">
        <div className="vision-mission-container">
          <div className="cards-container">
            <div className="vision-card">
              <h3>Our Vision</h3>
              <p>To create a global platform where science and spirituality converge, fostering understanding and growth in both domains.</p>
            </div>

            <div className="mission-card">
              <h3>Our Mission</h3>
              <p>To facilitate meaningful dialogue, research, and understanding between scientific and spiritual perspectives, creating a harmonious approach to human advancement.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="gallery-preview">
        <ImageMarquee />
      </section>

      {/* Leadership Messages */}
      <section className="about-us">
        <div className="about-container">
        {/* Leadership Messages */}
         <div className="leadership-section">
          {/* <h3>From Our Leaders</h3> */}
          <div className="leadership-messages">
            <div className="leader-card"> 
              <div className="leader-image-container">
                <img 
                  src="https://mitwpu.edu.in/assets/frontend/images/vishwanath-karad.jpg" 
                  alt="University Founder" 
                  className="leader-image" 
                />
              </div>
              <div className="leader-content">
                <h4>Prof. Dr. Vishwanath D. Karad</h4>
                <p className="leader-title">Founder, MIT-WPU</p>
                <p className="leader-message">
                  "The integration of science and spirituality is not just an academic pursuit, but a pathway to holistic human development."
                </p>
              </div>
            </div>
    
            <div className="leader-card">
              <div className="leader-image-container">
                <img 
                  src="https://www.vanjariworld.com/wp-content/uploads/2018/04/Rahul-V-Karad.jpg" 
                  alt="Executive President" 
                  className="leader-image" 
                />
              </div>
              <div className="leader-content">
                <h4>Rahul V. Karad</h4>
                <p className="leader-title">Executive President, MIT-WPU</p>
                <p className="leader-message">
                  "SNSF represents our commitment to nurturing well-rounded individuals who understand both scientific progress and spiritual wisdom."
                </p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

    </>
  )
}

export default Home