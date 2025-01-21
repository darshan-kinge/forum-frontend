import React, { useState, useEffect } from 'react'
import './Gallery.css'
import config from '../../config/config.js';
import HelmetComponent from '../../components/helmet/HelmetComponent.jsx';
import Loader from '../../components/loader/Loader.jsx';

const Gallery = () => {
  const [allImages, setAllImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
        try {
            const response = await fetch(`${config.serverUrl}/api/${config.apiVersion}/gallery/all`);
            const data = await response.json();
            
            // Transform image URLs to reduce quality
            const transformedImages = data.map(image => ({
              ...image,
              url: image.url.replace('/upload/', '/upload/q_auto/') // Append quality parameter to the URL
            }));

            setAllImages(transformedImages);
            
        } catch (error) {
            console.error('Error fetching images:', error);
        } finally {
            setLoading(false);
        }
    };
    
    fetchImages();
  }, []);

  if (loading) return <Loader />;

  const openLightbox = (image) => {
    setSelectedImage(image);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };


  return (
    <>
      <HelmetComponent 
        pageName="Gallery"
        description="Gallery of MIT-WPU Science and Spirituality Forum"
        keywords='MIT-WPU, Science and Spirituality Forum, SNSF, Science, Spirituality, Forum, MIT, WPU, Vishwanath Karad, Rahul Karad'
      />

      <div className="wrapper">
        <div className="gallery-title">
          <h1>Gallery</h1>
        </div>
        <div className="gallery">
          { allImages.length === 0 ? <div className="error-message">No Images Found</div> : allImages.map((image) => (
              <div key={image._id} className="gallery-item" onClick={() => openLightbox(image)}>
                  <img src={image.url} alt="Gallery" className="gallery-img" />
              </div>
          ))}
        </div>

        {selectedImage && (
          <div className="lightbox" onClick={closeLightbox}>
              <span className="close">&times;</span>
              <img src={selectedImage.url} alt="Selected" className="lightbox-img" />
          </div>
        )}
        
      </div>
    </>
  )
}

export default Gallery