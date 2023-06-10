import React, { useState, useRef } from 'react';
import '../mode/ArrowButton.css';
import { Socket } from 'socket.io-client';

const ArrowButton = ({ socket, selectedMode, isConnected }) => {
  const aziThetRef = useRef(0)
  const elevThetRef = useRef(180);

  const handleUpArrowClick = () => {
    if (elevThetRef.current < 270) {
      elevThetRef.current += 20;


      if (elevThetRef.current === 260) {
        elevThetRef.current += 10;
      }
    }

    console.log([aziThetRef.current, elevThetRef.current]);

    if (selectedMode === 'manual' && isConnected) {
      socket.emit('arrowData', [aziThetRef.current, elevThetRef.current]);
    }
  };

  const handleDownArrowClick = () => {
    if (elevThetRef.current > 180) {
      elevThetRef.current -= 20;

      if (elevThetRef.current === 190) {
        elevThetRef.current -= 10;
      }
    }

    console.log([aziThetRef.current, elevThetRef.current]);

    if (selectedMode === 'manual' && isConnected) {
      socket.emit('arrowData', [aziThetRef.current, elevThetRef.current]);
    }
  };

  const handleRightArrowClick = () => {
    if (aziThetRef.current < 360) {
      aziThetRef.current += 30;

      
      // if (aziThetRef === 360) {
        //   setaziThet(360);
        // }
      }
      
    console.log([aziThetRef.current, elevThetRef.current]);
      
    if (selectedMode === 'manual' && isConnected) {
      socket.emit('arrowData', [aziThetRef.current, elevThetRef.current]);
    }
  };

  const handleLeftArrowClick = () => {
    if (aziThetRef.current > 0) {
      aziThetRef.current -= 30;

      // if (aziThet === 0) {
      //   setaziThet(0);
      // }
    }
    
    console.log([aziThetRef.current, elevThetRef.current]);

    if (selectedMode === 'manual' && isConnected) {
      socket.emit('arrowData', [aziThetRef.current, elevThetRef.current]);
    }
  };

  const isManualMode = selectedMode === 'manual';

  return (
    <div className="button_grid">
      <button
        className="arrow-up"
        onClick={handleUpArrowClick}
        disabled={!isManualMode || !isConnected}
      >
        UP
      </button>
      <button
        className="arrow-right"
        onClick={handleLeftArrowClick}
        disabled={!isManualMode || !isConnected}
      >
        LEFT
      </button>
      <button
        className="arrow-left"
        onClick={handleRightArrowClick}
        disabled={!isManualMode || !isConnected}
      >
        RIGHT
      </button>
      <button
        className="arrow-down"
        onClick={handleDownArrowClick}
        disabled={!isManualMode || !isConnected}
      >
        DOWN
      </button>
    </div>
  );
};

export default ArrowButton;
