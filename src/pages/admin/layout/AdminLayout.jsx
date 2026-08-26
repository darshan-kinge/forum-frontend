import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { FaUser, FaThList, FaHome, FaCalendar, FaUsers, FaUserShield, FaKey } from "react-icons/fa";
import { RiMessage2Fill } from "react-icons/ri";
import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import Loader from '../../../components/loader/Loader.jsx';
import { hasAccess } from '../../../utils/permissions';
import api from '../../../utils/api';
import './AdminLayout.css';
import HelmetComponent from '../../../components/helmet/HelmetComponent.jsx';

const AdminLayout = () => {
    const { isAuthenticated, isLoading, LogoutUser, user } = useAuth();
    const navigate = useNavigate();
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);

    if (isLoading) {
        return <Loader />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    // Check if user is super admin (no permissions = full access)
    const isSuperAdmin = user?.isAdmin && (!user?.permissions || Object.keys(user.permissions).length === 0);

    const allNavItems = [
        { to: '/admin/members', icon: <FaUser />, label: 'Members', pageName: 'members' },
        { to: '/admin/gallery', icon: <RiMessage2Fill />, label: 'Gallery', pageName: 'gallery' },
        { to: '/admin/blog', icon: <FaThList />, label: 'Blogs', pageName: 'blog' },
        { to: '/admin/team', icon: <FaUsers />, label: 'Teams', pageName: 'team' },
        { to: '/admin/events', icon: <FaCalendar />, label: 'Events', pageName: 'events' },
        { to: '/admin/recruitment', icon: <FaUser />, label: 'Recruitment', pageName: 'recruitment' },
        { to: '/admin/admins', icon: <FaUserShield />, label: 'Admins', pageName: 'admins', superAdminOnly: true },
        // { to: '/', icon: <FaHome />, label: 'Home' }
    ];

    // Filter nav items based on permissions
    const navItems = allNavItems.filter(item => {
        if (item.superAdminOnly) {
            return isSuperAdmin;
        }
        if (item.pageName) {
            return hasAccess(user, item.pageName);
        }
        return true; // Home is always accessible
    });

    const logout = () => {
        LogoutUser();
        navigate('/admin/login');
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
        setPasswordError('');
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordError('');

        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setPasswordError('All fields are required');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordError('New password must be at least 6 characters long');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        try {
            setPasswordLoading(true);
            await api.put('/admin/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            alert('Password changed successfully!');
            setShowPasswordModal(false);
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            setPasswordError(error.response?.data?.message || 'Error changing password');
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="admin-layout">

            <HelmetComponent 
                pageName="Dashboard"
                description="Admin Dashboard for MIT-WPU Science and Spirituality Forum"
                keywords="MIT-WPU, Science and Spirituality Forum, SNSF, Science, Spirituality, Forum, MIT, WPU, Vishwanath Karad, Rahul Karad"
            />

            <header className="admin-header">
                <nav className="admin-nav desktop-nav">
                    <ul>
                        {navItems.map((item) => (
                            <li key={item.to}>
                                <NavLink 
                                    className="admin-nav-items" 
                                    to={item.to}
                                >
                                    {item.icon} <span>{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                    <div className="admin-logout">
                      <button 
                        onClick={() => setShowPasswordModal(true)}
                        style={{ marginRight: '1rem', background: '#667eea' }}
                      >
                        <FaKey /> Change Password
                      </button>
                      <button onClick={logout}>Logout</button>
                    </div>
                </nav>
            </header>

            <main className="admin-content">
                <Outlet />
            </main>

            {showPasswordModal && (
                <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
                    <div className="password-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Change Password</h2>
                            <button className="close-btn" onClick={() => setShowPasswordModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleChangePassword}>
                            <div className="form-group">
                                <label>Current Password *</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>New Password *</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div className="form-group">
                                <label>Confirm New Password *</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    minLength={6}
                                />
                            </div>
                            {passwordError && (
                                <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>
                                    {passwordError}
                                </div>
                            )}
                            <div className="form-actions">
                                <button type="submit" className="btn-primary" disabled={passwordLoading}>
                                    {passwordLoading ? 'Changing...' : 'Change Password'}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setShowPasswordModal(false);
                                        setPasswordData({
                                            currentPassword: '',
                                            newPassword: '',
                                            confirmPassword: ''
                                        });
                                        setPasswordError('');
                                    }} 
                                    className="btn-secondary"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <nav className="mobile-nav">
                <ul>
                    {navItems.map((item) => (
                        <li key={item.to}>
                            <NavLink 
                                className="mobile-nav-item" 
                                to={item.to}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
                <div className="mobile-nav-actions">
                  <button 
                    className="mobile-change-password-btn"
                    onClick={() => setShowPasswordModal(true)}
                  >
                    <FaKey />
                    <span>Change Password</span>
                  </button>
                  <button className="mobile-logout-btn" onClick={logout}>
                    Logout
                  </button>
                </div>
            </nav>
        </div>
    );
};

export default AdminLayout;