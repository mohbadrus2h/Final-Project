import React, { useState, useRef } from 'react';

const USBconnection = ({ socket }) => {
  const [deviceNames, setDeviceNames] = useState([]);
  const selectedDevice1Ref = useRef('');
  const baudRate1Ref = useRef(57600);
  const selectedDevice2Ref = useRef('');
  const baudRate2Ref = useRef(57600);
  const [deviceType, setDeviceType] = useState('');
  const [isConnected1, setIsConnected1] = useState(false);
  const [isConnected2, setIsConnected2] = useState(false);

  const handleConnect = (deviceNumber) => {
    let selectedDeviceRef, baudRateRef, newDeviceType, isConnected;
    if (deviceNumber === 1) {
      selectedDeviceRef = selectedDevice1Ref;
      baudRateRef = baudRate1Ref;
      newDeviceType = 'arduino';
      isConnected = !isConnected1;
      setIsConnected1(isConnected);
    
    } else if (deviceNumber === 2) {
      selectedDeviceRef = selectedDevice2Ref;
      baudRateRef = baudRate2Ref;
      newDeviceType = 'telemetry';
      isConnected = !isConnected2;
      setIsConnected2(isConnected);
    
    }

    setDeviceType(newDeviceType);


    const selectedDevice = selectedDeviceRef.current.value;
    const baudRate = Number(baudRateRef.current.value);

    if (isConnected) {

      // Emit the selected device and baud rate to the server
      socket.emit('connect_usb', { deviceType: newDeviceType, device: selectedDevice, baudRate });
    } else {
      
      socket.emit('disconnect_usb', { device: selectedDevice});
    }
  };

  // Listen for 'usb_devices' event from the server
  socket.on('usb_devices', (receivedDeviceNames) => {
    setDeviceNames(receivedDeviceNames);
    console.log(deviceNames);
  });

  return (
<div>
  <div style={{ display: 'flex' }}>
    <div style={{ flex: '50%', marginRight: '5px' }}>
      <h4>Arduino</h4>
      <select
        id="arduino_dev"
        ref={selectedDevice1Ref}
        onChange={(e) => {
          const selectedDevice = selectedDevice1Ref.current.value;
          // selectedDevice1Ref.current = selectedDevice;
        }}
      >
        {deviceNames.map((deviceName) => (
          <option key={deviceName} value={deviceName}>{deviceName}</option>
        ))}
      </select>

      <br />

      <select
        id="arduino_baud"
        ref={baudRate1Ref}
        onChange={(e) => baudRate1Ref(Number(e.target.value))}
      >
        <option value="57600">57600</option>
        <option value="115200">115200</option>
        <option value="9600">9600</option>
        {/* Add more baud rates if needed */}
      </select>

      <br />

      <button
        name='arduino_con'
        onClick={() => handleConnect(1)}
        style={{ backgroundColor: isConnected1 ? 'red' : 'blue' }}
      >
        {isConnected1 ? 'Disconnect' : 'Connect'}
      </button>
    </div>

    <div style={{ flex: '50%' }}>
      <h4>Telemetry</h4>
      <select
        id="telemetry_dev"
        ref={selectedDevice2Ref}
        onChange={() => {
          const selectedDevice = selectedDevice2Ref.current.value;
          // selectedDevice2Ref.current = selectedDevice;
        }}
      >
        {deviceNames.map((deviceName) => (
          <option key={deviceName} value={deviceName}>{deviceName}</option>
        ))}
      </select>

      <br />

      <select
        id="telemetry_baud"
        ref={baudRate2Ref}
        onChange={(e) => baudRate1Ref(Number(e.target.value))}
      >
        <option value="57600">57600</option>
        <option value="115200">115200</option>
        <option value="9600">9600</option>
        {/* Add more baud rates if needed */}
      </select>

      <br />

      <button
        name='telemetry_con'
        onClick={() => handleConnect(2)}
        style={{ backgroundColor: isConnected2 ? 'red' : 'blue' }}
      >
        {isConnected2 ? 'Disconnect' : 'Connect'}
      </button>
    </div>
  </div>
</div>
  );
};


export default USBconnection;





    // <div>
    // <div>
    //   <label htmlFor="deviceSelect">Device:</label>
    //   <select id="deviceSelect" value={selectedDevice} onChange={(e) => setSelectedDevice(e.target.value)}>
    //     <option value="">arduino</option>
    //     {deviceNames.map((deviceName) => (
    //       <option key={deviceName} value={deviceName}>{deviceName}</option>
    //     ))}
    //   </select>

    //   <br />

    //   <label htmlFor="baudRateSelect">Baud Rate:</label>
    //   <select id="baudRateSelect" value={baudRate} onChange={(e) => setBaudRate(Number(e.target.value))}>
    //     <option value="57600">57600</option>
    //     <option value="115200">115200</option>
    //     <option value="9600">9600</option>
    //     {/* Add more baud rates if needed */}
    //   </select>

    //   <br />

    //   <button onClick={handleConnect}>Connect</button>
    // </div>
    // <div>
    //   <label htmlFor="deviceSelect">Device:</label>
    //   <select id="deviceSelect" value={selectedDevice} onChange={(e) => setSelectedDevice(e.target.value)}>
    //     <option value="">telemetry</option>
    //     {deviceNames.map((deviceName) => (
    //       <option key={deviceName} value={deviceName}>{deviceName}</option>
    //     ))}
    //   </select>

    //   <br />

    //   <label htmlFor="baudRateSelect">Baud Rate:</label>
    //   <select id="baudRateSelect" value={baudRate} onChange={(e) => setBaudRate(Number(e.target.value))}>
    //     <option value="57600">57600</option>
    //     <option value="115200">115200</option>
    //     <option value="9600">9600</option>
    //     {/* Add more baud rates if needed */}
    //   </select>

    //   <br />

    //   <button onClick={handleConnect}>Connect</button>
    // </div>
    // </div>
//   );
// };

// export default USBconnection;
