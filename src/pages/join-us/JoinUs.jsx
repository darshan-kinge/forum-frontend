import React, { useState, useEffect } from 'react';
import './JoinUs.css'; // Assuming you're using CSS modules
import courseOptions from './courses.json';
import { useNavigate } from 'react-router-dom';
import config from '../../config/config.js';

const RegistrationForm = () => {

  const navigate = useNavigate();

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
    
  const handleSubmit = async(e) => {
    e.preventDefault();
    try {
      const formdata = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        gender: formData.gender,
        email: formData.email,
        prn: Number(formData.prn),
        course: formData.course,
        year: formData.year,
      };

      const res = await fetch(`${config.serverUrl}/api/v1/member/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formdata),
      });

      const data  = await res.json();

      
      console.log(data);
      // const token = data.member._id;
      
      if (res.ok) {
        alert('Registration successful');

        const token = data.member._id;

        navigate(`/member/badge/${token}`);

      } else {
        alert(`${data.details}`);
      }
    } catch (error) {
      console.log(error);
    }
  }; 

  return (
    <div className='wrapper'>
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
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="5th Year">5th Year</option>
                <option value="6th Year">6th Year</option>
              </select>
            </div>
          </div>

          <div className='inputRow'>
            <div className='inputGroup'>
              <label htmlFor="course">Course</label>
              <input
                value={formData.course}
                list="courseOptions"
                id="course"
                name="course"
                onChange={handleChange}
                required
              />
              <datalist id="courseOptions">
                {courseOptions.map((option, index) => (
                  <option key={index} value={option} />
                ))}
              </datalist>
            </div>
          </div>

          <div className='submitGroup'>
            <button type="submit">Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
