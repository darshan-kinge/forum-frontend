import {useState, useEffect} from 'react'
import './Gallery.css'
import config from '../../config/config.js';
const Gallery = () => {
  const [allImages, setAllImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
        try {
            const response = await fetch(`${config.serverUrl}/api/v1/gallery/all`);
            const data = await response.json();
            setAllImages(data);
            
        } catch (error) {
            console.error('Error fetching images:', error);
        }
    };
    
    fetchImages();
  }, []);


  
  const openLightbox = (image) => {
    setSelectedImage(image);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };


  return (
    <>
      <div className="wrapper">
        <div className="gallery-title">
          <h1>Gallery</h1>
        </div>
        <div className="gallery">
          {allImages.map((image) => (
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