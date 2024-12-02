// pages/Events/EventDetailsPage/EventDetailsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EventDetail.css';
import config from '../../../config/config.js';

const EventDetailsPage = () => {
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeImage, setActiveImage] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Interval duration in milliseconds (5 seconds)
    const SLIDE_INTERVAL = 5000;

    useEffect(() => {
        fetchEventDetails();
    }, [id]);

    const fetchEventDetails = async () => {
        try {
            const response = await fetch(`${config.serverUrl}/api/v1/events/${id}`);
            if (!response.ok) {
                throw new Error('Event not found');
            }
            const data = await response.json();
            setEvent(data);
            setActiveImage(data.coverImage);
        } catch (error) {
            console.error("Error fetching event details:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Function to get all images including cover image
    const getAllImages = useCallback(() => {
        if (!event) return [];
        return [event.coverImage, ...(event.images || [])];
    }, [event]);

    // Function to get next image
    const getNextImage = useCallback(() => {
        const allImages = getAllImages();
        const currentIndex = allImages.indexOf(activeImage);
        const nextIndex = (currentIndex + 1) % allImages.length;
        return allImages[nextIndex];
    }, [activeImage, getAllImages]);

    // Auto-slide effect
    useEffect(() => {
        let intervalId;

        if (event && event.images?.length > 0) {
            intervalId = setInterval(() => {
                setActiveImage(getNextImage());
            }, SLIDE_INTERVAL);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [getNextImage, event]);

    // Handle manual image change
    const handleImageClick = (image) => {
        setActiveImage(image);
    };

    if (loading) return <div className="event-details-loading">Loading...</div>;
    if (error) return <div className="event-details-error">{error}</div>;
    if (!event) return <div className="event-details-error">Event not found</div>;

    return (
        <div className="event-details-page">
            <button 
                className="back-button"
                onClick={() => navigate('/events')}
            >
                ← Back to Events
            </button>

            <div className="event-details-container">
                <div className="event-details-header">
                    <div className="event-badge">
                        {event.eventType === 'upcoming' ? 'Upcoming Event' : 'Previous Event'}
                    </div>
                    <h1 className="event-title">{event.title}</h1>
                    <p className="event-date">
                        {new Date(event.eventDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>

                <div className="event-details-content">
                    <div className="event-media">
                        <div className="main-image-container">
                            <img 
                                src={activeImage} 
                                alt={event.title}
                                className="main-image"
                            />
                        </div>

                        {event.eventType === 'previous' && event.images?.length > 0 && (
                            <div className="image-gallery">
                                <img 
                                    src={event.coverImage}
                                    alt="cover"
                                    className={`gallery-thumbnail ${activeImage === event.coverImage ? 'active' : ''}`}
                                    onClick={() => handleImageClick(event.coverImage)}
                                />
                                {event.images.map((image, index) => (
                                    <img 
                                        key={index}
                                        src={image}
                                        alt={`${event.title} - ${index + 1}`}
                                        className={`gallery-thumbnail ${activeImage === image ? 'active' : ''}`}
                                        onClick={() => handleImageClick(image)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="event-info">
                        <div className="event-description">
                            <h2>About the Event</h2>
                            <p>{event.description}</p>
                        </div>

                        {event.eventType === 'upcoming' && (
                            <div className="event-action">
                                <a 
                                    href={event.buttonLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="action-button"
                                >
                                    {event.buttonText}
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetailsPage;