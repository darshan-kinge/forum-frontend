import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { canView } from '../../../utils/permissions';

const AdminBlog = () => {
  const { user, isLoading } = useAuth();

  // Check permissions
  if (!isLoading && !canView(user, 'blog')) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>You don't have permission to access the Blog page.</p>
        <Navigate to="/admin/dashboard" replace />
      </div>
    );
  }

  return (
    <div>
      <h1 
        style={{
          display: "flex", 
          justifyContent: 'center', 
          color: 'white',
          backgroundColor: '#0f7dc785',
          padding: '0.4rem 1rem',
          borderRadius: '10px',
          margin: '1rem'
        }}>Admin Blog</h1>
      
      <Outlet />
    </div>
  );
};

export default AdminBlog;