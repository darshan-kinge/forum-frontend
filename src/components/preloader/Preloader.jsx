import React, { useEffect, useState } from 'react';
import './Preloader.css';

const Preloader = ({ loading }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (!loading) {
      // Start fade out animation after loading is set to false
      setFadeOut(true);
      // Remove the preloader after the fade-out animation is complete
      const timer = setTimeout(() => {
        setFadeOut(false);
      }, 500); // Match this duration with the CSS animation duration
      return () => clearTimeout(timer);
    }
  }, [loading]);

  return (
    <div className={`preloader ${fadeOut ? 'fade-out' : ''}`}>
      <div className="preloader-text">
        <h2>Welcome to,</h2>
        <h1>Science and Spirituality Forum</h1>
      </div>
    </div>
  );
};

export default Preloader; 