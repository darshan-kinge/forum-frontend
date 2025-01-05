import React from 'react';
import { FaFacebook, FaLinkedin, FaTwitter, FaDownload } from 'react-icons/fa';
import './Badge.css';
import { QRCodeCanvas } from 'qrcode.react'; 
import html2canvas from 'html2canvas';  
import { useParams } from 'react-router-dom';
import HelmetComponent from '../../components/helmet/HelmetComponent';

const Badge = ({ memberData }) => {
  const { id } = useParams(); 
  const verificationLink = `${window.location.origin}/member/badge/verify/${id}`;  // Create verification URL

  const handleDownload = () => {
    const badgeElement = document.querySelector('.badge-wrapper');
    html2canvas(badgeElement).then((canvas) => {
      const link = document.createElement('a');
      link.download = 'member_badge.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  };

  const handleShare = (platform) => {
    const shareData = {
      title: 'Check out my badge!',
      text: 'I just earned a badge from MIT-WPU Science & Spirituality Forum!',
      url: verificationLink,
    };

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(verificationLink)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(verificationLink)}&text=${encodeURIComponent(shareData.text)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verificationLink)}`, '_blank');
        break;
      default:
        navigator.share(shareData).catch(console.error);
    }
  };

  const handleAddToLinkedIn = () => {
    const certificationName = 'Member';
    const organizationId = '98777510';
    const issueYear = new Date().getFullYear();
    const issueMonth = new Date().getMonth() + 1;
    const certUrl = verificationLink;
    const certId = memberData.member_id;

    const linkedinUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(certificationName)}&organizationId=${organizationId}&issueYear=${issueYear}&issueMonth=${issueMonth}&certUrl=${encodeURIComponent(certUrl)}&certId=${certId}`;
    window.open(linkedinUrl, '_blank');
  };

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

        {/* <div> */}
          <div className='badge-buttons'>
            <button className='badge-download-button' onClick={handleDownload}>
              <FaDownload /> Download Badge
            </button>
            <button className='badge-linkedin-button' onClick={handleAddToLinkedIn}>
              <FaLinkedin /> Add to LinkedIn
          </button>
          </div>

          <div className='badge-share-buttons'>
            <div className="badge-share-buttons-text">
              <p>Share your badge on social media:</p>
            </div>
            <div className="share-icons">
              <button className='badge-share-button' onClick={() => handleShare('facebook')}>
                <FaFacebook />
              </button>
              <button className='badge-share-button' onClick={() => handleShare('twitter')}>
                <FaTwitter />
              </button>
              <button className='badge-share-button' onClick={() => handleShare('linkedin')}>
                <FaLinkedin />
              </button>
            </div>
          </div>
        {/* </div> */}

      </div>
    </div>
  )
}

export default Badge;