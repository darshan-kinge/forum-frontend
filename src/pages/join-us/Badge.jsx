import React from 'react'
import './Badge.css';
import { QRCodeCanvas } from 'qrcode.react'; 
import html2canvas from 'html2canvas';  
import { useParams } from 'react-router-dom';

const Badge = ({ memberData }) => {
  const { id } = useParams(); 
  const verificationLink = `${window.location.origin}/member/badge/verify/${id}`;  // Create verification URL

  return (
    <div className='badge-container'>
      <div className='badge-wrapper'>
      <div className='badge'>
        <div className='badge-header'>
          <h1 className='badge-club-name'>MIT-WPU <br /> Science & Spirituality Forum</h1>
          <img src="/logo-transparent.png" alt="Club Logo" className='badge-logo' />
        </div>
        <div className='badge-body'>
          <h2 className='badge-user-name'>{memberData.name}</h2>
          <p className='badge-member-id'>Member ID: {memberData.member_id}</p>
          <p className='badge-designation'>Member</p>
          <div className="badge-qr">
            <QRCodeCanvas value={verificationLink} size={80} className='badge-qr-code' />
            <p className='badge-qr-text'>Scan the QR code to verify your membership.</p>
          </div>
        </div>
      </div>
      </div>

      <div className='badge-text'>
        <h1 className='welcome-title'>Welcome, {memberData.name}!</h1>
        <p className='welcome-content'>Thank you for joining the club. Your membership ID is {memberData.member_id}.</p>
        <p className='welcome-content'>This badge is your official proof of membership. Scan the QR code to verify your membership.</p>

        <div>
          <button className='badge-download-button' onClick={() => {
            const badgeElement = document.querySelector('.badge-wrapper');
            html2canvas(badgeElement).then((canvas) => {
              const link = document.createElement('a');
              link.download = 'member_badge.png';
              link.href = canvas.toDataURL('image/png');
              link.click();
            });
          }}>Download Badge</button>
        </div>

      </div>
    </div>
  )
}

export default Badge;