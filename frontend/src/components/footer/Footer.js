import React from 'react';
import './Footer.css';

function Footer() {

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <p>&copy; 2025 Budget Tracker.</p>
          <div className="footer-links">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <span>|</span>
            <a 
              href="https://reactjs.org" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              React
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
