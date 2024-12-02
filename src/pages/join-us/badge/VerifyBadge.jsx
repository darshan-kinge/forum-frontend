import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import config from '../../../config/config.js';

const VerifyBadge = () => {
  const { id } = useParams();
  const [verificationStatus, setVerificationStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [memberData, setMemberData] = useState({});

  useEffect(() => {
    const VerifyBadge = async () => {
      try {
        const response = await fetch(`${renfig.rerverUrl}1/member/badge/verify/${id}`);
        console.log(response);
        
        if (!response.ok) {
          throw new Error('Failed to verify member.');
        }

        const data = await response.json();
        
        setMemberData(data.member);
        if(response.ok) {
          setVerificationStatus(`Member Verified: ${data.member.name} (ID: ${data.member.member_id})`);
        }
      
      } catch (error) {
        setErrorMessage(error);
      }
    };

    VerifyBadge();
  }, [id]);

  return (
    <div style={styles.container}>
      <div style={styles.textSection}>
        <h1>Membership Verification</h1>
        {verificationStatus ? (
          <div style={styles.verified}>
            <h2>{verificationStatus}</h2>
            <p>Thank you for being a verified member of the club!</p>
          </div>
        ) : (
          <div style={styles.error}>
            <h2>{errorMessage}</h2>
            <p>It seems like the token is invalid or expired. Please check the link or contact support.</p>
          </div>
        )}
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
  textSection: {
    maxWidth: '400px',
    textAlign: 'center',
  },
  verified: {
    color: 'green',
    fontWeight: 'bold',
    padding: '20px',
    border: '2px solid green',
    borderRadius: '10px',
    backgroundColor: '#e6ffe6',
  },
  error: {
    color: 'red',
    fontWeight: 'bold',
    padding: '20px',
    border: '2px solid red',
    borderRadius: '10px',
    backgroundColor: '#ffe6e6',
  },
};

export default VerifyBadge;
