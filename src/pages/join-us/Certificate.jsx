import React from 'react'
import './Certificate.css'

const Certificate = () => {

  // const { memberId } = useParams();
  const dummyMemberData = {
    name: "John Doe",
    memberId: "1234567890",
    year: "2024"
  }
    return (
        <div>
            <h1>Certificate</h1>
            <div className='certificate-container'>
                <div className='certificate'>
                        <div className='vertical-bar'>
                          <img src="/logo-white.png" className='certificate-logo' alt="logo" />
                          <div className="certificate-member-info">
                            <div className="certificate-member-id">
                              <h3>Member ID</h3>
                              <h3>{dummyMemberData.memberId}</h3>
                            </div>
                            <div className="certificate-qr">
                              
                            </div>
                          </div>
                        </div>
                    <div className='certificate-inner'>
                      <div className="display-info">
                        <div className="certificate-title">
                          <h1>Certificate of <br /> Membership</h1>
                        </div>
                        <div className="certificate-content">
                          <p>This is to certify that <b>{dummyMemberData.name}</b> has been a member of the MIT-WPU Science & Spirituality Forum since <b>{dummyMemberData.year}</b></p>
                        </div>
                      </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Certificate  