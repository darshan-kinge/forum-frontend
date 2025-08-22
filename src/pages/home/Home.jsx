import React, { useEffect, useState } from 'react'
import './Home.css'
import { Link } from 'react-router-dom'
import CommBtn from '../../components/btn/community-btn/CommBtn'
import config from '../../config/config.js'
import HelmetComponent from '../../components/helmet/HelmetComponent';
import Loader from '../../components/loader/Loader';
import Preloader from '../../components/preloader/Preloader';
import ReactPlayer from 'react-player';
import MarqueeSlider from '../../components/Youtube/MarqueeSlider.jsx'
import { galleryAPI } from '../../utils/api.js'

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([[], [], []]);
  const [progress, setProgress] = useState(0);
  const [images, setImages] = useState([]);
  const [memberCount, setMemberCount] = useState(0);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        const response = await galleryAPI.getAll();
        const data = response.data;
        if (data && data.length > 0) {
          // Transform image URLs to reduce quality
          const transformedImages = data.map(image => ({
            ...image,
            url: image.url.replace('/upload/', '/upload/q_auto/') // Append quality parameter to the URL
          }));

          setImages(transformedImages);
          const rowSize = Math.ceil(transformedImages.length / 3);
          setRows([
            transformedImages.slice(0, rowSize),
            transformedImages.slice(rowSize, rowSize * 2),
            transformedImages.slice(rowSize * 2)
          ]);
        }
      } catch (error) {
        console.error('Error fetching images:', error);
        // Don't set loading to false on error to show fallback content
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  if (loading) return <Preloader loading={loading} />;

  // Don't return null when no images - just render the page without the gallery section

  return (
    <>
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
          <ReactPlayer 
            url="/bg_video_compressed.mp4" 
            playing 
            loop 
            muted 
            width="80%" 
            height="auto" 
            controls={false}
            config={{
              file: {
                attributes: {
                  preload: 'auto'
                }
              }
            }}
          />
        </div>
      </section>

      <section className='about '>
        <div className='about-text '>
          <h3>about the</h3>
          <h1>MIT-WPU Science and Spirituality Forum</h1>
          <p>
          At <b>MIT-WPU Science and Spirituality Forum</b>, we bring together the knowledge of science and the wisdom of spirituality. Through engaging events and discussions, we create a unique space where researchers and spiritual seekers collaborate to explore life's deepest questions, fostering both intellectual and personal growth. MIT-WPU Science and Spirituality Forum creates magic when lab work meets inner wisdom. Our community explores life's biggest questions through both scientific discovery and spiritual understanding.
          </p>
        </div>
        <div className='about-image '>
          <img 
            src='https://res.cloudinary.com/dewadggph/image/upload/q_auto/v1736621771/gallery/zblzwqhvwlpgcobf8i6v.jpg'
            alt='Science and Spirituality Forum'   
          />
        </div>
      </section>

      {/* Vision and Mission */}
      <section className="vision-mission ">
        <div className="vision-mission-container">
          <div className="cards-container">
            <div className="vision-card ">
              <h3>Our Vision</h3>
              <p>
                Our vision reaches beyond textbooks and laboratories. We're building bridges between the questions science asks and the answers spirituality offers. Together, these powerful forces light the way toward personal growth and global harmony - the cornerstone of MIT World Peace University's mission for World Peace.
              </p>
            </div>

            <div className="mission-card ">
              <h3>Our Mission</h3>
              <p>
                At MIT-WPU Science and Spirituality Forum, we blend scientific discovery with timeless wisdom, creating spaces where breakthrough research meets profound insights. We help you balance professional excellence with inner peace, exploring life's deepest questions through rational thinking and spiritual understanding.            
              </p>
            </div>

            <div className="mission-card ">
              <h3>Our Objective</h3>
              <p>Our objective is to bridge the gap between science and spirituality, fostering global harmony and holistic development. We aim to inspire transformative learning, promote collaborative research, and empower individuals to balance intellectual curiosity with inner wisdom for a more peaceful and enlightened world.</p>
            </div>
          </div>
        </div>
      </section>

      {images.length > 0 && (
        <section className="gallery-preview ">
          
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
      )}

      {/* Leadership Messages */}
      <section className="about-us ">
        <div className="about-container">
          {/* Leadership Messages */}
          <div className="leadership-section">
            <h3>From Our Leaders</h3>
            <div className="leadership-messages">
              <div className="leader-card">
                <div className="leader-image-container">
                  <img
                    src='vishwanath-karad-sir.jpg'
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
                    src='rahul-karad-sir.jpg'
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

      <MarqueeSlider playlistId="PLMsru-lJybKRm_tOl9CN50hOMY1u0Wkev" />

    </>
  )
}

export default Home