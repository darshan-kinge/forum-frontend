import React from 'react';
import { Outlet } from 'react-router-dom';

const AdminBlog = () => {
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