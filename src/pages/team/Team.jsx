// src/components/Team/TeamPage.js
import React, { useState, useEffect } from 'react';
import TeamCard from '../../components/cards/team-cards/TeamCards.jsx';
import Loader from '../../components/loader/Loader.jsx';
import './Team.css';
import config from '../../config/config.js';
const TeamPage = () => {

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getMembers = async () => {
      try {
        const response = await fetch(`${config.serverUrl}/api/${config.apiVersion}/team/all`);
        const data = await response.json();
        setMembers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getMembers();
  }, []);

  if (loading) return <Loader />;
//   if (error) return <div className="error-message">{error}</div>;

  const renderSection = (title, role) => {
    if(members.filter(member => member.role === role).length <= 0) {
      return null;
    } else {
        return (
            <section className="team-section">
                <h2 className="team-section__title">{title}</h2>
                <div className="team-section__grid">
                    {members
                    .filter(member => member.role === role)
                    .map(member => (
                        <TeamCard key={member._id} member={member} />
                    ))
                    }
                </div>
            </section>
        );
    }
  };

  return (
    <div className="team-page">
        <div className='team-title'>
            <h1>Our Team</h1>
        </div>
        {members.length === 0 ? <div className='error-message'>No members found</div> : 
            <>
            {renderSection('Faculty Advisor', 'Faculty Advisor')}
            {renderSection('Post Holders', 'Post Holder')}
            {renderSection('Team Leads', 'Team Lead')}
            {renderSection('Members', 'Member')}
            </>
        } 
    </div>
  );
};

export default TeamPage;