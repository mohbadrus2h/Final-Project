import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DropdownList from '../mode/DropdownList';
import ArrowButton from '../mode/ArrowButton';
import USBconnection from '../mode/USBconnection';
import Map from './map';

import './Sensor.css';

const Sensor = ({ socket }) => {

  // const [curpos, setCurpos] = useState([]);
  const navigate = useNavigate();
  const [initpoint, setInitpoint] = useState([])
  const [acsval, setAcsval] = useState([])

  const [rolVal, setrolVal] = useState(0);
  const [pitchVal, setpitchVal] = useState(0);
  const [voltVal_1, setvoltVal_1] = useState(0);
  const [voltVal_2, setvoltVal_2] = useState(0);
  const [currVal_1, setcurrVal_1] = useState(0);
  const [currVal_2, setcurrVal_2] = useState(0);
  const [init_lonVal, set_init_lonVal] = useState(0)
  const [init_latVal, set_init_latVal] = useState(0)
  const [init_altVal, set_init_altVal] = useState(0)
  const [lonVal, setlonVal] = useState(0)
  const [latVal, setlatVal] = useState(0)
  const [altVal, setaltVal] = useState(0)

  const [gpsData, setGPSData] = useState([]);
  const [estData, setESTData] = useState([]);
  const [gpsDataIndex, setGPSDataIndex] = useState(0);
  const [estDataIndex, setESTDataIndex] = useState(0);

  const [bufferTimestamp, setBufferTimestamp] = useState(null);
  const [buttonPressed, setButtonPressed] = useState(false);

  const [selectedMode, setSelectedMode] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const handleButtonClick = () => {
    setButtonPressed(true);
    navigate('/search-data');
  };

  // console.log(selectedMode)

  const handleModeChange = (mode) => {
    setSelectedMode(mode);
    console.log(mode)
  };

  socket.on('init_pos', (initpos) => {
    setInitpoint(initpos)
    // console.log(initpos)
  })

  socket.on('acs', (acs_data) => {
    // console.log(acs_data)
    setAcsval(acs_data)
  })

  // console.log(isConnected)
// 
  // console.log(selectedMode)

  useEffect(() => {

    const handleConnect = () => {
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleGPSBuffer = (buffer) => {
      setGPSData(buffer);
    };

    const handleESTBuffer = (buffer) => {
      setESTData(buffer);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    socket.on('gps', handleGPSBuffer);
    socket.on('gps_est', handleESTBuffer);

    return () => {

      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect)

      socket.off('gps', handleGPSBuffer);
      socket.off('gps_est', handleESTBuffer);
    };
  }, [socket]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (gpsData.length > 0) {
        setGPSDataIndex((prevIndex) => (prevIndex + 1) % gpsData.length);
        // console.log(data);
      }
    }, 1000);
  
    return () => clearTimeout(timeout);
  }, [gpsDataIndex, gpsData]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (estData.length > 0) {
        setESTDataIndex((prevIndex) => (prevIndex + 1) % estData.length);
        // console.log(data);
      }
    }, 1000);
  
    return () => clearTimeout(timeout);
  }, [estDataIndex, estData]);

  const gps_point = gpsData[gpsDataIndex] || [];

  // console.log(gps_point[6])

  // useEffect(() => {
  //   console.log(curpos);
  // }, [curpos]);



  // const curpos = data[dataIndex];

  
  // socket.on('buffer', (buffer) => {
  //   setCurpos(buffer[0])
    
  // })
    // console.log(curpos[2])
  // socket.on('telemetry-data', (arg1, arg2) => {
  //   setrolVal(0)
  //   setpitchVal(0)
  //   setvoltVal_1(0)
  //   setcurrVal_1(0)
  //   setvoltVal_2(0)
  //   setcurrVal_2(0)
  //   set_init_lonVal(arg2.lon)
  //   set_init_latVal(arg2.lat)
  //   set_init_altVal(arg2.alt)
  //   setlonVal(arg1.lon)
  //   setlatVal(arg1.lat)
  //   setaltVal(arg1.alt)
  // });

  return (
    <div className="grid-container background-image">
      {/* <div className="grid-item-1"><Map socket={socket} buffer={data}/></div> */}
      <div className="grid-item-1"><Map gps_buffer={gpsData} est_buffer={estData}/></div>
      <div className="grid-item-1"></div>
      <div className="grid-item-2">
        <div className="gridChild-item-Side">
          <div className="gridChild-item-1  gridchild-title"><DropdownList socket={socket} onModeChange={handleModeChange}/></div>
        </div>
          <button onClick={handleButtonClick}>Database</button>
          <div className='gridChild-item-1'>
            <USBconnection socket={socket}/>
          </div>
        <ArrowButton socket={socket} selectedMode={selectedMode} isConnected={isConnected}/>
      </div>
      <div className="grid-item-3">
        <div className="gridChild-item-Side">
          <div className="gridChild-item-1  gridchild-title"><p>GEOMETRI</p></div>
          <div className="item-side-col1"><p>yaw</p></div>
          <div className="item-side-col2"><p className='val-color'>{gps_point[4]}</p></div>
          <div className="item-side-col1"><p>pitch</p></div>
          <div className="item-side-col2"><p className='val-color'>{gps_point[5]}</p></div>
        </div>
        {/* <div className="gridChild-item-Side">
          <div className="gridChild-item-1  gridchild-title"><p>CURRENT (mA)</p></div>
          <div className="item-side-col1"><p>supply</p></div>
          <div className="item-side-col2"><p className='val-color'>{acsval[0]}</p></div>
          <div className="item-side-col1"><p>motor 1</p></div>
          <div className="item-side-col2"><p className='val-color'>{acsval[1]}</p></div>
          <div className="item-side-col1"><p>motor 2</p></div>
          <div className="item-side-col2"><p className='val-color'>{acsval[2]}</p></div>
        </div> */}
        <div className="gridChild-item-Side">
          <div className="gridChild-item-1  gridchild-title"><p>ANTENA TRACKER</p></div>
          <div className="item-side-col1"><p>longitude</p></div>
          <div className="item-side-col2"><p className='val-color'>{initpoint[0]}</p></div>
          <div className="item-side-col1"><p>latitude</p></div>
          <div className="item-side-col2"><p className='val-color'>{initpoint[1]}</p></div>
          <div className="item-side-col1"><p>altitude</p></div>
          <div className="item-side-col2"><p className='val-color'>{initpoint[2]}</p></div>
        </div>
        <div className="gridChild-item-Side">
          <div className="gridChild-item-1 gridchild-title"><p>PAYLOAD</p></div>
          <div className="item-side-col1"><p>longitude</p></div>
          <div className="item-side-col2"><p className='val-color'>{gps_point[1]}</p></div>
          <div className="item-side-col1"><p>latitude</p></div>
          <div className="item-side-col2"><p className='val-color'>{gps_point[2]}</p></div>
          <div className="item-side-col1"><p>altitude</p></div>
          <div className="item-side-col2"><p className='val-color'>{gps_point[3]}</p></div>
        </div>
      </div>
    </div>

  );
}

