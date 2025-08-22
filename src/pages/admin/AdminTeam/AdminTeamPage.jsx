// src/components/Admin/AdminPage.js
import React, { useState, useEffect } from 'react';
import AdminTable from './AdminTable/AdminTable.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import './AdminStyle.css';
import api from '../../../utils/api.js';

const AdminPage = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    linkedin: '',
    role: '',
    designation: '',
    photo: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { AuthorizationToken } = useAuth();
  
  const fetchMembers = async () => {
      try {
          setLoading(true);
          const response = await api.get('/team/all');
          const data = await response.data;
          setMembers(data);
          setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error('Error fetching members:', error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
      fetchMembers();
    }, []);

    const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, photo: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.designation.trim()) {
      alert('Designation is required');
      return;
    }

    if (formData.photo && formData.photo.size > 5 * 1024 * 1024) {
      alert('File size too large. Maximum size is 5MB');
      return;
    }

    setIsSubmitting(true);

    const data = new FormData();
    
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('linkedin', formData.linkedin);
    data.append('role', formData.role);
    data.append('designation', formData.designation);
    if (formData.photo) {
      data.append('photo', formData.photo);
    }

    try {
      const url = editingId 
        ? `/team/update/${editingId}`
        : `/team/add`;

      const response = await api.post(url, data);

      const result = await response.data;
      
      if (response.status === 200) {
        alert(editingId ? 'Member updated successfully' : 'Member added successfully');
        await fetchMembers();
        resetForm();
      } else {
        throw new Error(result.message || 'Failed to process request');
      }

    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      linkedin: '',
      role: '',
      designation: '',
      photo: null
    });
    setEditingId(null);
  };

  return (
    <div className="admin-page">
      <h2 className="admin-page__title">
        {editingId ? 'Edit Team Member' : 'Add New Team Member'}
      </h2>
      
      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Name"
            required
          />
        </div>

        <div className="form-group">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Email"
            required
          />
        </div>

        <div className="form-group">
          <input
            type="url"
            name="linkedin"
            value={formData.linkedin}
            onChange={handleInputChange}
            placeholder="LinkedIn URL"
            required
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            name="designation"
            value={formData.designation}
            onChange={handleInputChange}
            placeholder="Designation (e.g., Technical Lead, Marketing Lead)"
            required
          />
        </div>

        <div className="form-group">
          <select
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Role</option>
            <option value="Faculty Advisor">Faculty Advisor</option>
            <option value="Post Holder">Post Holder</option>
            <option value="Team Lead">Team Lead</option>
            <option value="Member">Member</option>
          </select>
        </div>

        <div className="form-group">
          <input
            type="file"
            name="photo"
            onChange={handleFileChange}
            accept="image/*"
            required={!editingId}
          />
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className={`btn btn-primary ${isSubmitting ? 'load' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="button-content">
                <span className="btn-loader"></span>
                {editingId ? 'Updating...' : 'Adding...'}
              </span>
            ) : (
              editingId ? 'Update Member' : 'Add Member'
            )}
          </button>
          {editingId && (
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={resetForm}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <AdminTable 
        members={members} 
        loading={loading}
        onEdit={(member) => {
          setEditingId(member._id);
          setFormData({
            name: member.name,
            email: member.email,
            linkedin: member.linkedin,
            role: member.role,
            designation: member.designation,
            photo: null
          });
        }}
        onRefresh={fetchMembers}
      />
    </div>
  );
};

export default AdminPage;