import React, { useState } from 'react';
import './styles.css';

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="hamburger-container">
      <button className="hamburger-button" onClick={toggleMenu}>
        ☰
      </button>
      
      {isOpen && (
        <div className="menu-items">
          <a href="/" className="menu-item">Farm</a>
          <a href="/race" className="menu-item">Race</a>
          <a href="/war" className="menu-item">War</a>
          <a href="/mint" className="menu-item">Mint</a>
          <div className="menu-item" onClick={() => {
            alert("About RicoVision Ant Farm\n\nA blockchain visualization experiment showing NFT contract addresses as ants moving through an interconnected colony. Watch as digital assets come to life in this interactive display.");
          }}>About</div>
        </div>
      )}
    </div>
  );
};

export default HamburgerMenu; 