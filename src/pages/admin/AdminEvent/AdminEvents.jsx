// pages/admin/AdminEvents/AdminEventsPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Table from './AdminEventsTable/AdminEventsTable.jsx';
import './AdminEvent.css';
import { validateFileSize, formatFileSize, MAX_FILE_SIZE } from '../../../utils/filesizeValidation.js';
import api from '../../../utils/api.js';
import Loader from '../../../components/loader/Loader.jsx';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const AdminEventsPage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [editingEvent, setEditingEvent] = useState(null);
    const { AuthorizationToken } = useAuth();
    const eventsPerPage = 5;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        eventType: '',
        eventDate: '',
        coverImage: null,
        buttonText: '',
        buttonLink: '',
        images: [],
        isButtonEnabled: false
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        if (editingEvent) {
            const formattedDate = new Date(editingEvent.eventDate)
                .toISOString()
                .split('T')[0];

            setFormData({
                title: editingEvent.title || '',
                description: editingEvent.description || '',
                eventType: editingEvent.eventType || '',
                eventDate: formattedDate,
                coverImage: null,
                buttonText: editingEvent.buttonText || '',
                buttonLink: editingEvent.buttonLink || '',
                images: [],
                isButtonEnabled: !!(editingEvent.buttonText && editingEvent.buttonLink)
            });
        }
    }, [editingEvent]);

    const handleEdit = (event) => {
        setEditingEvent(event);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            eventType: '',
            eventDate: '',
            coverImage: null,
            buttonText: '',
            buttonLink: '',
            images: [],
            isButtonEnabled: false
        });
        setEditingEvent(null);
    };

    const fetchEvents = async () => {
        try {
            const response = await api.get('/events/all');
            const data = await response.data;
            setEvents(data);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const data = new FormData();

            if (!formData.title || !formData.description || !formData.eventType || !formData.eventDate) {
                throw new Error('Please fill in all required fields');
            }

            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('eventType', formData.eventType);
            data.append('eventDate', formData.eventDate);

            if (formData.eventType === 'upcoming') {
                data.append('buttonText', formData.buttonText || undefined);
                data.append('buttonLink', formData.buttonLink || undefined);
            }

            if (formData.coverImage) {
                data.append('coverImage', formData.coverImage);
            } else if (!editingEvent) {
                throw new Error('Cover image is required');
            }

            if (formData.eventType === 'previous' && formData.images?.length > 0) {
                formData.images.forEach(image => {
                    data.append('images', image);
                });
            }

            for (let pair of data.entries()) {
                console.log(pair[0], pair[1]);
            }

            const response = await api.post(editingEvent
                ? `/events/update/${editingEvent._id}`
                : `/events/create`, data);

            alert(editingEvent ? 'Event updated successfully' : 'Event created successfully');
            resetForm();
            fetchEvents();
        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this event?')) return;

        try {
            const response = await api.delete(`/events/delete/${id}`);

            if (response.status === 200) {
                fetchEvents();
                alert('Event deleted successfully');
            } else {
                throw new Error('Failed to delete event');
            }
        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        }
    };

    const handleFileChange = (e, field) => {
        try {
            const files = Array.from(e.target.files);
            
            // Validate each file
            files.forEach(file => {
                validateFileSize(file);
            });

            setFormData(prev => ({
                ...prev,
                [field]: field === 'images' ? files : files[0]
            }));
        } catch (error) {
            alert(error.message);
            // Reset the file input
            e.target.value = '';
        }
    };

    const columns = [
        {
            key: 'title',
            label: 'Title',
        },
        {
            key: 'eventType',
            label: 'Type',
            render: (value) => value.charAt(0).toUpperCase() + value.slice(1)
        },
        {
            key: 'eventDate',
            label: 'Date',
            render: (value) => new Date(value).toLocaleDateString()
        },
        {
            key: 'coverImage',
            label: 'Cover Image',
            render: (value) => (
                <img 
                    src={value} 
                    alt="cover" 
                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                />
            )
        }
    ];

    // Calculate pagination
    const indexOfLastEvent = currentPage * eventsPerPage;
    const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
    const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);
    const totalPages = Math.ceil(events.length / eventsPerPage);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    };

    return (
        <div className="admin-events-page">
            <div className="admin-events-header">
                <h1>{editingEvent ? 'Edit Event' : 'Create New Event'}</h1>
                {editingEvent && (
                    <button 
                        className="cancel-button"
                        onClick={resetForm}
                    >
                        Cancel Editing
                    </button>
                )}
            </div>

            <form className="event-form" onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group">
                        <label>Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Event Type</label>
                        <select
                            value={formData.eventType}
                            onChange={(e) => setFormData({...formData, eventType: e.target.value})}
                            required
                        >
                            <option value="">Select Type</option>
                            <option value="upcoming">Upcoming</option>
                            <option value="previous">Previous</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Event Date</label>
                        <input
                            type="date"
                            value={formData.eventDate}
                            onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
                            required
                        />
                    </div>

                    {formData.eventType === 'upcoming' && (
                        <>
                            <div className="form-group">
                                <label>Button Text</label>
                                <input
                                    type="text"
                                    value={formData.buttonText}
                                    onChange={(e) => setFormData({...formData, buttonText: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Button Link</label>
                                <input
                                    type="url"
                                    value={formData.buttonLink}
                                    onChange={(e) => setFormData({...formData, buttonLink: e.target.value})}
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className="form-group">
                    <label>Event Description</label>
                    <ReactQuill 
                        value={formData.description}
                        onChange={(value) => setFormData({ ...formData, description: value })}
                        modules={{
                            toolbar: [
                                [{ 'header': [1, 2, false] }],
                                ['bold', 'italic', 'underline'],
                                ['link', 'image'],
                                ['clean'] // remove formatting button
                            ]
                        }}
                        formats={[
                            'header', 'bold', 'italic', 'underline', 'link', 'image'
                        ]}
                    />
                </div>

                <div className="form-group">
                    <label>
                        Cover Image 
                        {editingEvent && " (Leave empty to keep current image)"}
                        <span className="file-limit">Max size: {formatFileSize(MAX_FILE_SIZE)}</span>
                    </label>
                    <input
                        type="file"
                        onChange={(e) => setFormData({...formData, coverImage: e.target.files[0]})}
                        accept="image/*"
                        required={!editingEvent}
                    />
                    {editingEvent && editingEvent.coverImage && (
                        <div className="current-image">
                            <p>Current cover image:</p>
                            <img 
                                src={editingEvent.coverImage} 
                                alt="Current cover" 
                                style={{ maxWidth: '200px' }} 
                            />
                        </div>
                    )}
                </div>

                {formData.eventType === 'previous' && (
                    <div className="form-group">
                        <label>
                            Event Images 
                            {editingEvent && " (Leave empty to keep current images)"}
                            <span className="file-limit">Max size: {formatFileSize(MAX_FILE_SIZE)}</span>
                        </label>
                        <input
                            type="file"
                            multiple
                            onChange={(e) => setFormData({...formData, images: Array.from(e.target.files)})}
                            accept="image/*"
                        />
                        {editingEvent && editingEvent.images?.length > 0 && (
                            <div className="current-images">
                                <p>Current event images:</p>
                                <div className="images-grid">
                                    {editingEvent.images.map((img, index) => (
                                        <img 
                                            key={index}
                                            src={img} 
                                            alt={`Event ${index + 1}`} 
                                            style={{ maxWidth: '100px' }} 
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="form-actions">
                    <button type="submit" className="submit-button" disabled={isSubmitting}>
                        {isSubmitting ? (editingEvent ? 'Updating...' : 'Creating...') : (editingEvent ? 'Update Event' : 'Create Event')}
                    </button>
                </div>
            </form>

            <Table
                columns={columns}
                data={currentEvents}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isLoading={loading}
            />

            {events.length > eventsPerPage && (
                <div className="admin-pagination">
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
        </div>
    );
};

export default AdminEventsPage;