export default Sensor;

// return (
//   <div className="grid-container background-image">
//     {/* <div className="grid-item-1"><Map init_alt = {init_altVal} init_lon = {init_lonVal}/></div> */}
//     {/* <div className="grid-item-1"><Map socket={socket} buffer={data}/></div> */}
//     <div className="grid-item-1"><Map buffer={data}/></div>
//     <div className="grid-item-1"></div>
//     {/* <div className="grid-item-1"></div> */}
//     <div className="grid-item-2">
//       <div className="gridChild-item-Side">
//         <div className="gridChild-item-1  gridchild-title"><DropdownList socket={socket} onModeChange={handleModeChange}/></div>
//       </div>
//       <Link to="/database">
//         <button >Go to Database</button>
//     </Link>
//       <ArrowButton socket={socket} selectedMode={selectedMode} isConnected={isConnected}/>
//       {/* <div className="gridChild-item-Side"> */}
//         {/* <div className="gridChild-item-1  gridchild-title"><ArrowButton socket={socket} /></div> */}
//       {/* </div> */}
//       {/* <div className="gridChild-item-Side">
//         <div className="gridChild-item-1  gridchild-title"><p>ANTENA TRACKER</p></div>
//         <div className="item-side-col1"><p>longitude</p></div>
//         <div className="item-side-col2"><p className='val-color'>{init_lonVal}</p></div>
//         <div className="item-side-col1"><p>latitude</p></div>
//         <div className="item-side-col2"><p className='val-color'>{init_latVal}</p></div>
//         <div className="item-side-col1"><p>altitude</p></div>
//         <div className="item-side-col2"><p className='val-color'>{init_altVal}</p></div>
//       </div> */}
//       {/* <div className="gridChild-item-Side"><ArrowButton /></div> */}
      
