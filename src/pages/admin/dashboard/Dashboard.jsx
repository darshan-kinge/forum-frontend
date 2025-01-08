import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBlog, FaImages, FaUsers, FaCalendarAlt, FaUserFriends } from 'react-icons/fa';
import './Dashboard.css';
import config from '../../../config/config';

const Dashboard = () => {
  const [memberStats, setMemberStats] = useState({ totalMembers: 0 });

  useEffect(() => {
    const fetchMemberStats = async () => {
      try {
        const response = await fetch(`${config.serverUrl}/api/${config.apiVersion}/members/stats`); // Adjust the URL based on your API structure
        const data = await response.json();
        setMemberStats(data);
      } catch (error) {
        console.error('Error fetching member stats:', error);
      }
    };

    fetchMemberStats();
  }, []);

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
      title: 'Members',
      icon: <FaUserFriends />,
      link: '/admin/members',
      description: 'Manage members'
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
      <p className="dashboard__member-stats">Total Members Registered: {memberStats.totalMembers}</p>
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