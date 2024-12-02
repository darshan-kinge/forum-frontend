import {useState, useEffect} from 'react'
import './Gallery.css'

const Gallery = () => {
  const [allImages, setAllImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/v1/gallery/all');
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