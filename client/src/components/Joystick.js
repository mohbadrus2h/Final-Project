import React, { useState } from 'react';
import './Joystick.css';

const Joystick = () => {
  const [direction, setDirection] = useState('');
  const [value, setValue] = useState(0);

  const handleClick = (e) => {
    switch (e.target.id) {
      case 'up':
        setDirection('up');
        break;
      case 'down':
        setDirection('down');
        break;
      case 'left':
        setDirection('left');
        setValue(1);
        break;
      case 'right':
        setDirection('right');
        setValue(1);
        break;
      default:
        setDirection('');
        setValue(0);
    }
  };

  return (
    <div className="joystick">
      <div className="arrow up" id="up" onClick={handleClick} />
      <div className="arrow left" id="left" onMouseDown={handleClick} onMouseUp={handleClick} />
      <div className="arrow right" id="right" onMouseDown={handleClick} onMouseUp={handleClick} />
      <div className="arrow down" id="down" onClick={handleClick} />
      <div className="direction">{value}</div>
    </div>
  );
};

export default Joystick;
