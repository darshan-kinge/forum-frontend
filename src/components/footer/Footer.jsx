import React from 'react';
import './Footer.css';
import { FaInstagram, FaEnvelope, FaYoutube, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-left">
                    <img src="/logo-white.png" alt="Logo" className="footer-logo" />
                </div>
                <div className="footer-right">
                    <div className="inner-right">
                        <h3>Follow us on</h3>
                        <div className="social-media">
                            <a href="https://www.instagram.com/ieeevitvellore/?hl=en" target="_blank" rel="noreferrer">
                                <FaInstagram />
                            </a>
                            <a href="https://www.linkedin.com/company/ieee-vit-vellore-student-branch/" target="_blank" rel="noreferrer">
                                <FaLinkedinIn />
                            </a>
                            <a href="mailto:snsf@mitwpu.edu.in" target="_blank" rel="noreferrer">
                                <FaEnvelope />
                            </a>
                            <a href="https://www.youtube.com/" target="_blank" rel="noreferrer">
                                <FaYoutube />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <hr />
            <div className="footer-bottom">
                <p>© 2024 MIT-WPU Science & Spirituality Forum. All Rights Reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;