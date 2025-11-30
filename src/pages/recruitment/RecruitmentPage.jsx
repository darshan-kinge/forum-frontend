import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './RecruitmentPage.css';
import HelmetComponent from '../../components/helmet/HelmetComponent';
import api from '../../utils/api';
import Loader from '../../components/loader/Loader';
import courseOptions from '../join-us/courses.json';

const RecruitmentPage = () => {
  const [recruitment, setRecruitment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    applicantInfo: {
      first_name: '',
      last_name: '',
      gender: '',
      email: '',
      prn: '',
      year: '',
      course: ''
    },
    answers: []
  });

  const isValidMitwpuEmail = (email) => /@mitwpu\.edu\.in$/i.test(email.trim());

  useEffect(() => {
    fetchActiveRecruitment();
  }, []);

  const fetchActiveRecruitment = async () => {
    try {
      setLoading(true);
      const response = await api.get('/recruitment/active');
      const data = response.data;
      // console.log(data);
      if (data.success && data.data) {
        setRecruitment(data.data);
        // Initialize answers array with empty values
        const customQuestions = data.data.customQuestions || [];
        const initialAnswers = customQuestions.map((q, index) => ({
          questionIndex: index,
          question: q.question,
          answer: ''
        }));
        setFormData(prev => ({
          ...prev,
          answers: initialAnswers
        }));
      } else {
        setError(data.message || 'No active recruitment found.');        
      }
    } catch (error) {
      console.error('Error fetching recruitment:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.request) {
        setError('Network error: Unable to connect to the server. Please check your internet connection and try again.');
      } else {
        setError('Failed to fetch recruitment information. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e, field, questionIndex = null) => {
    if (field === 'applicantInfo') {
      setFormData(prev => ({
        ...prev,
        applicantInfo: {
          ...prev.applicantInfo,
          [e.target.name]: e.target.value
        }
      }));
    } else if (field === 'answers' && questionIndex !== null) {
      const newAnswers = [...formData.answers];
      newAnswers[questionIndex].answer = e.target.value;
      
      // Clear answers for questions that depend on this question
      if (recruitment && recruitment.customQuestions) {
        recruitment.customQuestions.forEach((question, idx) => {
          if (question.showIf && question.showIf.questionIndex === questionIndex) {
            newAnswers[idx].answer = '';
          }
        });
      }
      
      setFormData(prev => ({
        ...prev,
        answers: newAnswers
      }));
    }
  };

  const handleCheckboxChange = (questionIndex, option) => {
    const newAnswers = [...formData.answers];
    if (!newAnswers[questionIndex].answer) {
      newAnswers[questionIndex].answer = [];
    }
    
    const currentAnswers = Array.isArray(newAnswers[questionIndex].answer) 
      ? newAnswers[questionIndex].answer 
      : [newAnswers[questionIndex].answer];

    if (currentAnswers.includes(option)) {
      newAnswers[questionIndex].answer = currentAnswers.filter(a => a !== option);
    } else {
      newAnswers[questionIndex].answer = [...currentAnswers, option];
    }

    // Clear answers for questions that depend on this question
    if (recruitment && recruitment.customQuestions) {
      recruitment.customQuestions.forEach((question, idx) => {
        if (question.showIf && question.showIf.questionIndex === questionIndex) {
          newAnswers[idx].answer = '';
        }
      });
    }

    setFormData(prev => ({
      ...prev,
      answers: newAnswers
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Frontend validation without zod
      const { first_name, last_name, gender, email, prn, year, course } = formData.applicantInfo;
      if (!first_name?.trim() || !last_name?.trim() || !gender || !email?.trim() || !prn?.trim() || !year || !course) {
        setError('Please fill in all required fields.');
        setShowErrorModal(true);
        setSubmitting(false);
        return;
      }
      if (!isValidMitwpuEmail(email)) {
        setError('Use your mitwpu.edu.in email');
        setShowErrorModal(true);
        setSubmitting(false);
        return;
      }

      if (!recruitment?._id) {
        setError('Recruitment information is missing. Please refresh the page and try again.');
        setShowErrorModal(true);
        setSubmitting(false);
        return;
      }

      const response = await api.post('/recruitment/apply', {
        recruitmentId: recruitment._id,
        applicantInfo: formData.applicantInfo,
        answers: formData.answers
      });

      if (response.data.success) {
        setSuccess(response.data.message);
        setShowSuccessModal(true);
        // If a WhatsApp group link is configured, optionally show a join button
        // We'll keep it in the success modal for visibility
        // Reset form
        setFormData({
          applicantInfo: {
            first_name: '',
            last_name: '',
            gender: '',
            email: '',
            prn: '',
            year: '',
            course: ''
          },
          answers: recruitment?.customQuestions?.map((q, index) => ({
            questionIndex: index,
            question: q.question,
            answer: ''
          })) || []
        });
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      // Prefer backend validator details first
      if (error.response?.data?.details) {
        setError(error.response.data.details);
        setShowErrorModal(true);
      } else if (error.response?.data?.extraDetails) {
        setError(error.response.data.extraDetails);
        setShowErrorModal(true);
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
        setShowErrorModal(true);
      } else {
        setError('Failed to submit application. Please try again.');
        setShowErrorModal(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question, index) => {
    const answer = formData.answers[index]?.answer || '';

    switch (question.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <input
            type={question.type}
            value={answer}
            onChange={(e) => handleInputChange(e, 'answers', index)}
            placeholder={question.placeholder || `Enter your ${question.type}`}
            required={question.required}
            className="form-input"
          />
        );

      case 'textarea':
        return (
          <textarea
            value={answer}
            onChange={(e) => handleInputChange(e, 'answers', index)}
            placeholder={question.placeholder || 'Enter your answer'}
            required={question.required}
            rows={4}
            className="form-textarea"
          />
        );

      case 'dropdown':
        return (
          <select
            value={answer}
            onChange={(e) => handleInputChange(e, 'answers', index)}
            required={question.required}
            className="form-select"
          >
            <option value="">Select an option</option>
            {question.options.map((option, optIndex) => (
              <option key={optIndex} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="radio-group">
            {question.options.map((option, optIndex) => (
              <label key={optIndex} className="radio-label">
                <input
                  type="radio"
                  name={`question_${index}`}
                  value={option}
                  checked={answer === option}
                  onChange={(e) => handleInputChange(e, 'answers', index)}
                  required={question.required}
                />
                <span className="radio-text">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="checkbox-group">
            {question.options.map((option, optIndex) => (
              <label key={optIndex} className="checkbox-label">
                <input
                  type="checkbox"
                  value={option}
                  checked={Array.isArray(answer) ? answer.includes(option) : false}
                  onChange={() => handleCheckboxChange(index, option)}
                  required={question.required && (!answer || answer.length === 0)}
                />
                <span className="checkbox-text">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            value={answer}
            onChange={(e) => handleInputChange(e, 'answers', index)}
            required={question.required}
            className="form-input"
          />
        );

      default:
        return (
          <input
            type="text"
            value={answer}
            onChange={(e) => handleInputChange(e, 'answers', index)}
            placeholder="Enter your answer"
            required={question.required}
            className="form-input"
          />
        );
    }
  };

  const isQuestionVisible = (question, questionIndex) => {
    if (!question.showIf || !recruitment?.customQuestions) return true;
    
    const parentIdx = question.showIf.questionIndex;
    const parentAnswer = formData.answers[parentIdx]?.answer;
    
    // Check if parent question is visible first
    const parentQuestion = recruitment.customQuestions[parentIdx];
    if (!parentQuestion || !isQuestionVisible(parentQuestion, parentIdx)) {
      return false;
    }
    
    // Check if parent answer matches the condition
    if (question.showIf.operator === 'equals') {
      if (Array.isArray(parentAnswer)) return parentAnswer.includes(question.showIf.value);
      return parentAnswer === question.showIf.value;
    }
    return true;
  };

  if (loading) {
    return <Loader />;
  }

  if (!recruitment) {
    return (
      <div className="recruitment-page">
        <HelmetComponent
          pageName="Recruitment"
          description="Join the MIT-WPU Science and Spirituality Forum"
        />
        <div className="recruitment-container">
          <div className="error-message">
            <h2>Recruitment Currently Closed</h2>
            <p>{error || 'No active recruitment found.'}</p>
            <button onClick={() => navigate('/')} className="btn-primary">
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="recruitment-page">
      <HelmetComponent
        pageName="Recruitment"
        description="Join the MIT-WPU Science and Spirituality Forum"
      />
      
      <div className="recruitment-container">
        <div className="recruitment-header">
          <h1>{recruitment.title}</h1>
          <p className="recruitment-description">{recruitment.description}</p>
        </div>

        {showErrorModal && (
          <div className="modal-overlay" onClick={() => setShowErrorModal(false)}>
            <div className="modal modal--error" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Error</h3>
                <button className="close-btn" onClick={() => setShowErrorModal(false)}>×</button>
              </div>
              <div className="modal-body">
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {showSuccessModal && (
          <div className="modal-overlay" onClick={() => setShowSuccessModal(false)}>
            <div className="modal modal--success" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Success</h3>
                <button className="close-btn" onClick={() => setShowSuccessModal(false)}>×</button>
              </div>
              <div className="modal-body">
                <p>{success}</p>
                {recruitment?.whatsappGroupUrl && (
                  <p>
                    <a href={recruitment.whatsappGroupUrl} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{display:'inline-block', marginTop:'0.5rem', textDecoration:'none'}}>
                      Join WhatsApp Recruitment Group
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="recruitment-form">
          <div className="form-section">
            <h2>Personal Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.applicantInfo.first_name}
                  onChange={(e) => handleInputChange(e, 'applicantInfo')}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Last Name *</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.applicantInfo.last_name}
                  onChange={(e) => handleInputChange(e, 'applicantInfo')}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Gender *</label>
                <select
                  name="gender"
                  value={formData.applicantInfo.gender}
                  onChange={(e) => handleInputChange(e, 'applicantInfo')}
                  required
                  className="form-select"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div className="form-group">
                <label>Email (MIT-WPU Email Only) *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.applicantInfo.email}
                  onChange={(e) => handleInputChange(e, 'applicantInfo')}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>PRN *</label>
                <input
                  type="text"
                  name="prn"
                  value={formData.applicantInfo.prn}
                  onChange={(e) => handleInputChange(e, 'applicantInfo')}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Year *</label>
                <select
                  name="year"
                  value={formData.applicantInfo.year}
                  onChange={(e) => handleInputChange(e, 'applicantInfo')}
                  required
                  className="form-select"
                >
                  <option value="">Select Year</option>
                  <option value="FY">FY</option>
                  <option value="SY">SY</option>
                  <option value="TY">TY</option>
                  <option value="Final Year">Final Year</option>
                </select>
              </div>

              <div className="form-group">
                <label>Course *</label>
                <select
                  name="course"
                  value={formData.applicantInfo.course}
                  onChange={(e) => handleInputChange(e, 'applicantInfo')}
                  required
                  className="form-select"
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
          </div>

          {recruitment?.customQuestions && recruitment.customQuestions.length > 0 && (
            <div className="form-section">
              <h2>Additional Questions</h2>
              {recruitment.customQuestions.map((question, index) => (
                isQuestionVisible(question, index) && (
                  <div key={index} className="form-group">
                    <label>
                      {question.question}
                      {question.required && <span className="required"> *</span>}
                    </label>
                    {renderQuestion(question, index)}
                  </div>
                )
              ))}
            </div>
          )}

            <div className="form-action-button">
            <button
              type="submit"
              disabled={submitting}
              className={`btn-primary ${submitting ? 'loading' : ''}`}
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecruitmentPage;