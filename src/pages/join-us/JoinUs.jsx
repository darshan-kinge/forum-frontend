import React, { useState } from 'react';
import './JoinUs.css'; // Assuming you're using CSS modules
import courseOptions from './courses.json';
import { useNavigate } from 'react-router-dom';
import config from '../../config/config.js';
import HelmetComponent from '../../components/helmet/HelmetComponent.jsx';

const RegistrationForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // Loading state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    gender: '',
    email: '',
    prn: '',
    year: '',
    course: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading to true when form is submitted
    try {
      const formdata = {
        first_name: formData.first_name.charAt(0).toUpperCase() + formData.first_name.slice(1),
        last_name: formData.last_name.charAt(0).toUpperCase() + formData.last_name.slice(1),
        gender: formData.gender,
        email: formData.email.toLowerCase(),
        prn: Number(formData.prn),
        course: formData.course,
        year: formData.year,
      };

      const res = await fetch(`${config.serverUrl}/api/${config.apiVersion}/member/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formdata),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Registration successful');
        const token = data.member._id;
        navigate(`/member/badge/${token}`);
      } else {
        alert(`${data.details}`);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false); // Set loading to false after the request is complete
    }
  };

  return (
    <div className='wrapper'>
      <HelmetComponent
        pageName="Join Us"
        description="Join MIT-WPU Science and Spirituality Forum"
        keywords='MIT-WPU, Science and Spirituality Forum, SNSF, Science, Spirituality, Forum, MIT, WPU, Vishwanath Karad, Rahul Karad'
      />
      <div className="registrationTitle">
        <h1>Registration Form</h1>
      </div>
      <div className='registrationContainer'>
        <form onSubmit={handleSubmit}>
          <div className='inputRow'>
            <div className='inputGroup'>
              <label htmlFor="first_name">First Name</label>
              <input value={formData.first_name} onChange={handleChange} type="text" id="first_name" name="first_name" required />
            </div>
            <div className='inputGroup'>
              <label htmlFor="last_name">Last Name</label>
              <input value={formData.last_name} onChange={handleChange} type="text" id="last_name" name="last_name" required />
            </div>
          </div>

          <div className='inputRow'>
            <div className='inputGroup'>
              <label htmlFor="gender">Gender</label>
              <select value={formData.gender} onChange={handleChange} id="gender" name="gender" required>
                <option value="select">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className='inputGroup'>
              <label htmlFor="email">Email ID</label>
              <input value={formData.email} onChange={handleChange} type="email" id="email" name="email" required />
            </div>
          </div>

          <div className='inputRow'>
            <div className='inputGroup'>
              <label htmlFor="prn">PRN</label>
              <input value={formData.prn} onChange={handleChange} type="text" id="prn" name="prn" required />
            </div>
            <div className='inputGroup'>
              <label htmlFor="year">Year</label>
              <select value={formData.year} onChange={handleChange} id="year" name="year" required>
                <option value="select">Select</option>
                <option value="FY">FY</option>
                <option value="SY">SY</option>
                <option value="TY">TY</option>
                <option value="Final Year">Final Year</option>
              </select>
            </div>
          </div>

          <div className='inputRow'>
            <div className='inputGroup'>
              <label htmlFor="course">Course</label>
              <select
                value={formData.course}
                onChange={handleChange}
                id="course"
                name="course"
                required
              >
                <option value="">Select Course</option>
                {courseOptions.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className='submitGroup'>
            <button type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