//       {/* data */}
//       {/* <div className="gridChild-item-Side">
//         <div className="gridChild-item-1 gridchild-title"><p>PAYLOAD</p></div>
//         <div className="item-side-col1"><p>longitude</p></div>
//         <div className="item-side-col2"><p className='val-color'>{curpos[1]}</p></div>
//         <div className="item-side-col1"><p>latitude</p></div>
//         <div className="item-side-col2"><p className='val-color'>{curpos[2]}</p></div>
//         <div className="item-side-col1"><p>altitude</p></div>
//         <div className="item-side-col2"><p className='val-color'>{curpos[3]}</p></div>
//         <div className="item-side-col1"><p>wind dir</p></div>
//         <div className="item-side-col2"><p className='val-color'></p></div>
//         <div className="item-side-col1"><p>velocity</p></div>
//         <div className="item-side-col2"><p className='val-color'></p></div>
//       </div> */}
//     </div>
//     <div className="grid-item-3">
//       {/* <div className="gridChild-item-bot">
//         <div className="gridChild-item-1 gridchild-title"><p>GEOMETRI</p></div>
//         <div className="item-bot-col1"><p>roll (x)</p>
//           <p className='val-color'>{rolVal}</p>
//         </div>
//         <div className="item-bot-col2"><p>pitch (y)</p>
//           <p className='val-color'>{pitchVal}</p>
//         </div>
//       </div> */}
//       <div className="gridChild-item-Side">
//         <div className="gridChild-item-1  gridchild-title"><p>GEOMETRI</p></div>
//         <div className="item-side-col1"><p>roll</p></div>
//         <div className="item-side-col2"><p className='val-color'>{rolVal}</p></div>
//         <div className="item-side-col1"><p>pitch</p></div>
//         <div className="item-side-col2"><p className='val-color'>{pitchVal}</p></div>
//       </div>
//       {/* <div className="gridChild-item-bot">
//         <div className="gridChild-item-1 gridchild-title"><p>MOTOR 1</p></div>
//         <div className="item-bot-col1"><p>voltage</p>
//           <p className='val-color'>{voltVal_1}</p></div>
//         <div className="item-bot-col2"><p>current</p>
//           <p className='val-color'>{currVal_1}</p></div>
//       </div> */}
//       {/* <div className="gridChild-item-bot">
//         <div className="gridChild-item-1 gridchild-title"><p>MOTOR 2</p></div>
//         <div className="item-bot-col1"><p>voltage</p></div>
//         <div className="item-bot-col1"><p>current</p></div>
//           <p className='item-bot-col2 val-color'>{currVal_2}</p>
//           <p className='item-bot-col2 val-color'>{voltVal_2}</p>
//       </div> */}

//       <div className="gridChild-item-Side">
//         <div className="gridChild-item-1  gridchild-title"><p>MOTOR 1 : 2</p></div>
//         <div className="item-side-col1"><p>voltage (v)</p></div>
//         <div className="item-side-col2"><p className='val-color'>{voltVal_1} : {voltVal_2}</p></div>
//         <div className="item-side-col1"><p>current (mA)</p></div>
//         <div className="item-side-col2"><p className='val-color'>{currVal_1} : {currVal_2}</p></div>
//       </div>
//       {/* <div className="gridChild-item-bot"> */}
//       <div className="gridChild-item-Side">
//         <div className="gridChild-item-1  gridchild-title"><p>ANTENA TRACKER</p></div>
//         <div className="item-side-col1"><p>longitude</p></div>
//         <div className="item-side-col2"><p className='val-color'>{initpoint[0]}</p></div>
//         <div className="item-side-col1"><p>latitude</p></div>
//         <div className="item-side-col2"><p className='val-color'>{initpoint[1]}</p></div>
//         <div className="item-side-col1"><p>altitude</p></div>
//         <div className="item-side-col2"><p className='val-color'>{initpoint[2]}</p></div>
//       </div>
//       {/* </div> */}
//       <div className="gridChild-item-Side">
//         <div className="gridChild-item-1 gridchild-title"><p>PAYLOAD</p></div>
//         <div className="item-side-col1"><p>longitude</p></div>
//         <div className="item-side-col2"><p className='val-color'>{lonVal}</p></div>
//         <div className="item-side-col1"><p>latitude</p></div>
//         <div className="item-side-col2"><p className='val-color'>{latVal}</p></div>
//         <div className="item-side-col1"><p>altitude</p></div>
//         <div className="item-side-col2"><p className='val-color'>{altVal}</p></div>
//         {/* <div className="item-side-col1"><p>wind dir</p></div>
//         <div className="item-side-col2"><p className='val-color'></p></div>
//         <div className="item-side-col1"><p>velocity</p></div>
//         <div className="item-side-col2"><p className='val-color'></p></div> */}
//       </div>
//     </div>
//   </div>

// );
// }

// export default Sensor;

