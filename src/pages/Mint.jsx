import React from 'react';
import { Link } from 'react-router-dom';

const Mint = () => {
  return (
    <div className="container">
      <div className="content">
        <h1>Mint Your CryptoAnt NFT</h1>
        
        <div className="mint-section">
          <h2>Join The Colony</h2>
          <p>Each CryptoAnt is a unique NFT with evolving traits and abilities.</p>
          <button className="mint-button" disabled>
            Mint Coming Soon
          </button>
        </div>

        <div className="features-section">
          <h2>Features</h2>
          <ul>
            <li> Unique genetic traits that affect gameplay</li>
            <li>⏰ Time-based evolution system</li>
            <li>🎮 Access to multiple mini-games</li>
            <li>🏆 Earn rewards through gameplay</li>
          </ul>
        </div>

        <div className="games-section">
          <h2>Mini Games</h2>
          <div className="games-list">
            <div className="game">
              <h3>Ant Farm</h3>
              <p>Build and manage your colony in our signature game.</p>
            </div>
            <div className="game">
              <h3>Ant Racing</h3>
              <p>Compete in high-stakes races against other ants.</p>
            </div>
            <div className="game">
              <h3>Ant Wars</h3>
              <p>Strategic battles for colony dominance.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mint; 