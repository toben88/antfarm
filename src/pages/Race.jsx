import React, { useEffect, useRef } from 'react';
import { AntRacer } from '../components/AntRacer';

const Race = () => {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && !gameRef.current) {
      // Set up canvas
      const canvas = canvasRef.current;
      canvas.id = 'raceTrack';
      
      // Initialize game
      gameRef.current = new AntRacer();
    }

    // Cleanup on unmount
    return () => {
      if (gameRef.current) {
        // Add any cleanup needed
      }
    };
  }, []);

  return (
    <div>
      <canvas 
        ref={canvasRef} 
        style={{ 
          width: '100%', 
          height: '100vh',
          display: 'block'
        }} 
      />
      <div id="winner" style={{ 
        display: 'none',
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '20px',
        borderRadius: '10px'
      }}></div>
    </div>
  );
};

export default Race; 