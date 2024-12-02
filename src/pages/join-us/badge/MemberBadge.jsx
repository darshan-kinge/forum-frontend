import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react'; 
import html2canvas from 'html2canvas';  

const MemberBadge = () => {
  const { id } = useParams(); 
  const [memberData, setMemberData] = useState({});

  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        
        const response = await fetch(`http://localhost:3000/api/v1/member/badge/${id}`);
        
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

  
  
  const downloadBadge = () => {
      const badgeElement = document.getElementById('badge');
      html2canvas(badgeElement).then((canvas) => {
          const link = document.createElement('a');
          link.download = 'member_badge.png';
          link.href = canvas.toDataURL('image/png');
          link.click();
        });
    };
    
  const verificationLink = `${window.location.origin}/member/badge/verify/${id}`;  // Create verification URL


  if(!memberData) {
    return <div>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.badgeSection}>
        {/* Improved Badge Design */}
        <div id="badge" style={styles.badge}>
          <h2>{memberData.name}</h2>
          <p>Member</p>
          <p>Member ID: {memberData.member_id}</p>
          <QRCodeCanvas value={verificationLink} size={128} />
          <p>Scan to verify</p>
        </div>
        <button style={styles.downloadButton} onClick={downloadBadge}>
          Download Badge
        </button>
      </div>

      <div style={styles.textSection}>
        <h1>Welcome, {memberData.name}!</h1>
        <p>Thank you for joining the club. Your membership ID is {memberData.member_id}.</p>
        <p>This badge is your official proof of membership. Scan the QR code to verify your membership.</p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '50px',
    fontFamily: 'Arial, sans-serif',
  },
  badgeSection: {
    marginRight: '50px',
    textAlign: 'center',
  },
  badge: {
    border: '2px solid #4CAF50',
    borderRadius: '10px',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
    width: '250px',
  },
  downloadButton: {
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  textSection: {
    maxWidth: '400px',
  },
};

export default MemberBadge;
