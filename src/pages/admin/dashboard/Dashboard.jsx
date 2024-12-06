import React from 'react';
import { Link } from 'react-router-dom';
import { FaBlog, FaImages, FaUsers, FaCalendarAlt } from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const dashboardItems = [
    {
      title: 'Blogs',
      icon: <FaBlog />,
      link: '/admin/blog',
      description: 'Manage blog posts and articles'
    },
    {
      title: 'Gallery',
      icon: <FaImages />,
      link: '/admin/gallery',
      description: 'Manage image gallery'
    },
    {
      title: 'Team',
      icon: <FaUsers />,
      link: '/admin/team',
      description: 'Manage team members'
    },
    {
      title: 'Events',
      icon: <FaCalendarAlt />,
      link: '/admin/events',
      description: 'Manage upcoming and past events'
    }
  ];

  return (
    <div className="dashboard">
      <h1 className="dashboard__title">Admin Dashboard</h1>
      <div className="dashboard__grid">
        {dashboardItems.map((item, index) => (
          <Link to={item.link} key={index} className="dashboard__card">
            <div className="dashboard__card-icon">
              {item.icon}
            </div>
            <h2 className="dashboard__card-title">{item.title}</h2>
            <p className="dashboard__card-description">{item.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard; 