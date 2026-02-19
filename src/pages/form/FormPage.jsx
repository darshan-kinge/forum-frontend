import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './FormPage.css';
import HelmetComponent from '../../components/helmet/HelmetComponent';
import api from '../../utils/api';
import Loader from '../../components/loader/Loader';

const FormPage = () => {
  const { route } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState({
    respondentInfo: {},
    answers: []
  });

  useEffect(() => {
    if (route) {
      fetchForm();
    }
  }, [route]);

  const fetchForm = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/form/route/${route}`);
      const data = response.data;
      
      if (data.success && data.data) {
        const formDataFromApi = data.data;
        // Ensure customQuestions is always an array (API may omit or return null)
        const customQuestions = Array.isArray(formDataFromApi.customQuestions)
          ? formDataFromApi.customQuestions.filter(q => q && q.question && q.question.trim())
          : [];
        
        console.log('Form fetched from API:', formDataFromApi);
        console.log('Custom questions extracted:', customQuestions);
        
        setForm({ ...formDataFromApi, customQuestions });

        // Initialize respondentInfo based on respondentFields
        const initialRespondentInfo = {};
        if (formDataFromApi.respondentFields && formDataFromApi.respondentFields.length > 0) {
          formDataFromApi.respondentFields.forEach(field => {
            if (field && field.fieldName) {
              initialRespondentInfo[field.fieldName] = '';
            }
          });
        } else {
          // Backward compatibility
          if (formDataFromApi.collectName) {
            initialRespondentInfo.name = '';
          }
          if (formDataFromApi.collectEmail) {
            initialRespondentInfo.email = '';
          }
        }

        // Initialize answers array from customQuestions
        const initialAnswers = customQuestions.map((q, index) => ({
          questionIndex: index,
          question: (q && q.question) || '',
          answer: ''
        }));

        setFormData({
          respondentInfo: initialRespondentInfo,
          answers: initialAnswers
        });
      } else {
        setError(data.message || 'Form not found.');
      }
    } catch (error) {
      console.error('Error fetching form:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.request) {
        setError('Network error: Unable to connect to the server. Please check your internet connection and try again.');
      } else {
        setError('Failed to fetch form information. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRespondentInfoChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      respondentInfo: {
        ...prev.respondentInfo,
        [name]: value
      }
    }));
  };

  const handleInputChange = (e, questionIndex) => {
    const newAnswers = [...formData.answers];
    newAnswers[questionIndex].answer = e.target.value;
    
    // Clear answers for questions that depend on this question
    if (form && form.customQuestions) {
      form.customQuestions.forEach((question, idx) => {
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
    if (form && form.customQuestions) {
      form.customQuestions.forEach((question, idx) => {
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
      // Frontend validation
      if (form.respondentFields && form.respondentFields.length > 0) {
        for (const field of form.respondentFields) {
          if (field.required && (!formData.respondentInfo[field.fieldName] || !formData.respondentInfo[field.fieldName].trim())) {
            setError(`${field.label} is required.`);
            setShowErrorModal(true);
            setSubmitting(false);
            return;
          }
        }
      } else {
        // Backward compatibility
        if (form.collectEmail && (!formData.respondentInfo.email || !formData.respondentInfo.email.trim())) {
          setError('Email is required.');
          setShowErrorModal(true);
          setSubmitting(false);
          return;
        }
        if (form.collectName && (!formData.respondentInfo.name || !formData.respondentInfo.name.trim())) {
          setError('Name is required.');
          setShowErrorModal(true);
          setSubmitting(false);
          return;
        }
      }

      if (!form?._id) {
        setError('Form information is missing. Please refresh the page and try again.');
        setShowErrorModal(true);
        setSubmitting(false);
        return;
      }

      const response = await api.post('/form/submit', {
        formId: form._id,
        respondentInfo: formData.respondentInfo,
        answers: formData.answers
      });

      if (response.data.success) {
        setSuccess(response.data.message);
        setShowSuccessModal(true);
        
        // Reset form
        const initialRespondentInfo = {};
        if (form.respondentFields && form.respondentFields.length > 0) {
          form.respondentFields.forEach(field => {
            initialRespondentInfo[field.fieldName] = '';
          });
        } else {
          if (form.collectName) initialRespondentInfo.name = '';
          if (form.collectEmail) initialRespondentInfo.email = '';
        }
        
        setFormData({
          respondentInfo: initialRespondentInfo,
          answers: form?.customQuestions?.map((q, index) => ({
            questionIndex: index,
            question: q.question,
            answer: ''
          })) || []
        });
      } else {
        setError(response.data.message);
        setShowErrorModal(true);
      }
    } catch (error) {
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
        setError('Failed to submit form. Please try again.');
        setShowErrorModal(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderRespondentField = (field) => {
    const value = formData.respondentInfo[field.fieldName] || '';

    switch (field.type) {
      case 'email':
        return (
          <input
            type="email"
            name={field.fieldName}
            value={value}
            onChange={handleRespondentInfoChange}
            placeholder={field.placeholder || `Enter your ${field.label.toLowerCase()}`}
            required={field.required}
            className="form-input"
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            name={field.fieldName}
            value={value}
            onChange={handleRespondentInfoChange}
            placeholder={field.placeholder || `Enter your ${field.label.toLowerCase()}`}
            required={field.required}
            className="form-input"
          />
        );
      
      case 'tel':
        return (
          <input
            type="tel"
            name={field.fieldName}
            value={value}
            onChange={handleRespondentInfoChange}
            placeholder={field.placeholder || `Enter your ${field.label.toLowerCase()}`}
            required={field.required}
            className="form-input"
          />
        );
      
      case 'url':
        return (
          <input
            type="url"
            name={field.fieldName}
            value={value}
            onChange={handleRespondentInfoChange}
            placeholder={field.placeholder || `Enter your ${field.label.toLowerCase()}`}
            required={field.required}
            className="form-input"
          />
        );
      
      case 'date':
        return (
          <input
            type="date"
            name={field.fieldName}
            value={value}
            onChange={handleRespondentInfoChange}
            required={field.required}
            className="form-input"
          />
        );
      
      default:
        return (
          <input
            type="text"
            name={field.fieldName}
            value={value}
            onChange={handleRespondentInfoChange}
            placeholder={field.placeholder || `Enter your ${field.label.toLowerCase()}`}
            required={field.required}
            className="form-input"
          />
        );
    }
  };

  const renderQuestion = (question, index) => {
    if (!question) return null;
    const answer = formData.answers[index]?.answer ?? '';

    const options = Array.isArray(question.options) ? question.options : [];

    switch (question.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <input
            type={question.type}
            value={answer}
            onChange={(e) => handleInputChange(e, index)}
            placeholder={question.placeholder || `Enter your ${question.type}`}
            required={question.required}
            className="form-input"
          />
        );

      case 'textarea':
        return (
          <textarea
            value={answer}
            onChange={(e) => handleInputChange(e, index)}
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
            onChange={(e) => handleInputChange(e, index)}
            required={question.required}
            className="form-select"
          >
            <option value="">Select an option</option>
            {options.map((option, optIndex) => (
              <option key={optIndex} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="radio-group">
            {options.map((option, optIndex) => (
              <label key={optIndex} className="radio-label">
                <input
                  type="radio"
                  name={`question_${index}`}
                  value={option}
                  checked={answer === option}
                  onChange={(e) => handleInputChange(e, index)}
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
            {options.map((option, optIndex) => (
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
            onChange={(e) => handleInputChange(e, index)}
            required={question.required}
            className="form-input"
          />
        );

      default:
        return (
          <input
            type="text"
            value={answer}
            onChange={(e) => handleInputChange(e, index)}
            placeholder="Enter your answer"
            required={question.required}
            className="form-input"
          />
        );
    }
  };

  const isQuestionVisible = (question, questionIndex) => {
    if (!question || !form?.customQuestions) return true;
    
    // If showIf is missing or incomplete, question is always visible
    if (!question.showIf || typeof question.showIf.questionIndex === 'undefined' || typeof question.showIf.value === 'undefined') {
      return true;
    }
    
    const showIf = question.showIf;
    const parentIdx = showIf.questionIndex;
    
    // Avoid self-reference
    if (parentIdx === questionIndex) return true;
    
    // Check if parent index is valid
    if (typeof parentIdx !== 'number' || parentIdx < 0 || parentIdx >= form.customQuestions.length) {
      return true; // Invalid parent index, show question anyway
    }
    
    const parentAnswer = formData.answers[parentIdx]?.answer;

    // Check if parent question is visible first
    const parentQuestion = form.customQuestions[parentIdx];
    if (!parentQuestion || !isQuestionVisible(parentQuestion, parentIdx)) {
      return false;
    }

    // Check if parent answer matches the condition
    if (showIf.operator === 'equals') {
      if (Array.isArray(parentAnswer)) return parentAnswer.includes(showIf.value);
      return parentAnswer === showIf.value;
    }
    return true;
  };

  if (loading) {
    return <Loader />;
  }

  if (!form) {
    return (
      <div className="form-page">
        <HelmetComponent
          pageName="Form"
          description="Form not found"
        />
        <div className="form-container">
          <div className="error-message">
            <h2>Form Not Found</h2>
            <p>{error || 'The form you are looking for does not exist or is inactive.'}</p>
            <button onClick={() => navigate('/')} className="btn-primary">
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">
      <HelmetComponent
        pageName={form.title}
        description={form.description}
      />
      
      <div className="form-container">
        <div className="form-header">
          <h1>{form.title}</h1>
          <p className="form-description">{form.description}</p>
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
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-form">
          {/* Respondent Info Section */}
          {(form.respondentFields && form.respondentFields.length > 0) || form.collectName || form.collectEmail ? (
            <div className="form-section">
              <h2>Your Information</h2>
              <div className="form-grid">
                {form.respondentFields && form.respondentFields.length > 0 ? (
                  form.respondentFields.map((field, index) => (
                    <div key={index} className="form-group">
                      <label>
                        {field.label}
                        {field.required && <span className="required"> *</span>}
                      </label>
                      {renderRespondentField(field)}
                    </div>
                  ))
                ) : (
                  <>
                    {form.collectName && (
                      <div className="form-group">
                        <label>
                          Name
                          <span className="required"> *</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.respondentInfo.name || ''}
                          onChange={handleRespondentInfoChange}
                          required
                          className="form-input"
                        />
                      </div>
                    )}
                    {form.collectEmail && (
                      <div className="form-group">
                        <label>
                          Email
                          <span className="required"> *</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.respondentInfo.email || ''}
                          onChange={handleRespondentInfoChange}
                          required
                          className="form-input"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : null}

          {/* Custom Questions Section - show when we have any questions */}
          {Array.isArray(form.customQuestions) && form.customQuestions.length > 0 && (
            <div className="form-section form-section-questions">
              <h2>Questions</h2>
              <div className="form-questions-list">
                {form.customQuestions.map((question, index) => {
                  if (!question || typeof question.question === 'undefined') return null;
                  const visible = isQuestionVisible(question, index);
                  return visible ? (
                    <div key={index} className="form-group form-question-group">
                      <label>
                        {question.question}
                        {question.required && <span className="required"> *</span>}
                      </label>
                      {renderQuestion(question, index)}
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}

          <div className="form-action-button">
            <button
              type="submit"
              disabled={submitting}
              className={`btn-primary ${submitting ? 'loading' : ''}`}
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormPage;
