import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { canView } from '../../../utils/permissions';
import { FaCopy, FaExternalLinkAlt } from 'react-icons/fa';
import './AdminForms.css';
import api from '../../../utils/api';
import Loader from '../../../components/loader/Loader';

const AdminForms = () => {
  const { AuthorizationToken, user, isLoading } = useAuth();
  const [forms, setForms] = useState([]);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('forms');
  const [showForm, setShowForm] = useState(false);
  const [editingForm, setEditingForm] = useState(null);
  const [selectedForm, setSelectedForm] = useState(null);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [responsesPerPage] = useState(10);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [questionFilter, setQuestionFilter] = useState({
    questionIndex: '',
    answerValue: ''
  });
  const [choiceQuestions, setChoiceQuestions] = useState([]);
  const [copiedFormId, setCopiedFormId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    headerImage: '',
    customRoute: '',
    isActive: false,
    customQuestions: [],
    successMessage: 'Thank you for your submission!',
    closedMessage: 'This form is currently closed. Please check back later.',
    allowMultipleSubmissions: false,
    maxSubmissions: null,
    submissionDeadline: null,
    collectEmail: true,
    collectName: true,
    respondentFields: []
  });
  const [headerImageUploading, setHeaderImageUploading] = useState(false);

  const [questionForm, setQuestionForm] = useState({
    question: '',
    type: 'text',
    options: [],
    required: false,
    placeholder: '',
    showIf: null
  });

  const [respondentFieldForm, setRespondentFieldForm] = useState({
    fieldName: '',
    label: '',
    type: 'text',
    required: false,
    placeholder: ''
  });

  const [editingQuestionIndexLocal, setEditingQuestionIndexLocal] = useState(null);
  const [editingRespondentFieldIndex, setEditingRespondentFieldIndex] = useState(null);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const response = await api.get('/form/admin/all');
      const forms = response.data.data || [];
      console.log('Fetched forms:', forms);
      forms.forEach((form, idx) => {
        console.log(`Form ${idx} (${form.title}):`, {
          customQuestions: form.customQuestions,
          customQuestionsLength: form.customQuestions?.length || 0
        });
      });
      setForms(forms);
    } catch (error) {
      console.error('Error fetching forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResponses = async (formId, page = 1, search = '', questionFilterData = null) => {
    try {
      const params = {
        page,
        limit: responsesPerPage
      };
      if (search) {
        params.search = search;
      }
      if (questionFilterData && questionFilterData.questionIndex !== '' && questionFilterData.answerValue !== '') {
        params.questionIndex = questionFilterData.questionIndex;
        params.answerValue = questionFilterData.answerValue;
      }
      
      const response = await api.get(`/form/admin/responses/${formId}`, { params });
      setResponses(response.data.data.responses);
      setPagination(response.data.data.pagination || {
        current: page,
        pages: 1,
        total: response.data.data.responses.length
      });
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching responses:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (selectedForm) {
      setCurrentPage(1);
      fetchResponses(selectedForm._id, 1, searchQuery, questionFilter);
    }
  };

  const handleQuestionFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilter = {
      ...questionFilter,
      [name]: value
    };
    if (name === 'questionIndex') {
      newFilter.answerValue = '';
    }
    setQuestionFilter(newFilter);
    
    if (selectedForm) {
      setCurrentPage(1);
      fetchResponses(selectedForm._id, 1, searchQuery, newFilter);
    }
  };

  const clearQuestionFilter = () => {
    const clearedFilter = { questionIndex: '', answerValue: '' };
    setQuestionFilter(clearedFilter);
    if (selectedForm) {
      setCurrentPage(1);
      fetchResponses(selectedForm._id, 1, searchQuery, clearedFilter);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value === '' && selectedForm) {
      setCurrentPage(1);
      fetchResponses(selectedForm._id, 1, '');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? null : Number(value)) : value)
    }));
  };

  const handleQuestionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQuestionForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRespondentFieldChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRespondentFieldForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addQuestion = () => {
    if (!questionForm.question.trim()) return;

    const newQuestion = { ...questionForm };
    
    if (editingQuestionIndexLocal !== null) {
      setFormData(prev => ({
        ...prev,
        customQuestions: prev.customQuestions.map((q, i) => i === editingQuestionIndexLocal ? newQuestion : q)
      }));
      setEditingQuestionIndexLocal(null);
    } else {
      setFormData(prev => ({
        ...prev,
        customQuestions: [...prev.customQuestions, newQuestion]
      }));
    }

    setQuestionForm({
      question: '',
      type: 'text',
      options: [],
      required: false,
      placeholder: '',
      showIf: null
    });
  };

  const removeQuestion = (index) => {
    setFormData(prev => ({
      ...prev,
      customQuestions: prev.customQuestions.filter((_, i) => i !== index)
    }));
    if (editingQuestionIndexLocal === index) {
      setEditingQuestionIndexLocal(null);
      setQuestionForm({ question: '', type: 'text', options: [], required: false, placeholder: '', showIf: null });
    }
  };

  const addRespondentField = () => {
    // Allow adding fields even if fieldName or label is empty
    const newField = { ...respondentFieldForm };
    
    if (editingRespondentFieldIndex !== null) {
      setFormData(prev => ({
        ...prev,
        respondentFields: prev.respondentFields.map((f, i) => i === editingRespondentFieldIndex ? newField : f)
      }));
      setEditingRespondentFieldIndex(null);
    } else {
      setFormData(prev => ({
        ...prev,
        respondentFields: [...prev.respondentFields, newField]
      }));
    }

    setRespondentFieldForm({
      fieldName: '',
      label: '',
      type: 'text',
      required: false,
      placeholder: ''
    });
  };

  const removeRespondentField = (index) => {
    setFormData(prev => ({
      ...prev,
      respondentFields: prev.respondentFields.filter((_, i) => i !== index)
    }));
    if (editingRespondentFieldIndex === index) {
      setEditingRespondentFieldIndex(null);
      setRespondentFieldForm({ fieldName: '', label: '', type: 'text', required: false, placeholder: '' });
    }
  };

  const editQuestion = (index) => {
    const q = formData.customQuestions[index];
    setQuestionForm({
      question: q.question || '',
      type: q.type || 'text',
      options: Array.isArray(q.options) ? q.options : [],
      required: !!q.required,
      placeholder: q.placeholder || '',
      showIf: q.showIf || null
    });
    setEditingQuestionIndexLocal(index);
  };

  const editRespondentField = (index) => {
    const f = formData.respondentFields[index];
    setRespondentFieldForm({
      fieldName: f.fieldName || '',
      label: f.label || '',
      type: f.type || 'text',
      required: !!f.required,
      placeholder: f.placeholder || ''
    });
    setEditingRespondentFieldIndex(index);
  };

  const addOption = () => {
    setQuestionForm(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const updateOption = (index, value) => {
    setQuestionForm(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const removeOption = (index) => {
    setQuestionForm(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingForm 
        ? `/form/admin/update/${editingForm._id}`
        : '/form/admin/create';

      // Filter out respondent fields that don't have both fieldName and label
      const validRespondentFields = formData.respondentFields
        .filter(f => f.fieldName && f.fieldName.trim() && f.label && f.label.trim())
        .map(f => {
          const { _id, ...cleanField } = f;
          // Ensure validation is either an object or undefined, not null
          if (cleanField.validation === null || (typeof cleanField.validation === 'object' && Object.keys(cleanField.validation).length === 0)) {
            delete cleanField.validation;
          }
          // Remove any null or undefined values
          Object.keys(cleanField).forEach(key => {
            if (cleanField[key] === null || cleanField[key] === undefined) {
              delete cleanField[key];
            }
          });
          return cleanField;
        });

      // Clean up the form data for submission
      const cleanedQuestions = formData.customQuestions
        .filter(q => q && q.question && q.question.trim()) // Only include questions with valid question text
        .map(q => {
          const { _id, ...cleanQuestion } = q;
          // Ensure required fields are present
          if (!cleanQuestion.question || !cleanQuestion.type) {
            console.warn('Skipping invalid question:', cleanQuestion);
            return null;
          }
          
          // Clean up validation and showIf fields
          if (cleanQuestion.validation === null || (typeof cleanQuestion.validation === 'object' && Object.keys(cleanQuestion.validation || {}).length === 0)) {
            delete cleanQuestion.validation;
          }
          // Remove showIf if it's null, incomplete, or invalid
          if (cleanQuestion.showIf === null) {
            delete cleanQuestion.showIf;
          } else if (cleanQuestion.showIf && typeof cleanQuestion.showIf === 'object') {
            // If showIf exists but is missing required fields, remove it
            if (typeof cleanQuestion.showIf.questionIndex === 'undefined' || 
                typeof cleanQuestion.showIf.value === 'undefined') {
              delete cleanQuestion.showIf;
            }
          }
          
          // Ensure options is an array for dropdown/radio/checkbox types
          if (['dropdown', 'radio', 'checkbox'].includes(cleanQuestion.type)) {
            cleanQuestion.options = Array.isArray(cleanQuestion.options) ? cleanQuestion.options : [];
          } else {
            // Remove options for non-choice types
            delete cleanQuestion.options;
          }
          
          // Remove any null or undefined values (but keep empty strings and empty arrays)
          Object.keys(cleanQuestion).forEach(key => {
            if (cleanQuestion[key] === null || cleanQuestion[key] === undefined) {
              delete cleanQuestion[key];
            }
          });
          
          return cleanQuestion;
        })
        .filter(q => q !== null); // Remove any null entries

      console.log('Sending customQuestions:', cleanedQuestions);
      
      const cleanedFormData = {
        title: formData.title,
        description: formData.description,
        headerImage: formData.headerImage || undefined,
        customRoute: formData.customRoute,
        isActive: formData.isActive,
        customQuestions: cleanedQuestions,
        respondentFields: validRespondentFields.length > 0 ? validRespondentFields : undefined,
        successMessage: formData.successMessage,
        closedMessage: formData.closedMessage,
        allowMultipleSubmissions: formData.allowMultipleSubmissions,
        maxSubmissions: formData.maxSubmissions || undefined,
        submissionDeadline: formData.submissionDeadline || undefined,
        collectEmail: formData.collectEmail,
        collectName: formData.collectName
      };

      // Ensure customQuestions is always an array (never undefined)
      if (!Array.isArray(cleanedFormData.customQuestions)) {
        cleanedFormData.customQuestions = [];
      }
      
      // Remove undefined values to avoid sending them (but keep empty arrays)
      Object.keys(cleanedFormData).forEach(key => {
        if (cleanedFormData[key] === undefined) {
          delete cleanedFormData[key];
        }
      });
      
      console.log('Final cleanedFormData being sent:', {
        title: cleanedFormData.title,
        customRoute: cleanedFormData.customRoute,
        customQuestionsCount: cleanedFormData.customQuestions?.length || 0,
        customQuestions: cleanedFormData.customQuestions
      });

      const response = editingForm 
        ? await api.put(url, cleanedFormData)
        : await api.post(url, cleanedFormData);
      
      if (response.data.success) {
        alert(editingForm ? 'Form updated successfully' : 'Form created successfully');
        fetchForms();
        resetForm();
      }
    } catch (error) {
      console.error('Error saving form:', error);
      alert(error.response?.data?.message || 'Error saving form');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      headerImage: '',
      customRoute: '',
      isActive: false,
      customQuestions: [],
      successMessage: 'Thank you for your submission!',
      closedMessage: 'This form is currently closed. Please check back later.',
      allowMultipleSubmissions: false,
      maxSubmissions: null,
      submissionDeadline: null,
      collectEmail: true,
      collectName: true,
      respondentFields: []
    });
    setEditingForm(null);
    setShowForm(false);
    setQuestionForm({ question: '', type: 'text', options: [], required: false, placeholder: '', showIf: null });
    setRespondentFieldForm({ fieldName: '', label: '', type: 'text', required: false, placeholder: '' });
  };

  const copyFormUrl = async (form) => {
    const url = `${window.location.origin}/f/${form.customRoute}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedFormId(form._id);
      setTimeout(() => setCopiedFormId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy URL');
    }
  };

  const handleHeaderImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select an image file (e.g. JPG, PNG)');
      return;
    }
    setHeaderImageUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('headerImage', file);
      const res = await api.post('/form/admin/upload-header', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.url) {
        setFormData(prev => ({ ...prev, headerImage: res.data.url }));
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setHeaderImageUploading(false);
      e.target.value = '';
    }
  };

  const removeHeaderImage = () => {
    setFormData(prev => ({ ...prev, headerImage: '' }));
  };

  const editForm = (form) => {
    setFormData({
      ...form,
      headerImage: form.headerImage || '',
      customQuestions: Array.isArray(form.customQuestions) ? form.customQuestions : [],
      submissionDeadline: form.submissionDeadline ? 
        new Date(form.submissionDeadline).toISOString().split('T')[0] : null
    });
    setEditingForm(form);
    setShowForm(true);
  };

  const deleteForm = async (id) => {
    if (!window.confirm('Are you sure you want to delete this form? This will also delete all responses.')) return;

    try {
      await api.delete(`/form/admin/delete/${id}`);
      alert('Form deleted successfully');
      fetchForms();
    } catch (error) {
      console.error('Error deleting form:', error);
      alert(error.response?.data?.message || 'Error deleting form');
    }
  };

  const updateResponseStatus = async (responseId, status) => {
    try {
      await api.put(`/form/admin/response/${responseId}/status`, { status });
      alert('Response status updated successfully');
      if (selectedForm) {
        fetchResponses(selectedForm._id, currentPage, searchQuery, questionFilter);
      }
    } catch (error) {
      console.error('Error updating response status:', error);
      alert('Error updating response status');
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (!canView(user, 'forms')) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="admin-forms">
      <div className="admin-header-forms">
        <h1>Form Management</h1>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          Create New Form
        </button>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'forms' ? 'active' : ''}`}
          onClick={() => setActiveTab('forms')}
        >
          Forms
        </button>
        <button 
          className={`tab ${activeTab === 'responses' ? 'active' : ''}`}
          onClick={() => setActiveTab('responses')}
        >
          Responses
        </button>
      </div>

      {activeTab === 'forms' && (
        <div className="forms-section">
          {forms.length === 0 ? (
            <div className="empty-state">
              <p>No forms found. Create your first form!</p>
            </div>
          ) : (
            <div className="forms-grid">
              {forms.map(form => (
                <div key={form._id} className="form-card">
                  <div className="form-card-header">
                    <h3 className="form-card-title">{form.title}</h3>
                    <span className={`form-card-status ${form.isActive ? 'active' : 'inactive'}`}>
                      {form.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="form-card-description">
                    {form.description.length > 100 ? `${form.description.slice(0, 100)}...` : form.description}
                  </p>
                  <div className="form-card-stats">
                    <div className="form-card-stat form-card-route">
                      <span className="form-card-stat-label">Form URL</span>
                      <div className="form-card-route-row">
                        <code className="form-card-route-code">{window.location.origin}/f/{form.customRoute}</code>
                        <button
                          type="button"
                          className="form-card-copy-btn"
                          onClick={() => copyFormUrl(form)}
                          title="Copy form URL"
                        >
                          {copiedFormId === form._id ? (
                            <span className="form-card-copy-text">Copied!</span>
                          ) : (
                            <>
                              <FaCopy className="form-card-copy-icon" />
                              <span className="form-card-copy-text">Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="form-card-stat">
                      <span className="form-card-stat-label">Submissions</span>
                      <span>{form.currentSubmissions}{form.maxSubmissions ? ` / ${form.maxSubmissions}` : ''}</span>
                    </div>
                    <div className="form-card-stat">
                      <span className="form-card-stat-label">Questions</span>
                      <span>{form.customQuestions?.length || 0}</span>
                    </div>
                    <div className="form-card-stat">
                      <span className="form-card-stat-label">Respondent fields</span>
                      <span>{form.respondentFields?.length || 0}</span>
                    </div>
                  </div>
                  <div className="form-card-actions">
                    <a
                      href={`/f/${form.customRoute}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary form-card-btn"
                    >
                      <FaExternalLinkAlt /> View Form
                    </a>
                    <button
                      type="button"
                      className="btn-secondary form-card-btn"
                      onClick={() => editForm(form)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn-secondary form-card-btn"
                      onClick={() => {
                        setSelectedForm(form);
                        setCurrentPage(1);
                        setSearchQuery('');
                        setQuestionFilter({ questionIndex: '', answerValue: '' });
                        const choiceBased = (form.customQuestions || [])
                          .map((q, idx) => ({ ...q, index: idx }))
                          .filter(q => ['dropdown', 'radio', 'checkbox'].includes(q.type));
                        setChoiceQuestions(choiceBased);
                        fetchResponses(form._id, 1, '', null);
                        setActiveTab('responses');
                      }}
                    >
                      View Responses
                    </button>
                    <button
                      type="button"
                      className="btn-danger form-card-btn"
                      onClick={() => deleteForm(form._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'responses' && (
        <div className="responses-section">
          {selectedForm && (
            <div className="selected-form">
              <h3>Responses for: {selectedForm.title}</h3>
            </div>
          )}

          {selectedForm && (
            <div className="responses-search-bar">
              <form onSubmit={handleSearch} className="search-form">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by name, email, or answers..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <button type="submit" className="btn-secondary search-button">
                  Search
                </button>
                {searchQuery && (
                  <button
                    type="button"
                    className="btn-secondary clear-search-button"
                    onClick={() => {
                      setSearchQuery('');
                      setCurrentPage(1);
                      fetchResponses(selectedForm._id, 1, '', questionFilter);
                    }}
                  >
                    Clear
                  </button>
                )}
              </form>
            </div>
          )}

          {selectedForm && choiceQuestions.length > 0 && (
            <div className="responses-filter-bar">
              <h4>Filter by Question:</h4>
              <div className="filter-form">
                <select
                  className="filter-select"
                  name="questionIndex"
                  value={questionFilter.questionIndex}
                  onChange={handleQuestionFilterChange}
                >
                  <option value="">Select a question...</option>
                  {choiceQuestions.map((q) => (
                    <option key={q.index} value={q.index}>
                      {q.question}
                    </option>
                  ))}
                </select>

                {questionFilter.questionIndex !== '' && (
                  <>
                    <select
                      className="filter-select"
                      name="answerValue"
                      value={questionFilter.answerValue}
                      onChange={handleQuestionFilterChange}
                    >
                      <option value="">Select an answer...</option>
                      {choiceQuestions
                        .find(q => q.index === parseInt(questionFilter.questionIndex))
                        ?.options.map((option, idx) => (
                          <option key={idx} value={option}>
                            {option}
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      className="btn-secondary clear-filter-button"
                      onClick={clearQuestionFilter}
                    >
                      Clear Filter
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
          
          {responses.length === 0 ? (
            <div className="empty-state">
              <p>{searchQuery ? 'No responses found matching your search.' : 'No responses found for this form.'}</p>
            </div>
          ) : (
            <>
            <div className="responses-table">
              <table>
                <thead>
                  <tr>
                    {selectedForm?.respondentFields && selectedForm.respondentFields.length > 0 ? (
                      selectedForm.respondentFields.slice(0, 3).map(field => (
                        <th key={field.fieldName}>{field.label}</th>
                      ))
                    ) : (
                      <>
                        <th>Name</th>
                        <th>Email</th>
                      </>
                    )}
                    <th>Submitted</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {responses.map(response => (
                    <tr 
                      key={response._id}
                      className="clickable-row"
                      onClick={() => {
                        setSelectedResponse(response);
                        setShowResponseModal(true);
                      }}
                    >
                      {selectedForm?.respondentFields && selectedForm.respondentFields.length > 0 ? (
                        selectedForm.respondentFields.slice(0, 3).map(field => (
                          <td key={field.fieldName}>
                            {response.respondentInfo?.[field.fieldName] || 'N/A'}
                          </td>
                        ))
                      ) : (
                        <>
                          <td>{response.respondentInfo?.name || 'N/A'}</td>
                          <td>{response.respondentInfo?.email || 'N/A'}</td>
                        </>
                      )}
                      <td>{new Date(response.submittedAt).toLocaleDateString()}</td>
                      <td>
                        <select
                          value={response.status}
                          onChange={(e) => updateResponseStatus(response._id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="status-select"
                        >
                          <option value="submitted">Submitted</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="archived">Archived</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
              
              {pagination.pages > 1 && (
                <div className="admin-pagination">
                  <button 
                    className="page-button"
                    disabled={currentPage === 1}
                    onClick={() => {
                      const newPage = currentPage - 1;
                      fetchResponses(selectedForm._id, newPage, searchQuery, questionFilter);
                    }}
                  >
                    Previous
                  </button>
                  
                  <div className="page-numbers">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(number => (
                      <button
                        key={number}
                        className={`page-number ${currentPage === number ? 'active' : ''}`}
                        onClick={() => {
                          fetchResponses(selectedForm._id, number, searchQuery, questionFilter);
                        }}
                      >
                        {number}
                      </button>
                    ))}
                  </div>

                  <button 
                    className="page-button"
                    disabled={currentPage === pagination.pages}
                    onClick={() => {
                      const newPage = currentPage + 1;
                      fetchResponses(selectedForm._id, newPage, searchQuery, questionFilter);
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay">
          <div className="admin-modal">
            <div className="modal-header">
              <h2>{editingForm ? 'Edit Form' : 'Create New Form'}</h2>
              <button className="close-btn" onClick={resetForm}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="admin-form-form">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                />
              </div>

              <div className="form-group form-header-image-group">
                <label>Header image (optional)</label>
                <p className="form-header-image-hint">Shows a banner at the top of the form, like Google Forms.</p>
                {formData.headerImage ? (
                  <div className="form-header-image-preview-wrap">
                    <img src={formData.headerImage} alt="Header" className="form-header-image-preview" />
                    <div className="form-header-image-actions">
                      <label className="btn-secondary form-header-image-upload-btn">
                        {headerImageUploading ? 'Uploading…' : 'Change'}
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          disabled={headerImageUploading}
                          onChange={handleHeaderImageChange}
                        />
                      </label>
                      <button type="button" className="btn-secondary" onClick={removeHeaderImage}>
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="form-header-image-upload-area">
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      disabled={headerImageUploading}
                      onChange={handleHeaderImageChange}
                    />
                    <span className="form-header-image-upload-text">
                      {headerImageUploading ? 'Uploading…' : 'Choose an image'}
                    </span>
                  </label>
                )}
              </div>

              <div className="form-group">
                <label>Custom Route * (e.g., "contact-us" for /f/contact-us)</label>
                <input
                  type="text"
                  name="customRoute"
                  value={formData.customRoute}
                  onChange={handleInputChange}
                  required
                  pattern="[a-z0-9-]+"
                  placeholder="contact-us"
                />
                <small>Only lowercase letters, numbers, and hyphens</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Submission Deadline (optional)</label>
                  <input
                    type="date"
                    name="submissionDeadline"
                    value={formData.submissionDeadline || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Max Submissions (optional)</label>
                  <input
                    type="number"
                    name="maxSubmissions"
                    value={formData.maxSubmissions || ''}
                    onChange={handleInputChange}
                    min="1"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group form-checkbox">
                  <input
                    id="isActive"
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="isActive">Activate this form</label>
                </div>

                <div className="form-group form-checkbox">
                  <input
                    id="allowMultipleSubmissions"
                    type="checkbox"
                    name="allowMultipleSubmissions"
                    checked={formData.allowMultipleSubmissions}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="allowMultipleSubmissions">Allow multiple submissions</label>
                </div>
              </div>

              <div className="form-group">
                <label>Success Message</label>
                <textarea
                  name="successMessage"
                  value={formData.successMessage}
                  onChange={handleInputChange}
                  rows={2}
                />
              </div>

              <div className="form-group">
                <label>Closed Message</label>
                <textarea
                  name="closedMessage"
                  value={formData.closedMessage}
                  onChange={handleInputChange}
                  rows={2}
                />
              </div>

              {/* Respondent Fields Section */}
              <div className="respondent-fields-section">
                <h3>Respondent Information Fields</h3>
                <p className="section-description">Define what information to collect from respondents (name, email, phone, etc.)</p>
                
                <div className="respondent-field-builder">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Field Name (internal)</label>
                      <input
                        type="text"
                        value={respondentFieldForm.fieldName}
                        onChange={(e) => setRespondentFieldForm(prev => ({ ...prev, fieldName: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
                        placeholder="email"
                      />
                    </div>
                    <div className="form-group">
                      <label>Label (display)</label>
                      <input
                        type="text"
                        value={respondentFieldForm.label}
                        onChange={handleRespondentFieldChange}
                        name="label"
                        placeholder="Email Address"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Type</label>
                      <select
                        value={respondentFieldForm.type}
                        onChange={handleRespondentFieldChange}
                        name="type"
                      >
                        <option value="text">Text</option>
                        <option value="email">Email</option>
                        <option value="number">Number</option>
                        <option value="tel">Phone</option>
                        <option value="url">URL</option>
                        <option value="date">Date</option>
                      </select>
                    </div>

                    <div className="form-group form-checkbox">
                      <label htmlFor="respondentRequired">
                        <input
                          id="respondentRequired"
                          type="checkbox"
                          name="required"
                          checked={respondentFieldForm.required}
                          onChange={handleRespondentFieldChange}
                        />
                        <span> Required</span>
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Placeholder</label>
                    <input
                      type="text"
                      name="placeholder"
                      value={respondentFieldForm.placeholder}
                      onChange={handleRespondentFieldChange}
                      placeholder="Enter placeholder text"
                    />
                  </div>

                  <div style={{display:'flex', gap:'0.5rem'}}>
                    <button type="button" onClick={addRespondentField} className="add-field">
                      {editingRespondentFieldIndex !== null ? 'Save Field' : 'Add Field'}
                    </button>
                    {editingRespondentFieldIndex !== null && (
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => {
                          setEditingRespondentFieldIndex(null);
                          setRespondentFieldForm({ fieldName: '', label: '', type: 'text', required: false, placeholder: '' });
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                <div className="respondent-fields-list">
                  {formData.respondentFields.map((field, index) => (
                    <div key={index} className="field-item">
                      <div className="field-content">
                        <strong>{field.label}</strong>
                        <span className="field-type">({field.type})</span>
                        <span className="field-name">[{field.fieldName}]</span>
                        {field.required && <span className="required">*</span>}
                      </div>
                      <div style={{display:'flex', gap:'0.5rem'}}>
                        <button
                          type="button"
                          onClick={() => editRespondentField(index)}
                          className="btn-secondary"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => removeRespondentField(index)}
                          className="remove-field"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Questions Section */}
              <div className="questions-section">
                <h3>Custom Questions</h3>
                
                <div className="question-builder">
                  <div className="form-group">
                    <label>Question</label>
                    <input
                      type="text"
                      value={questionForm.question}
                      onChange={(e) => setQuestionForm(prev => ({ ...prev, question: e.target.value }))}
                      placeholder="Enter your question"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Type</label>
                      <select
                        value={questionForm.type}
                        onChange={handleQuestionChange}
                        name="type"
                      >
                        <option value="text">Text Input</option>
                        <option value="textarea">Text Area</option>
                        <option value="email">Email</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                        <option value="dropdown">Dropdown</option>
                        <option value="radio">Radio Buttons</option>
                        <option value="checkbox">Checkboxes</option>
                      </select>
                    </div>

                    <div className="form-group form-checkbox">
                      <label htmlFor="required">
                        <input
                          id="required"
                          type="checkbox"
                          name="required"
                          checked={questionForm.required}
                          onChange={handleQuestionChange}
                        />
                        <span> Required</span>
                      </label>
                    </div>
                  </div>

                  {(questionForm.type === 'dropdown' || questionForm.type === 'radio' || questionForm.type === 'checkbox') && (
                    <div className="form-group">
                      <label>Options</label>
                      <div className="options-pill-row">
                        {questionForm.options.map((option, index) => (
                          <span key={index} className="option-pill">
                            {option || `Option ${index + 1}`}
                            <button type="button" className="pill-remove" onClick={() => removeOption(index)}>×</button>
                          </span>
                        ))}
                        <input
                          className="pill-input"
                          type="text"
                          placeholder="Type option and press Enter"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const val = e.currentTarget.value.trim();
                              if (val) {
                                setQuestionForm(prev => ({ ...prev, options: [...prev.options, val] }));
                                e.currentTarget.value = '';
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <label>Placeholder</label>
                    <input
                      type="text"
                      name="placeholder"
                      value={questionForm.placeholder}
                      onChange={handleQuestionChange}
                      placeholder="Enter placeholder text"
                    />
                  </div>

                  <div style={{display:'flex', gap:'0.5rem'}}>
                    <button type="button" onClick={addQuestion} className="add-question">
                      {editingQuestionIndexLocal !== null ? 'Save Question' : 'Add Question'}
                    </button>
                    {editingQuestionIndexLocal !== null && (
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => {
                          setEditingQuestionIndexLocal(null);
                          setQuestionForm({ question: '', type: 'text', options: [], required: false, placeholder: '', showIf: null });
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                <div className="questions-list">
                  {formData.customQuestions.map((question, index) => (
                    <div key={index} className="question-item">
                      <div className="question-content">
                        <strong>{question.question}</strong>
                        <span className="question-type">({question.type})</span>
                        {question.required && <span className="required">*</span>}
                      </div>
                      <div style={{display:'flex', gap:'0.5rem'}}>
                        <button
                          type="button"
                          onClick={() => editQuestion(index)}
                          className="btn-secondary"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => removeQuestion(index)}
                          className="remove-question"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingForm ? 'Update Form' : 'Create Form'}
                </button>
                <button type="button" onClick={resetForm} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showResponseModal && selectedResponse && (
        <div className="modal-overlay" onClick={() => setShowResponseModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Response Details</h2>
              <button className="close-btn" onClick={() => setShowResponseModal(false)}>×</button>
            </div>
            <div className="response-details">
              <div className="respondent-info">
                <h3>Respondent Information</h3>
                {selectedForm?.respondentFields && selectedForm.respondentFields.length > 0 ? (
                  <div className="respondent-fields-display">
                    {selectedForm.respondentFields.map(field => (
                      <div key={field.fieldName} className="respondent-field-item">
                        <strong>{field.label}:</strong> {selectedResponse.respondentInfo?.[field.fieldName] || 'N/A'}
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <p><strong>Name:</strong> {selectedResponse.respondentInfo?.name || 'N/A'}</p>
                    <p><strong>Email:</strong> {selectedResponse.respondentInfo?.email || 'N/A'}</p>
                  </>
                )}
                <p><strong>Submitted:</strong> {new Date(selectedResponse.submittedAt).toLocaleString()}</p>
                <p><strong>Status:</strong> {selectedResponse.status}</p>
              </div>

              {selectedResponse.answers && selectedResponse.answers.length > 0 && (
                <div className="answers-section">
                  <h4>Answers</h4>
                  <div className="answers-list">
                    {selectedResponse.answers
                      .filter(answer => answer.answer && answer.answer !== '' && 
                        (!Array.isArray(answer.answer) || answer.answer.length > 0))
                      .map((answer, idx) => (
                      <div key={idx} className="answer-item">
                        <div className="answer-question">{answer.question}</div>
                        <div className="answer-response">
                          {Array.isArray(answer.answer) ? 
                            answer.answer.join(', ') : 
                            String(answer.answer)
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowResponseModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminForms;
