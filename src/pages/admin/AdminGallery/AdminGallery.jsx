import { useState, useEffect, useRef } from 'react'
import { Navigate } from 'react-router-dom';
import './AdminGallery.css'
import { useAuth } from '../../../context/AuthContext'
import { canView } from '../../../utils/permissions';
import config from '../../../config/config.js';
import api from '../../../utils/api.js';

const AdminGallery = () => {
  const { AuthorizationToken, user, isLoading } = useAuth();
  const [allImages, setAllImages] = useState([]);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = useRef(null);
  const imagesPerPage = 4;

  // Check permissions
  if (!isLoading && !canView(user, 'gallery')) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>You don't have permission to access the Gallery page.</p>
        <Navigate to="/admin/dashboard" replace />
      </div>
    );
  }

  
  const fetchImages = async () => {
      try {
        const response = await api.get('/gallery/all');
        const data = response.data;
        console.log(data);
        
        setAllImages(data);
        
      } catch (error) {
        console.error('Error fetching images:', error);
      }
  };

  useEffect(() => {
    fetchImages();
}, []);


  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  }   

  const handleImageUpload = async() => {
    if (!image) {
      alert('Please select an image first');
      return;
    }

    const formData = new FormData();
    formData.append('image', image);

    try {
      setLoading(true);
      const response = await api.post('/gallery/upload', formData);

      if (response.status === 200 || response.status === 201) {
        alert('File uploaded successfully');
        setImage(null);
        fileInputRef.current.value = '';
        fetchImages();
      } else {
        throw new Error('Failed to upload file');
      }
      
      setLoading(false);
      
    } catch (error) {
      console.error(error);
      alert('Failed to upload file. Try again later');
      setLoading(false);
    }
  }

  const handleDelete = async (id) => {
    try {
        const response = await api.delete(`/gallery/delete/${id}`);

        if (response.status === 200) {
          alert('Image deleted successfully');
          setAllImages(allImages.filter(image => image.id !== id));
        } else {
          throw new Error('Failed to delete image');
        }
        
        fetchImages();
        
    } catch (error) {
        console.error('Error deleting image:', error);
        alert('Failed to delete image. Try again later');
    }
};

  // Calculate the images to display based on the current page
  const indexOfLastImage = currentPage * imagesPerPage;
  const indexOfFirstImage = indexOfLastImage - imagesPerPage;
  const currentImages = allImages.slice(indexOfFirstImage, indexOfLastImage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
        <div className="admin-gallery-wrapper">
          <div className='ag-title-block'>
            <h1 className='ag-title'>Gallery</h1>
          </div>
          <div className='upload-block'>
              <input 
                className='img-upload-input' 
                accept='image/*' 
                onChange={handleImageChange} 
                ref={fileInputRef}
                type='file'
              />

              <button 
                className='img-upload-btn' 
                onClick={handleImageUpload} 
                disabled={loading}
              >
                {
                  loading ? 'Uploading...' : 'Upload Image'
                }
              </button>
          </div>

          <table className="responsive-table">
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                  { (currentImages.length > 0) ? currentImages.map((image, i) => (
                        <tr key={i}>
                          <td>
                            <img src={image.url} alt="Gallery" className="gallery-image" />
                          </td>
                          <td>
                            <button className='gallery-delete-btn' onClick={() => handleDelete(image._id)}>Delete</button>
                          </td>
                        </tr>
                      )) : <tr>
                          <td colSpan='2'>No images found</td>
                        </tr>
                  }
                </tbody>
          </table>
          
          {/* Pagination Controls */}
          <div className="pagination">
              {Array.from({ length: Math.ceil(allImages.length / imagesPerPage) }, (_, i) => (
                  <button
                      key={i + 1}
                      onClick={() => paginate(i + 1)}
                      className={currentPage === i + 1 ? 'active' : ''}
                  >
                      {i + 1}
                  </button>
              ))}
          </div>
        </div>
    </>
  )
}

export default AdminGallery;