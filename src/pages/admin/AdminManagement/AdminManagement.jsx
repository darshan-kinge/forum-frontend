import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import './AdminManagement.css';
import api from '../../../utils/api';
import Loader from '../../../components/loader/Loader';

const AdminManagement = () => {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [availablePages, setAvailablePages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);

  // Check if user is a super admin (has no permissions or empty permissions = full access)
  const isSuperAdmin = user?.isAdmin && (!user?.permissions || Object.keys(user.permissions).length === 0);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    permissions: {},
    sendEmail: true
  });
  const [generatedPassword, setGeneratedPassword] = useState('');

  useEffect(() => {
    fetchAdmins();
    fetchAvailablePages();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin');
      setAdmins(response.data.data);
    } catch (error) {
      console.error('Error fetching admins:', error);
      alert('Error fetching admins');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailablePages = async () => {
    try {
      const response = await api.get('/admin/pages');
      setAvailablePages(response.data.data);
    } catch (error) {
      console.error('Error fetching available pages:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const generatePassword = () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setGeneratedPassword(password);
    setFormData(prev => ({ ...prev, password: '' })); // Clear manual password when generating
  };

  const handlePermissionChange = (pageId, checked) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [pageId]: {
          view: checked
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password for new admins
    if (!editingAdmin && !formData.password && !generatedPassword) {
      alert('Please enter a password or generate one');
      return;
    }

    try {
      if (editingAdmin) {
        // Update permissions only
        await api.put(`/admin/${editingAdmin._id}/permissions`, {
          permissions: formData.permissions
        });
        alert('Admin permissions updated successfully');
      } else {
        // Create new admin - use generated password if available
        const submitData = {
          ...formData,
          password: generatedPassword || formData.password
        };
        const response = await api.post('/admin/create', submitData);
        const message = response.data.generatedPassword 
          ? `Admin created successfully!\n\nGenerated Password: ${response.data.generatedPassword}\n\nPlease save this password. It has been sent to the admin's email.`
          : 'Admin created successfully! Credentials have been sent to the admin\'s email.';
        alert(message);
        setGeneratedPassword('');
      }
      fetchAdmins();
      resetForm();
    } catch (error) {
      console.error('Error saving admin:', error);
      alert(error.response?.data?.message || 'Error saving admin');
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      permissions: {},
      sendEmail: true
    });
    setGeneratedPassword('');
    setEditingAdmin(null);
    setShowForm(false);
  };

  const editAdmin = (admin) => {
    setFormData({
      first_name: admin.first_name,
      last_name: admin.last_name,
      email: admin.email,
      password: '',
      permissions: admin.permissions || {}
    });
    setEditingAdmin(admin);
    setShowForm(true);
  };

  const deleteAdmin = async (adminId) => {
    if (!window.confirm('Are you sure you want to delete this admin?')) return;

    try {
      await api.delete(`/admin/${adminId}`);
      alert('Admin deleted successfully');
      fetchAdmins();
    } catch (error) {
      console.error('Error deleting admin:', error);
      alert(error.response?.data?.message || 'Error deleting admin');
    }
  };

  const updatePassword = async (adminId) => {
    const newPassword = prompt('Enter new password (minimum 6 characters):');
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    try {
      await api.put(`/admin/${adminId}/password`, { password: newPassword });
      alert('Password updated successfully');
    } catch (error) {
      console.error('Error updating password:', error);
      alert(error.response?.data?.message || 'Error updating password');
    }
  };

  if (loading) {
    return <Loader />;
  }

  // Only super admins can access this page
  if (!isSuperAdmin) {
    return (
      <div className="admin-management">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You don't have permission to access the Admin Management page. Only super admins can manage other admins.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-management">
      <div className="admin-header-management">
        <h1>Admin Management</h1>
        <button 
          className="btn-primary"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          Add New Admin
        </button>
      </div>

      <div className="admins-table-container">
        <table className="admins-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Permissions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map(admin => (
              <tr key={admin._id}>
                <td>{admin.first_name} {admin.last_name}</td>
                <td>{admin.email}</td>
                <td>
                  <div className="permissions-preview">
                    {Object.keys(admin.permissions || {}).length > 0 ? (
                      Object.entries(admin.permissions).map(([page, perms]) => (
                        <span key={page} className="permission-badge">
                          {page}: {perms.view ? 'View' : ''}
                        </span>
                      ))
                    ) : (
                      <span className="full-access">Full Access</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="admin-actions">
                    <button 
                      className="btn-secondary"
                      onClick={() => editAdmin(admin)}
                    >
                      Edit Permissions
                    </button>
                    <button 
                      className="btn-secondary"
                      onClick={() => updatePassword(admin._id)}
                    >
                      Change Password
                    </button>
                    {admin._id !== user?._id && (
                      <button 
                        className="btn-danger"
                        onClick={() => deleteAdmin(admin._id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingAdmin ? 'Edit Admin Permissions' : 'Create New Admin'}</h2>
              <button className="close-btn" onClick={resetForm}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="admin-form">
              {!editingAdmin && (
                <>
                  <div className="form-group">
                    <label>First Name *</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Last Name *</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Password *</label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type={generatedPassword ? "text" : "password"}
                        name="password"
                        value={generatedPassword || formData.password}
                        onChange={(e) => {
                          if (!generatedPassword) {
                            handleInputChange(e);
                          }
                        }}
                        required={!generatedPassword}
                        minLength={6}
                        placeholder={generatedPassword ? "Generated password shown" : "Minimum 6 characters or click Generate"}
                        style={{ flex: 1 }}
                        readOnly={!!generatedPassword}
                      />
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={generatePassword}
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        Generate
                      </button>
                    </div>
                    {generatedPassword && (
                      <p style={{ marginTop: '0.5rem', color: '#28a745', fontSize: '0.9rem' }}>
                        ✓ Password generated: {generatedPassword}
                      </p>
                    )}
                  </div>

                  <div className="form-group form-checkbox">
                    <label htmlFor="sendEmail">
                      <input
                        id="sendEmail"
                        type="checkbox"
                        name="sendEmail"
                        checked={formData.sendEmail}
                        onChange={handleInputChange}
                      />
                      <span>Send credentials via email</span>
                    </label>
                  </div>
                </>
              )}

              <div className="permissions-section">
                <h3>Page Permissions</h3>
                <p className="permissions-note">
                  {editingAdmin 
                    ? 'Select which pages this admin can view. Leave all unchecked for full access.'
                    : 'Select which pages this admin can view. Leave all unchecked for full access.'}
                </p>
                
                <div className="permissions-grid">
                  {availablePages.map(page => (
                    <div key={page.id} className="permission-item">
                      <div className="permission-header">
                        <strong>{page.name}</strong>
                        <span className="permission-description">{page.description}</span>
                      </div>
                      <div className="permission-options">
                        <label className="permission-checkbox">
                          <input
                            type="checkbox"
                            checked={formData.permissions[page.id]?.view || false}
                            onChange={(e) => handlePermissionChange(page.id, e.target.checked)}
                          />
                          <span>View</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingAdmin ? 'Update Permissions' : 'Create Admin'}
                </button>
                <button type="button" onClick={resetForm} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;

