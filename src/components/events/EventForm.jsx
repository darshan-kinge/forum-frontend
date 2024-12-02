// components/EventForm.js
import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './EventForm.css';

const EventForm = ({ onSubmit, initialData }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [isPreviousEvent, setIsPreviousEvent] = useState(initialData?.isPreviousEvent || false);
  const [registrationLink, setRegistrationLink] = useState(initialData?.registrationLink || '');
  const [images, setImages] = useState([]);

  const handleImageChange = (e) => setImages(e.target.files);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('isPreviousEvent', isPreviousEvent);
    if (isPreviousEvent) {
      for (let i = 0; i < images.length; i++) formData.append('images', images[i]);
    } else {
      formData.append('registrationLink', registrationLink);
    }
    onSubmit(formData);
  };

  return (
    <form className="event-form" onSubmit={handleSubmit}>
      <label>Title</label>
      <input
        type="text"
        className="event-form__input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <label>Description</label>
      <ReactQuill className="event-form__editor" value={description} onChange={setDescription} />

      <div className="event-form__checkbox-group">
        <input
          type="checkbox"
          checked={isPreviousEvent}
          onChange={() => setIsPreviousEvent(!isPreviousEvent)}
        />
        <span>Move to Previous Events</span>
      </div>

      {isPreviousEvent ? (
        <input
          type="file"
          className="event-form__input-file"
          multiple
          onChange={handleImageChange}
        />
      ) : (
        <input
          type="text"
          placeholder="Registration Link"
          className="event-form__input"
          value={registrationLink}
          onChange={(e) => setRegistrationLink(e.target.value)}
        />
      )}

      <button type="submit" className="event-form__button">Submit</button>
    </form>
  );
};

export default EventForm;
