// components/shared/EventCard/EventCard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EventCard.css';

const EventCard = ({ event }) => {
    const [showImages, setShowImages] = useState(false);
    const isUpcoming = event.eventType === 'upcoming';
    const navigate = useNavigate();

    const truncateDescription = (description) => {
        const maxLength = 80;
        return description.length > maxLength ? `${description.substring(0, maxLength)}...` : description;
    };

    const handleCardClick = () => {
        navigate(`/events/${event._id}`);
    };

    return (
        <div className="event-card" onClick={handleCardClick}>
            <div className="event-card__image-container">
                <img 
                    src={event.coverImage} 
                    alt={event.title} 
                    className="event-card__cover-image"
                />
                <span className={`event-card__badge ${isUpcoming ? 'upcoming' : 'previous'}`}>
                    {isUpcoming ? 'Upcoming' : 'Previous'}
                </span>
            </div>

            <div className="event-card__content">
                <h3 className="event-card__title">{event.title}</h3>
                <p className="event-card__date">
                    {new Date(event.eventDate).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    })}
                </p>
                <p className="event-card__description" dangerouslySetInnerHTML={{ __html: truncateDescription(event.description) }} />
            </div>
        </div>
    );
};

export default EventCard;