import React, { useState } from 'react';
import '../mode/ArrowButton.css';
import { Socket } from 'socket.io-client';

const ArrowButton = ({ socket, selectedMode, isConnected }) => {
  const [rightArrowValue, setRightArrowValue] = useState(0);
  const [leftArrowValue, setLeftArrowValue] = useState(0);
  const [elevValue, setElevValue] = useState(0);

//   console.log(isConnected)

  const handleUpArrowClick = () => {
    if (elevValue >= 0) {
      setElevValue(elevValue + 10);
    //   console.log(elevValue);
      if (elevValue === 180) {
        setElevValue(180);
      }
    }

    if (selectedMode === 'manual' && isConnected) {
      socket.emit('arrowData', [elevValue, rightArrowValue, leftArrowValue]);
    }
  };

  const handleDownArrowClick = () => {
    if (elevValue <= 180) {
      setElevValue(elevValue - 10);
    //   console.log(elevValue);
      if (elevValue === 0) {
        setElevValue(0);
      }
    }

    if (selectedMode === 'manual' && isConnected) {
      socket.emit('arrowData', [elevValue, rightArrowValue, leftArrowValue]);
    }
  };

  const handleRightArrowClick = () => {
    setRightArrowValue(1);
    if (selectedMode === 'manual' && isConnected) {
      socket.emit('arrowData', [elevValue, rightArrowValue, leftArrowValue]);
    }
  };

  const handleLeftArrowClick = () => {
    setLeftArrowValue(1);
    if (selectedMode === 'manual' && isConnected) {
      socket.emit('arrowData', [elevValue, rightArrowValue, leftArrowValue]);
    }
  };

  const handleRightArrowRelease = () => {
    setRightArrowValue(0);
  };

  const handleLeftArrowRelease = () => {
    setLeftArrowValue(0);
  };

  const isManualMode = selectedMode === 'manual';

  return (
    <div className="button_grid">
      <button className="arrow-up" onClick={handleUpArrowClick} disabled={!isManualMode || !isConnected}>
        UP
      </button>
      <button
        className="arrow-right"
        onMouseDown={handleRightArrowClick}
        onMouseUp={handleRightArrowRelease}
        disabled={!isManualMode || !isConnected}
      >
        LEFT
      </button>
      <button
        className="arrow-left"
        onMouseDown={handleLeftArrowClick}
        onMouseUp={handleLeftArrowRelease}
        disabled={!isManualMode || !isConnected}
      >
        RIGHT
      </button>
      <button className="arrow-down" onClick={handleDownArrowClick} disabled={!isManualMode || !isConnected}>
        DOWN
      </button>
    </div>
  );
};

export default ArrowButton;
