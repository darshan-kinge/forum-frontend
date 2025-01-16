import React, { useEffect, useState } from 'react';
import './Preloader.css';

const Preloader = ({ loading }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (!loading) {
      // Start fade out animation after a delay
      const delayTimer = setTimeout(() => {
        setFadeOut(true);
      }, 500); // Delay before starting fade out (adjust as needed)

      // Remove the preloader after the fade-out animation is complete
      const fadeOutTimer = setTimeout(() => {
        setFadeOut(false);
      }, 1100); // Match this duration with the CSS animation duration (600ms fade + 500ms delay)

      return () => {
        clearTimeout(delayTimer);
        clearTimeout(fadeOutTimer);
      };
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