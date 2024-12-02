import { useState, useEffect, useRef } from 'react'
import './AdminGallery.css'
import { useAuth } from '../../../context/AuthContext'

const AdminGallery = () => {

  const [allImages, setAllImages] = useState([]);

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = useRef(null);
  const imagesPerPage = 4;
  const { AuthorizationToken } = useAuth();

  
  const fetchImages = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/v1/gallery/all');
        const data = await response.json();
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
    const formData = new FormData();
    formData.append('image', image);

    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/v1/gallery/upload', {
        method: 'POST',
        headers: {
          Authorization: AuthorizationToken,
        },
        body: formData
      });

      if (response.ok) {
        console.log(response);
        
        alert('File uploaded successfully');
        setLoading(false);
        fileInputRef.current.value = ''; // Clear the file input
        fetchImages();
      } else {
        alert('Failed to upload file. Try again later');
        setLoading(false);

      }

    } catch (error) {
      console.error(error);
    }
  }

  const handleDelete = async (id) => {
    try {
        const response = await fetch(`http://localhost:3000/api/v1/gallery/delete/${id}`, {
            method: 'DELETE',
            headers: {
              Authorization: AuthorizationToken,
            },
        });

        if (response.ok) {
          alert('Image deleted successfully');
          setAllImages(allImages.filter(image => image.id !== id));
          fetchImages();
        } else {
          alert('Failed to delete image. Try again later');
        }
        // Remove the deleted image from the state
    } catch (error) {
        console.error('Error deleting image:', error);
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