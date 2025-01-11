import React, { useEffect, useState } from 'react'
import './Home.css'
import { Link } from 'react-router-dom'
import CommBtn from '../../components/btn/community-btn/CommBtn'
import config from '../../config/config.js'
import HelmetComponent from '../../components/helmet/HelmetComponent';
import Loader from '../../components/loader/Loader.jsx'


const Home = () => {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([[], [], []]);
  const [progress, setProgress] = useState(0);
  const [images, setImages] = useState([]);

  useEffect(() => {
    // // Simulate loading time
    // const timer = setTimeout(() => {
    //   setLoading(false);
    // }, 2500); // Adjust time as needed

    // Handle scroll animations
    const handleScroll = () => {
      const elements = document.querySelectorAll('.fade-in');
      elements.forEach(element => {
        const position = element.getBoundingClientRect();
        if (position.top < window.innerHeight - 100) {
          element.classList.add('visible');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      // clearTimeout(timer);
      // clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const preloadImages = async (imageUrls) => {
      const loadImage = (url) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = url;
          img.onload = () => resolve(url);
          img.onerror = () => reject();
        });
      };

      try {
        await Promise.all(imageUrls.map(img => loadImage(img.url)));
      } catch (error) {
        console.error('Error preloading images:', error);
      }
    };

    const fetchImages = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${config.serverUrl}/api/${config.apiVersion}/gallery/all`);
            const data = await response.json();
            
            if (data && data.length > 0) {
                // Preload images before showing them
                await preloadImages(data);
                
                setImages(data);
                const rowSize = Math.ceil(data.length / 3);
                setRows([
                    data.slice(0, rowSize),
                    data.slice(rowSize, rowSize * 2),
                    data.slice(rowSize * 2)
                ]);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching images:', error);
        } finally {
            setLoading(false);
        }
    };
    
    fetchImages();
}, []);

  if (!images.length || rows.some(row => row.length === 0)) {
    return null;
  }

  if (loading) return <Loader />;

  return (
    <>
      {/* Preloader */}
      {/* <div className={`preloader ${!loading ? 'fade-out' : ''}`}>
        <div className="preloader-text">
          <h2>Welcome to,</h2>
          <h1>Science and Spirituality Forum</h1>
        </div>
      </div> */}

      <HelmetComponent
        pageName='Home'
        description='MIT-WPU Science and Spirituality Forum is a unique initiative that seeks to bridge the gap between scientific knowledge and spiritual wisdom.'
        keywords='MIT-WPU, Science and Spirituality Forum, SNSF, Science, Spirituality, Forum, MIT, WPU, Vishwanath Karad, Rahul Karad'
      />

      <section className="hero">

        <div className="title">

          <div className='hero-title desktop-only'>

            <div className='quote'>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M13 14.725c0-5.141 3.892-10.519 10-11.725l.984 2.126c-2.215.835-4.163 3.742-4.38 5.746 2.491.392 4.396 2.547 4.396 5.149 0 3.182-2.584 4.979-5.199 4.979-3.015 0-5.801-2.305-5.801-6.275zm-13 0c0-5.141 3.892-10.519 10-11.725l.984 2.126c-2.215.835-4.163 3.742-4.38 5.746 2.491.392 4.396 2.547 4.396 5.149 0 3.182-2.584 4.979-5.199 4.979-3.015 0-5.801-2.305-5.801-6.275z" /></svg>
            </div>

            <h2 id='hero-h2'>Embark On A Transformative Journey, The Science and Spirituality Forum</h2>

            <div className="quote">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M11 9.275c0 5.141-3.892 10.519-10 11.725l-.984-2.126c2.215-.835 4.163-3.742 4.38-5.746-2.491-.392-4.396-2.547-4.396-5.149 0-3.182 2.584-4.979 5.199-4.979 3.015 0 5.801 2.305 5.801 6.275zm13 0c0 5.141-3.892 10.519-10 11.725l-.984-2.126c2.215-.835 4.163-3.742 4.38-5.746-2.491-.392-4.396-2.547-4.396-5.149 0-3.182 2.584-4.979 5.199-4.979 3.015 0 5.801 2.305 5.801 6.275z" /></svg>
            </div>

          </div>

          <div className='hero-title-mobile mobile-only'>
            <p>Embark On A Transformative Journey, Our Science and Spirituality Forum</p>
            {/* <p>Bridging Knowledge & Wisdom</p> */}
          </div>

        </div>

        <CommBtn title={'Join Community'} to={'/join-us'} />

        <div className="hero-video">
          <video loop autoPlay muted>
            <source src="/bg_video_compressed.mp4" type="video/mp4" />
          </video>
        </div>
      </section>

      <section className='about fade-in'>
        <div className='about-text fade-in'>
          <h3>about the</h3>
          <h1>MIT-WPU Science and Spirituality Forum</h1>
          <p>
          At <b>MIT-WPU Science and Spirituality Forum</b>, we bring together the knowledge of science and the wisdom of spirituality. Through engaging events and discussions, we create a unique space where researchers and spiritual seekers collaborate to explore life's deepest questions, fostering both intellectual and personal growth. MIT-WPU Science and Spirituality Forum creates magic when lab work meets inner wisdom. Our community explores life's biggest questions through both scientific discovery and spiritual understanding.
          </p>
        </div>
        <div className='about-image fade-in'>
          <img src='https://res.cloudinary.com/dotbsdfdo/image/upload/v1727069930/gallery/ebifkj1nb54kl3cs7efe.jpg' alt='Science and Spirituality Forum' />
        </div>
      </section>

      {/* Vision and Mission */}
      <section className="vision-mission fade-in">
        <div className="vision-mission-container">
          <div className="cards-container">
            <div className="vision-card fade-in">
              <h3>Our Vision</h3>
              <p>
                Our vision reaches beyond textbooks and laboratories. We're building bridges between the questions science asks and the answers spirituality offers. Together, these powerful forces light the way toward personal growth and global harmony - the cornerstone of MIT World Peace University's mission for World Peace.
              </p>
            </div>

            <div className="mission-card fade-in">
              <h3>Our Mission</h3>
              <p>
                At MIT-WPU Science and Spirituality Forum, we blend scientific discovery with timeless wisdom, creating spaces where breakthrough research meets profound insights. We help you balance professional excellence with inner peace, exploring life's deepest questions through rational thinking and spiritual understanding.            
              </p>
            </div>

            <div className="mission-card fade-in">
              <h3>Our Objective</h3>
              <p>Our objective is to bridge the gap between science and spirituality, fostering global harmony and holistic development. We aim to inspire transformative learning, promote collaborative research, and empower individuals to balance intellectual curiosity with inner wisdom for a more peaceful and enlightened world.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="gallery-preview fade-in">
        
      <div className="marquee-container">
            {/* Row 1 - Left to Right */}
            <div className="marquee-track marquee-right">
                {rows[0].map((image) => (
                    <div key={image._id} className="marquee-item">
                        <img 
                            src={image.url} 
                            alt="Gallery" 
                            loading="lazy"
                            decoding="async"
                        />
                    </div>
                ))}
                {rows[0].map((image) => (
                    <div key={`duplicate-${image._id}`} className="marquee-item">
                        <img 
                            src={image.url} 
                            alt="Gallery"
                            loading="lazy"
                            decoding="async"
                        />
                    </div>
                ))}
            </div>

            {/* Row 2 - Right to Left */}
            <div className="marquee-track marquee-left">
                {rows[1].map((image) => (
                    <div key={image._id} className="marquee-item">
                        <img 
                            src={image.url} 
                            alt="Gallery"
                            loading="lazy"
                            decoding="async"
                        />
                    </div>
                ))}
                {rows[1].map((image) => (
                    <div key={`duplicate-${image._id}`} className="marquee-item">
                        <img 
                            src={image.url} 
                            alt="Gallery"
                            loading="lazy"
                            decoding="async"
                        />
                    </div>
                ))}
            </div>

            {/* Row 3 - Left to Right */}
            <div className="marquee-track marquee-right">
              {rows[2].map((image) => (
                <div key={image._id} className="marquee-item">
                  <img 
                    src={image.url} 
                    alt="Gallery"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              ))}

              {rows[2].map((image) => (
                <div key={`duplicate-${image._id}`} className="marquee-item">
                  <img 
                    src={image.url} 
                    alt="Gallery"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              ))}
            </div>
        </div>
      </section>

      {/* Leadership Messages */}
      <section className="about-us fade-in">
        <div className="about-container">
          {/* Leadership Messages */}
          <div className="leadership-section">
            <h3>From Our Leaders</h3>
            <div className="leadership-messages">
              <div className="leader-card">
                <div className="leader-image-container">
                  <img
                    src="https://mitwpu.edu.in/assets/frontend/images/vishwanath-karad.jpg"
                    alt="University Founder"
                    className="leader-image" />
                </div>
                <div className="leader-content">
                  <h4>Prof. Dr. Vishwanath D. Karad</h4>
                  <p className="leader-title">Founder, MIT-WPU</p>
                  <p className="leader-message">
                    "The pathway to higher education is a journey that takes learning beyond classrooms, beyond degrees."
                  </p>
                </div>
              </div>

              <div className="leader-card">
                <div className="leader-image-container">
                  <img
                    src="https://www.vanjariworld.com/wp-content/uploads/2018/04/Rahul-V-Karad.jpg"
                    alt="Executive President"
                    className="leader-image" />
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

      <section className="join-us fade-in">
        <div className="join-us-container">
          <h2>Join Us</h2>
          <h3>
            <b>Be a Part of Our Community</b>
          </h3>
          <p>
            Become a member and step into a unique journey of collaboration between science and spirituality. As a member, you'll receive a personalized badge and certificate, symbolizing your commitment to bridging knowledge and wisdom.
          </p>
          <h3>
            <b>Why Join Us?</b>
          </h3>
          <ul>
            <li>Contribute to thought-provoking discussions and events.</li>
            <li>Connect with like-minded individuals and thought leaders.</li>
            <li>Access exclusive resources, workshops, and insights.</li>
          </ul>
          <p>
            Together, let’s create a future where innovation and introspection go hand in hand.
          </p>
          <Link to="/join-us" className="join-us-btn fade-in">Join Us</Link>
        </div>
        <div className='join-us-image fade-in'>
          <img src="meditate.gif" alt="" />
        </div>
      </section>

    </>
  )
}

export default Home