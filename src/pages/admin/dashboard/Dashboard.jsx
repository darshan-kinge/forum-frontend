import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBlog, FaImages, FaUsers, FaCalendarAlt, FaUserFriends, FaUserPlus, FaFileAlt } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import { hasAccess } from '../../../utils/permissions';
import './Dashboard.css';
import api from '../../../utils/api.js';

const Dashboard = () => {
  const { user } = useAuth();
  const [memberStats, setMemberStats] = useState({ totalMembers: 0 });

  useEffect(() => {
    const fetchMemberStats = async () => {
      try {
        const response = await api.get('/member/stats');
        const data = await response.data;
        setMemberStats(data);
      } catch (error) {
        console.error('Error fetching member stats:', error);
      }
    };

    fetchMemberStats();
  }, []);

  const allDashboardItems = [
    {
      title: 'Blogs',
      icon: <FaBlog />,
      link: '/admin/blog',
      description: 'Manage blog posts and articles',
      pageName: 'blog'
    },
    {
      title: 'Gallery',
      icon: <FaImages />,
      link: '/admin/gallery',
      description: 'Manage image gallery',
      pageName: 'gallery'
    },
    {
      title: 'Members',
      icon: <FaUserFriends />,
      link: '/admin/members',
      description: 'Manage members',
      pageName: 'members'
    },
    {
      title: 'Team',
      icon: <FaUsers />,
      link: '/admin/team',
      description: 'Manage team members',
      pageName: 'team'
    },
    {
      title: 'Events',
      icon: <FaCalendarAlt />,
      link: '/admin/events',
      description: 'Manage upcoming and past events',
      pageName: 'events'
    },
    {
      title: 'Recruitment',
      icon: <FaUserPlus />,
      link: '/admin/recruitment',
      description: 'Manage recruitment forms and applications',
      pageName: 'recruitment'
    },
    {
      title: 'Forms',
      icon: <FaFileAlt />,
      link: '/admin/forms',
      description: 'Create and manage custom forms',
      pageName: 'forms'
    }
  ];

  // Filter dashboard items based on permissions
  const dashboardItems = allDashboardItems.filter(item => hasAccess(user, item.pageName));

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