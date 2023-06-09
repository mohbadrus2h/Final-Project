import React, { useState } from 'react';
import '../mode/ArrowButton.css';
import { Socket } from 'socket.io-client';

const ArrowButton = ({ socket, selectedMode, isConnected }) => {
  const [aziThet, setaziThet] = useState(0);
  const [elevThet, setelevThet] = useState(0);

  // console.log(selectedMode)

  const handleUpArrowClick = () => {
    if (elevThet >= 0) {
      setelevThet(elevThet + 20);

      console.log([elevThet, elevThet]);

      if (elevThet === 180) {
        setelevThet(180);
      }
    }

    if (selectedMode === 'manual' && isConnected) {
      socket.emit('arrowData', [aziThet, elevThet]);
    }
  };

  const handleDownArrowClick = () => {
    if (elevThet <= 180) {
      setelevThet(elevThet - 20);

      console.log([elevThet, elevThet]);

      if (elevThet === 0) {
        setelevThet(0);
      }
    }

    if (selectedMode === 'manual' && isConnected) {
      socket.emit('arrowData', [aziThet, elevThet]);
    }
  };

  const handleRightArrowClick = () => {
    if (aziThet >= 0) {
      setaziThet(aziThet + 30);

      console.log([aziThet, aziThet]);

      if (aziThet === 360) {
        setaziThet(360);
      }
    }

    if (selectedMode === 'manual' && isConnected) {
      socket.emit('arrowData', [aziThet, elevThet]);
    }
  };

  const handleLeftArrowClick = () => {
    if (aziThet <= 360) {
      setaziThet(aziThet - 30);

      console.log([aziThet, aziThet]);

      if (aziThet === 0) {
        setaziThet(0);
      }
    }

    if (selectedMode === 'manual' && isConnected) {
      socket.emit('arrowData', [aziThet, elevThet]);
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
