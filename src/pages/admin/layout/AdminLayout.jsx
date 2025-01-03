import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { FaUser, FaThList, FaHome, FaCalendar, FaUsers } from "react-icons/fa";
import { RiMessage2Fill } from "react-icons/ri";
import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import Loader from '../../../components/loader/Loader.jsx';
import './AdminLayout.css';
import HelmetComponent from '../../../components/helmet/HelmetComponent.jsx';

const AdminLayout = () => {
    const { isAuthenticated, isLoading, LogoutUser } = useAuth();
    const navigate = useNavigate();

    if (isLoading) {
        return <Loader />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/" />;
    }

    const navItems = [
        { to: '/admin/members', icon: <FaUser />, label: 'Members' },
        { to: '/admin/gallery', icon: <RiMessage2Fill />, label: 'Gallery' },
        { to: '/admin/blog', icon: <FaThList />, label: 'Blogs' },
        { to: '/admin/team', icon: <FaUsers />, label: 'Teams' },
        { to: '/admin/events', icon: <FaCalendar />, label: 'Events' },
        { to: '/', icon: <FaHome />, label: 'Home' }
    ];

    const logout = () => {
        LogoutUser();
        navigate('/admin/login');
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
                      <button onClick={logout}>Logout</button>
                    </div>
                </nav>
            </header>

            <main className="admin-content">
                <Outlet />
            </main>

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
                <div className="admin-logout">
                  <button onClick={logout}>Logout</button>
                </div>
            </nav>
        </div>
    );
};

export default AdminLayout;