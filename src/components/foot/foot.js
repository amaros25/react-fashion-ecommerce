import React from 'react';
import './foot.css';

export default function Foot() {
  return (
    <footer className="footer-container">
      <div className="footer-columns">
        <div className="footer-column">
          <h3>Cmandi</h3>
          <ul>
            <li>About Us</li>
            <li>Careers</li>
            <li>Sustainability</li>
            <li>Press</li>
            <li>Advertising</li>
            <li>Accessibility</li>
          </ul>
        </div>
        <div className="footer-column">
          <h3>Discover</h3>
          <ul>
            <li>How It Works</li>
            <li>Article Verification</li>
            <li>Mobile Apps</li>
            <li>Info Board</li>
          </ul>
        </div>
        <div className="footer-column">
          <h3>Help</h3>
          <ul>
            <li>Help Center</li>
            <li>Sell</li>
            <li>Buy</li>
            <li>Trust & Safety</li>
          </ul>
        </div>
      </div>
      <hr className="footer-divider" />
        <nav className="footer-horizontal-menu">
        <ul>
          <li>Privacy Center</li>
          <li>Cookie Notices</li>
          <li>Cookie Settings</li>
          <li>Terms & Conditions</li>
          <li>Our Platform</li>
        </ul>
      </nav>
    </footer>
  );
}
