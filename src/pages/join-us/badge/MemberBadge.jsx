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
          pageName="Member Badge"
          description="MIT-WPU Science & Spirituality Forum Member Badge"
          keywords='MIT-WPU, Science and Spirituality Forum, SNSF, Science, Spirituality, Forum, MIT, WPU, Vishwanath Karad, Rahul Karad'
        />

        <Badge memberData={memberData} />
      </div>
    </>
    // <div style={styles.container}>
    //   <div style={styles.content}>
    //     <div style={styles.badgeSection}>
    //       {/* Improved Badge Design */}
    //       <div id="badge" style={styles.badge}>
    //         <div style={styles.badgeHeader}>
    //           <img src='/logo-white.png' alt="Logo" style={styles.logo} />
    //           <h2 style={styles.badgeTitle}>{memberData.name}</h2>
    //         </div>
    //         <p style={styles.memberName}>Member</p>
    //         <p style={styles.memberId}>Member ID: {memberData.member_id}</p>
    //         <div style={styles.qrContainer}>
    //           <QRCodeCanvas value={verificationLink} size={128} style={{padding: '8px', backgroundColor: 'white', borderRadius: '4px' }} />
    //           <p style={styles.scanText}>Scan to verify</p>
    //         </div>
    //       </div>
    //       <button style={styles.downloadButton} onClick={downloadBadge}>
    //         Download Badge
    //       </button>
    //     </div>

    //     <div style={styles.textSection}>
    //       <h1 style={styles.welcomeTitle}>Welcome, {memberData.name}!</h1>
    //       <p style={styles.welcomeContent}>Thank you for joining the club. Your membership ID is {memberData.member_id}.</p>
    //       <p style={styles.welcomeContent}>This badge is your official proof of membership. Scan the QR code to verify your membership.</p>
    //     </div>
    //   </div>
    // </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: 'var(--bg-color)',
    padding: '20px',
    '@media (max-width: 768px)': {
      padding: '10px',
    },
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    gap: '40px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: '20px',
    '@media (max-width: 768px)': {
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px',
      padding: '10px',
    },
  },
  badgeSection: {
    flex: '0 1 auto',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '16px',
    alignItems: 'center',
    gap: '20px',
    '@media (max-width: 768px)': {
      width: '100%',
    },
  },
  badge: {
    width: '320px',
    padding: '24px',
    backgroundColor: 'var(--bg-color)',
    borderRadius: '16px',
    '@media (max-width: 768px)': {
      width: '100%',
      maxWidth: '320px',
      padding: '16px',
    },
  },
  badgeHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    '@media (max-width: 768px)': {
      gap: '8px',
    },
  },
  logo: {
    width: '80px',
    height: '80px',
    objectFit: 'contain',
    '@media (max-width: 768px)': {
      width: '60px',
      height: '60px',
    },
  },
  badgeTitle: {
    margin: '0',
    color: '#1a73e8',
    fontSize: '1.5rem',
    textAlign: 'center',
    '@media (max-width: 768px)': {
      fontSize: '1.25rem',
    },
  },
  memberName: {
    margin: '0',
    fontSize: '1.25rem',
    color: '#fff',
    textAlign: 'center',
    '@media (max-width: 768px)': {
      fontSize: '1.1rem',
    },
  },
  textSection: {
    flex: '1 1 400px',
    maxWidth: '600px',
    padding: '24px',
    backgroundColor: 'white',
    borderRadius: '16px',
    '@media (max-width: 768px)': {
      width: '100%',
      padding: '16px',
    },
  },
  welcomeTitle: {
    margin: '0 0 24px 0',
    color: '#202124',
    fontSize: '2rem',
    '@media (max-width: 768px)': {
      fontSize: '1.5rem',
      margin: '0 0 16px 0',
    },
  },
  welcomeContent: {
    color: '#5f6368',
    fontSize: '1rem',
    lineHeight: '1.5',
    '@media (max-width: 768px)': {
      fontSize: '0.95rem',
    },
  },
  downloadButton: {
    padding: '12px 24px',
    backgroundColor: '#1a73e8',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    '@media (max-width: 768px)': {
      width: '100%',
      maxWidth: '320px',
    },
  },
  qrContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    margin: '16px 0',
    '@media (max-width: 768px)': {
      margin: '12px 0',
    },
  },
  memberId: {
    margin: '0',
    textAlign: 'center',
    color: 'white',
    fontSize: '1rem',
    '@media (max-width: 768px)': {
      fontSize: '0.9rem',
    },
  },
  scanText: {
    margin: '0',
    color: 'white',
    fontSize: '0.875rem',
    '@media (max-width: 768px)': {
      fontSize: '0.8rem',
    },
  },
  benefitsList: {
    paddingLeft: '20px',
    marginTop: '16px',
    '@media (max-width: 768px)': {
      paddingLeft: '16px',
      marginTop: '12px',
    },
  },
};

export default MemberBadge;
