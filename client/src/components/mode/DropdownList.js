import React, { useState, useEffect } from 'react';

const DropdownList = ({ socket, onModeChange }) => {
  const [selected, setSelected] = useState('');
  const [clickState, setClickState] = useState(false);
  const [reconnectState, setReconnectState] = useState(false);
  const [receivedData, setReceivedData] = useState([]);
  const [isConnected, setIsConnected] = useState(false); // New state for connection status

  const handleModeChange = (event) => {
    const selectedMode = event.target.value;
    setSelected(selectedMode);
    
    if (clickState) {
      onModeChange(selectedMode);
    }
  };
  const handleConnectClick = () => {
    if (selected !== '') {
      if (clickState && !reconnectState) {
        socket.emit('selection', 'disconnected');
        setClickState(false);

      } else {
        socket.emit('selection', selected);
        setClickState(true);
        setReconnectState(false);
        onModeChange(selected);
      }
    }
  };

  useEffect(() => {

    socket.on('disconnect', () => {
      setReconnectState(false);
      setIsConnected(false); // Update connection status on disconnect
    });

    socket.on('connect', () => {
      setIsConnected(true); // Update connection status on connect
    });

    return () => {
      socket.off('disconnect');
      socket.off('connect');
    };
  }, [socket]);

  return (
    <div>
      <select value={selected} onChange={handleModeChange}>
        <option value="">Select Mode</option>
        <option value="manual">Manual</option>
        <option value="automatic">Automatic</option>
      </select>
      <button
        onClick={handleConnectClick}
        style={{ backgroundColor: clickState ? 'red' : 'green' }}
      >
        {clickState ? 'disconnect' : 'connect'}
      </button>
    </div>
  );
};

export default DropdownList;


// import React, { useState, useEffect } from 'react';

// const DropdownList = ({ socket, onModeChange }) => {
//   const [selected, setSelected] = useState('');
//   const [clickState, setclickState] = useState(false);
//   const [reconnectState, setReconnectState] = useState(false);
//   const [receivedData, setReceivedData] = useState([]);

//   const handleModeChange = (event) => {
//     const selectedMode = event.target.value;
//     setSelected(selectedMode);
//     onModeChange(selectedMode);
//   };
  
  
//   const handleConnectClick = () => {
//     if (selected !== '') {
//       if (clickState && !reconnectState) {
//         socket.emit('selection', 'disconnected');
//         setclickState(false);
//       } else {
//         socket.emit('selection', selected);
//         setclickState(true);
//         setReconnectState(false);
//       }

//       // onModeChange(selected);
//     }
//   };

//   useEffect(() => {
//     socket.on('disconnect', () => {
//       setReconnectState(false);
//     });
  
//     return () => {
//       socket.off('disconnect');
//     };
//   }, [socket]);
  

//   return (
//     <div>
//       <select value={selected} onChange={handleModeChange}>
//         <option value="">Select Mode</option>
//         <option value="manual">Manual</option>
//         <option value="automatic">Automatic</option>
//       </select>
//       <button 
//         onClick={handleConnectClick}
//         style={{ backgroundColor: clickState ? 'red' : 'green' }}
//       >
//         {clickState ? 'disconnect' : 'connect'}
//       </button>
//     </div>
//   );
// };

// export default DropdownList;
