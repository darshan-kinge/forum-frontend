import React, { useState, useEffect } from 'react';
import EventCard from '../../components/cards/event-cards/EventCard.jsx';
import './EventPage.css';
import config from '../../config/config.js';
const EventsPage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const eventsPerPage = 3;

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await fetch(`${config.serverUrl}/api/v1/events/all`);
            if (!response.ok) {
                throw new Error('Failed to fetch events');
            }
            const data = await response.json();
            setEvents(data || []);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const upcomingEvents = events.filter(event => event.eventType === 'upcoming');
    const previousEvents = events.filter(event => event.eventType === 'previous');

    // Calculate pagination
    const totalPages = Math.ceil(previousEvents.length / eventsPerPage);
    const indexOfLastEvent = currentPage * eventsPerPage;
    const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
    const currentPreviousEvents = previousEvents.slice(indexOfFirstEvent, indexOfLastEvent);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) return <div className="events-loading">Loading...</div>;
    if (error) return <div className="events-error">{error}</div>;

    return (
        <div className="events-page">
            <section className="events-section">
                <h2 className="section-title">Upcoming Events</h2>
                <div className="events-grid">
                    {upcomingEvents.length > 0 ? (
                        upcomingEvents.map(event => (
                            <EventCard key={event._id} event={event} />
                        ))
                    ) : (
                        <p className="no-events">No upcoming events at the moment.</p>
                    )}
                </div>
            </section>

            <section className="events-section">
                <h2 className="section-title">Previous Events</h2>
                <div className="events-grid">
                    {previousEvents.length > 0 ? (
                        currentPreviousEvents.map(event => (
                            <EventCard key={event._id} event={event} />
                        ))
                    ) : (
                        <p className="no-events">No previous events to show.</p>
                    )}
                </div>
                
                {previousEvents.length > eventsPerPage && (
                    <div className="pagination">
                        <button 
                            className="page-button"
                            disabled={currentPage === 1}
                            onClick={() => paginate(currentPage - 1)}
                        >
                            Previous
                        </button>
                        
                        <div className="page-numbers">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                                <button
                                    key={number}
                                    className={`page-number ${currentPage === number ? 'active' : ''}`}
                                    onClick={() => paginate(number)}
                                >
                                    {number}
                                </button>
                            ))}
                        </div>

                        <button 
                            className="page-button"
                            disabled={currentPage === totalPages}
                            onClick={() => paginate(currentPage + 1)}
                        >
                            Next
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
};

export default EventsPage;
