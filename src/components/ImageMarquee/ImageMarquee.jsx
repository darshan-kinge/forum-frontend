import { useState, useEffect } from 'react';
import './ImageMarquee.css';
import config from '../../config/config.js';
import { galleryAPI } from '../../utils/api.js';

const ImageMarquee = () => {
    const [images, setImages] = useState([]);
    const [rows, setRows] = useState([[], [], []]);
    const [isLoading, setIsLoading] = useState(true);

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
                setIsLoading(true);
                const response = await galleryAPI.getAll();
                const data = response.data;
                
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
            } catch (error) {
                console.error('Error fetching images:', error);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchImages();
    }, []);

    if (isLoading) {
        return (
            <div className="marquee-container loading">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    // Don't return null when no images - just return an empty container
    if (!images.length) {
        return <div className="marquee-container empty"></div>;
    }

    return (
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
    );
};

export default ImageMarquee; 