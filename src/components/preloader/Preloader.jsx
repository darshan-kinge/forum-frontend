import React, { useEffect, useState } from 'react';
import './Preloader.css';

const Preloader = ({ loading }) => {
  // visible = preloader is in the DOM, fading = fade-out animation is playing
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  // Guarantee the preloader stays for at least 2.5s so the text animation finishes
  useEffect(() => {
    const minTimer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 2500);
    return () => clearTimeout(minTimer);
  }, []);

  useEffect(() => {
    if (!loading && minTimeElapsed) {
      // Start the fade-out only when both data is loaded AND minimum time has passed
      setFading(true);
      // Remove from DOM after animation finishes (600ms matches CSS transition)
      const timer = setTimeout(() => setVisible(false), 600);
      return () => clearTimeout(timer);
    }
  }, [loading, minTimeElapsed]);

  if (!visible) return null;

  return (
    <div 
      className={`preloader-overlay ${fading ? 'fade-out' : ''}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#02385D',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2147483647, // Maximum possible z-index to guarantee it covers Navbar and everything else
        transition: 'opacity 0.6s ease-in-out',
        opacity: fading ? 0 : 1,
        pointerEvents: fading ? 'none' : 'auto'
      }}
    >
      <div className="preloader-text">
        <h2>Welcome to,</h2>
        <h1>Science and Spirituality Forum</h1>
      </div>
    </div>
  );
};

export default Preloader;