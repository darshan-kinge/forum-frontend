import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import './AdminRecruitment.css';
import api from '../../../utils/api';
import Loader from '../../../components/loader/Loader';

const AdminRecruitment = () => {
  const { AuthorizationToken } = useAuth();
  const [recruitments, setRecruitments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recruitments');
  const [showForm, setShowForm] = useState(false);
  const [editingRecruitment, setEditingRecruitment] = useState(null);
  const [selectedRecruitment, setSelectedRecruitment] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [applicationsPerPage] = useState(10);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isActive: false,
    applicationDeadline: '',
    maxApplications: 100,
    customQuestions: [],
    successMessage: 'Thank you for your application! We will get back to you soon.',
    closedMessage: 'Recruitment is currently closed. Please check back later.',
    whatsappGroupUrl: ''
  });

  const [questionForm, setQuestionForm] = useState({
    question: '',
    type: 'text',
    options: [],
    required: false,
    placeholder: '',
    showIf: null
  });
  const [editingQuestionIndexLocal, setEditingQuestionIndexLocal] = useState(null);

  useEffect(() => {
    fetchRecruitments();
  }, []);

  const fetchRecruitments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/recruitment/admin/all');
      setRecruitments(response.data.data);
    } catch (error) {
      console.error('Error fetching recruitments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async (recruitmentId, page = 1) => {
    try {
      const response = await api.get(`/recruitment/admin/applications/${recruitmentId}`, {
        params: {
          page,
          limit: applicationsPerPage
        }
      });
      setApplications(response.data.data.applications);
      setPagination(response.data.data.pagination || {
        current: page,
        pages: 1,
        total: response.data.data.applications.length
      });
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleQuestionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQuestionForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addQuestion = () => {
    if (!questionForm.question.trim()) return;

    const newQuestion = {
      ...questionForm
    };
    
    if (editingQuestionIndexLocal !== null) {
      // Update existing question
      setFormData(prev => ({
        ...prev,
        customQuestions: prev.customQuestions.map((q, i) => i === editingQuestionIndexLocal ? newQuestion : q)
      }));
      setEditingQuestionIndexLocal(null);
    } else {
      // Add new question
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
      const url = editingRecruitment 
        ? `/recruitment/admin/update/${editingRecruitment._id}`
        : '/recruitment/admin/create';

      // Clean the form data to remove any _id fields from custom questions
      const cleanedFormData = {
        ...formData,
        customQuestions: formData.customQuestions.map(q => {
          const { _id, ...cleanQuestion } = q;
          return cleanQuestion;
        })
      };

      const response = editingRecruitment 
        ? await api.put(url, cleanedFormData)
        : await api.post(url, cleanedFormData);
      
      if (response.data.success) {
        alert(editingRecruitment ? 'Recruitment updated successfully' : 'Recruitment created successfully');
        fetchRecruitments();
        resetForm();
      }
    } catch (error) {
      console.error('Error saving recruitment:', error);
      alert('Error saving recruitment');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      isActive: false,
      applicationDeadline: '',
      maxApplications: 100,
      customQuestions: [],
      successMessage: 'Thank you for your application! We will get back to you soon.',
      closedMessage: 'Recruitment is currently closed. Please check back later.',
      whatsappGroupUrl: ''
    });
    setEditingRecruitment(null);
    setShowForm(false);
  };

  const editRecruitment = (recruitment) => {
    setFormData({
      ...recruitment,
      applicationDeadline: recruitment.applicationDeadline ? 
        new Date(recruitment.applicationDeadline).toISOString().split('T')[0] : ''
    });
    setEditingRecruitment(recruitment);
    setShowForm(true);
  };

  const deleteRecruitment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this recruitment?')) return;

    try {
      await api.delete(`/recruitment/admin/delete/${id}`);
      alert('Recruitment deleted successfully');
      fetchRecruitments();
    } catch (error) {
      console.error('Error deleting recruitment:', error);
      alert('Error deleting recruitment');
    }
  };

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      await api.put(`/recruitment/admin/application/${applicationId}/status`, { status });
      alert('Application status updated successfully');
      if (selectedRecruitment) {
        fetchApplications(selectedRecruitment._id, currentPage);
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      alert('Error updating application status');
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="admin-recruitment">
      <div className="admin-header-recruitment">
        <h1>Recruitment Management</h1>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          Create New Recruitment
        </button>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'recruitments' ? 'active' : ''}`}
          onClick={() => setActiveTab('recruitments')}
        >
          Recruitments
        </button>
        <button 
          className={`tab ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          Applications
        </button>
      </div>

      {activeTab === 'recruitments' && (
        <div className="recruitments-section">
          {recruitments.length === 0 ? (
            <div className="empty-state">
              <p>No recruitments found. Create your first recruitment!</p>
            </div>
          ) : (
            <div className="recruitments-grid">
              {recruitments.map(recruitment => (
                <div key={recruitment._id} className="recruitment-card">
                  <div className="recruitment-header">
                    <h3>{recruitment.title}</h3>
                    <div className={`status ${recruitment.isActive ? 'active' : 'inactive'}`}>
                      {recruitment.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  <p className="description-recruitment">{recruitment.description.slice(0, 100)}...</p>
                  <div className="recruitment-stats">
                    <p>Applications: {recruitment.currentApplications}/{recruitment.maxApplications}</p>
                    <p>Deadline: {new Date(recruitment.applicationDeadline).toLocaleDateString()}</p>
                    <p>Questions: {recruitment.customQuestions.length}</p>
                  </div>
                  <div className="recruitment-actions">
                    <button 
                      className="btn-secondary"
                      onClick={() => editRecruitment(recruitment)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-secondary"
                      onClick={() => {
                        setSelectedRecruitment(recruitment);
                        setCurrentPage(1);
                        fetchApplications(recruitment._id, 1);
                        setActiveTab('applications');
                      }}
                    >
                      View Applications
                    </button>
                    <button 
                      className="btn-danger"
                      onClick={() => deleteRecruitment(recruitment._id)}
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

      {activeTab === 'applications' && (
        <div className="applications-section">
          {selectedRecruitment && (
            <div className="selected-recruitment">
              <h3>Applications for: {selectedRecruitment.title}</h3>
            </div>
          )}
          
          {applications.length === 0 ? (
            <div className="empty-state">
              <p>No applications found for this recruitment.</p>
            </div>
          ) : (
            <>
              <div className="applications-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map(application => (
                      <tr 
                        key={application._id}
                        className="clickable-row"
                        onClick={() => {
                          setSelectedApplication(application);
                          setShowApplicationModal(true);
                        }}
                      >
                        <td>{application.applicantInfo?.name}</td>
                        <td>{application.applicantInfo?.email}</td>
                        <td>{new Date(application.submittedAt).toLocaleDateString()}</td>
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
                      fetchApplications(selectedRecruitment._id, newPage);
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
                          fetchApplications(selectedRecruitment._id, number);
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
                      fetchApplications(selectedRecruitment._id, newPage);
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
              <h2>{editingRecruitment ? 'Edit Recruitment' : 'Create New Recruitment'}</h2>
              <button className="close-btn" onClick={resetForm}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="admin-recruitment-form">
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

              <div className="form-row">
                <div className="form-group">
                  <label>Application Deadline *</label>
                  <input
                    type="date"
                    name="applicationDeadline"
                    value={formData.applicationDeadline}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Max Applications</label>
                  <input
                    type="number"
                    name="maxApplications"
                    value={formData.maxApplications}
                    onChange={handleInputChange}
                    min="1"
                  />
                </div>
              </div>

              <div className="form-group form-checkbox">
                <input
                  id="isActive"
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                />
                <label htmlFor="isActive">Activate this recruitment</label>
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

              <div className="form-group">
                <label>WhatsApp Group Invite URL (optional)</label>
                <input
                  type="url"
                  name="whatsappGroupUrl"
                  value={formData.whatsappGroupUrl}
                  onChange={handleInputChange}
                  placeholder="https://chat.whatsapp.com/XXXXXX"
                />
              </div>

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

                  {/* Conditional visibility configuration */}
                  <div className="form-group">
                    <label>Visibility (optional)</label>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Parent Question</label>
                        <select
                          value={questionForm.showIf?.questionIndex ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setQuestionForm(prev => ({
                              ...prev,
                              showIf: val === '' ? null : { questionIndex: Number(val), operator: 'equals', value: '' }
                            }));
                          }}
                        >
                          <option value="">None</option>
                          {formData.customQuestions.map((q, idx) => (
                            (q.type === 'dropdown' || q.type === 'radio') && (
                              <option key={idx} value={idx}>{idx + 1}. {q.question}</option>
                            )
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Operator</label>
                        <select
                          value={questionForm.showIf?.operator ?? 'equals'}
                          onChange={(e) => setQuestionForm(prev => prev.showIf ? ({ ...prev, showIf: { ...prev.showIf, operator: e.target.value } }) : prev)}
                          disabled={!questionForm.showIf}
                        >
                          <option value="equals">Equals</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Value</label>
                        <select
                          value={questionForm.showIf?.value ?? ''}
                          onChange={(e) => setQuestionForm(prev => prev.showIf ? ({ ...prev, showIf: { ...prev.showIf, value: e.target.value } }) : prev)}
                          disabled={!(questionForm.showIf && (formData.customQuestions[questionForm.showIf.questionIndex]?.options?.length))}
                        >
                          <option value="">Select value</option>
                          {questionForm.showIf && formData.customQuestions[questionForm.showIf.questionIndex]?.options?.map((opt, i) => (
                            <option key={i} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
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
                        {question.showIf && (
                          <span className="visibility-chip" title="Visibility rule">
                            Visible when Q{(question.showIf.questionIndex ?? 0) + 1} equals "{question.showIf.value}"
                          </span>
                        )}
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
                  {editingRecruitment ? 'Update Recruitment' : 'Create Recruitment'}
                </button>
                <button type="button" onClick={resetForm} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showApplicationModal && selectedApplication && (
        <div className="modal-overlay" onClick={() => setShowApplicationModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Application</h2>
              <button className="close-btn" onClick={() => setShowApplicationModal(false)}>×</button>
            </div>
            <div className="application-details">
              <div className="applicant-info">
                <h3>{selectedApplication.applicantInfo?.name}</h3>
                <p>{selectedApplication.applicantInfo?.email}</p>
                <div className="applicant-meta">
                  <span>Course: {selectedApplication.applicantInfo?.course || 'Not specified'}</span>
                  <span>Year: {selectedApplication.applicantInfo?.year || 'Not specified'}</span>
                  <span>PRN: {selectedApplication.applicantInfo?.prn || 'Not specified'}</span>
                  <span>Gender: {selectedApplication.applicantInfo?.gender || 'Not specified'}</span>
                  <span>Submitted: {new Date(selectedApplication.submittedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {selectedApplication.answers && selectedApplication.answers.length > 0 && (
                <div className="answers-section">
                  <h4>Responses</h4>
                  <div className="answers-list">
                    {selectedApplication.answers
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
            <div className="modal-footer"><button className="btn-secondary" onClick={() => setShowApplicationModal(false)}>Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRecruitment;
