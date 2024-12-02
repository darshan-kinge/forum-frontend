// src/components/Team/TeamCard.js
import React from 'react';
import './TeamCards.css';

const TeamCard = ({ member }) => {
  return (
    <div className="team-card">
      <div className="team-card__image">
        <img src={member.photo} alt={member.name} />
      </div>
      <div className="team-card__content">
        <h3 className="team-card__name">{member.name}</h3>
        <p className="team-card__designation">{member.designation}</p>
        <div className="team-card__links">
          <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="team-card__linkedin">LinkedIn</a>
          <a href={`mailto:${member.email}`} className="team-card__email">Email</a>
        </div>
      </div>
    </div>
  );
};

export default TeamCard;