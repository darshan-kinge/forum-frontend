import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import config from '../../../config/config.js';
import Badge from '../Badge.jsx';
import HelmetComponent from '../../../components/helmet/HelmetComponent.jsx';
import Loader from '../../../components/loader/Loader.jsx';

const MemberBadge = () => {
  const { id } = useParams(); 
  const [memberData, setMemberData] = useState({});

  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        
        const response = await fetch(`${config.serverUrl}/api/${config.apiVersion}/member/badge/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch member data');
        }

        const data = await response.json();
        
        setMemberData(data.member);        
        
      } catch (error) {
        console.error('Error fetching member data:', error);
      }
    };
    fetchMemberData();
  }, [id]);

  if(!memberData) {
    return <Loader />;
  }

  return (
    <>
      <div className='member-badge-container' style={{ display: 'flex', flexDirection: 'row', gap: '20px', alignItems: 'center', justifyContent: 'space-around' }}>
        <HelmetComponent
          pageName="Member"
          description="MIT-WPU Science & Spirituality Forum Member Badge"
          keywords='MIT-WPU, Science and Spirituality Forum, SNSF, Science, Spirituality, Forum, MIT, WPU, Vishwanath Karad, Rahul Karad'
        />

        <Badge memberData={memberData} />
      </div>
    </>
  );
};

export default MemberBadge;
