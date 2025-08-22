import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import config from '../../../config/config.js';
import './VerifyBadge.css';
import api from '../../../utils/api.js';

const VerifyBadge = () => {
  const { id } = useParams();
  const [verificationStatus, setVerificationStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [memberData, setMemberData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const VerifyBadge = async () => {
      try {
        const response = await api.get(`/member/badge/verify/${id}`);
        const data = response.data;
        setMemberData(data.member);
        setVerificationStatus(`Member Verified: ${data.member.name} (ID: ${data.member.member_id})`);
      } catch (error) {
        setErrorMessage(error.message || 'An error occurred while verifying the member.');
      } finally {
        setIsLoading(false);
      }
    };

    VerifyBadge();
  }, [id]);

  return (
    <div className="container">
      <div className="card">
        {isLoading ? (
          <div className="loader-container">
            <div className="loader"></div>
            <p className="loader-text">Verifying member...</p>
          </div>
        ) : (
          <div className="text-section">
            <h1 className="title">Member Badge Verification</h1>
            {verificationStatus ? (
              <div className="verified">
                <div className="icon-container">
                  <span className="checkmark">✓</span>
                </div>
                <h2 className="verification-text">Verified Member</h2>
                <div className="member-details">
                  <div className="detail-row">
                    <span className="label">Name:</span>
                    <span className="value">{memberData.name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Member ID:</span>
                    <span className="value">{memberData.member_id}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Joined:</span>
                    <span className="value">
                      {new Date(memberData.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                <p className="message">Thank you for being a verified member of the forum!</p>
              </div>
            ) : (
              <div className="error">
                <div className="icon-container">
                  <span className="cross">✕</span>
                </div>
                {errorMessage && <h2 className="error-text">{errorMessage}</h2>}
                <p className="message">It seems like the token is invalid or expired. Please check the link or contact support.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyBadge;
