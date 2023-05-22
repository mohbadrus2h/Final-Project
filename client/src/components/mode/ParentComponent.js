import React, { useState } from 'react';
import DropdownList from './DropdownList';
import ArrowButton from './ArrowButton';

const ParentComponent = () => {
  const [mode, setMode] = useState('');

  const handleModeChange = (selectedMode) => {
    setMode(selectedMode);
  };

  return (
    <div>
      <DropdownList onModeChange={handleModeChange} />
      {mode === 'manual' && <ArrowButton />}
    </div>
  );
};

export default ParentComponent;
