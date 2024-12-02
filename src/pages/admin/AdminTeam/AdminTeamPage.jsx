// src/components/Admin/AdminPage.js
import React, { useState, useEffect } from 'react';
import AdminTable from './AdminTable/AdminTable.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import './AdminStyle.css';
import config from '../../../config/config.js';

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

  const { AuthorizationToken } = useAuth();
  
  const fetchMembers = async () => {
      try {
          const response = await fetch(`${config.serverUrl}/api/${config.apiVersion}/team/all`);
          const data = await response.json();
          setMembers(data);
        } catch (error) {
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
        ? `${config.serverUrl}/api/${config.apiVersion}/team/update/${editingId}`
        : `${config.serverUrl}/api/${config.apiVersion}/team/add`;

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Authorization': AuthorizationToken,
        },
        body: data
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process request');
      }

      const result = await response.json();
      alert(editingId ? 'Member updated successfully' : 'Member added successfully');
      await fetchMembers();
      resetForm();
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
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
          <button type="submit" className="btn btn-primary">
            {editingId ? 'Update Member' : 'Add Member'}
          </button>
          {editingId && (
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={resetForm}
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