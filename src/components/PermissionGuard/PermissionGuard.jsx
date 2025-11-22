import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { canView } from '../../utils/permissions';
import './PermissionGuard.css';

const PermissionGuard = ({ pageName, children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="permission-loading">Loading...</div>;
  }

  if (!canView(user, pageName)) {
    return (
      <div className="permission-denied">
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
        <Navigate to="/admin/dashboard" replace />
      </div>
    );
  }

  return <>{children}</>;
};

export default PermissionGuard;

