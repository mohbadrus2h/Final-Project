import React, { useEffect, useRef, useState } from 'react';
import DropdownList from '../mode/DropdownList';
import ArrowButton from '../mode/ArrowButton'
import Map from './map';

import './Sensor.css';

const Sensor = ({ socket }) => {

  // const [curpos, setCurpos] = useState([]);
  const [initpoint, setInitpoint] = useState([])

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

  const [data, setData] = useState([]);
  const [dataIndex, setDataIndex] = useState(0);
  const [bufferTimestamp, setBufferTimestamp] = useState(null);

  const [selectedMode, setSelectedMode] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const handleModeChange = (mode) => {
    setSelectedMode(mode);
    console.log(mode)
  };

  socket.on('init_pos', (initpos) => {
    setInitpoint(initpos)
    // console.log(initpos)
  })

  console.log(isConnected)

  useEffect(() => {

    const handleBuffer = (buffer) => {
      setData(buffer);
    };

    socket.on('buffer', handleBuffer);

    return () => {
      socket.off('buffer', handleBuffer);
    };
  }, [socket]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (data.length > 0) {
        setDataIndex((prevIndex) => (prevIndex + 1) % data.length);
        // console.log(data);
      }
    }, 1000);
  
    return () => clearTimeout(timeout);
  }, [dataIndex, data]);

  const curpos = data[dataIndex] || [];

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
      {/* <div className="grid-item-1"><Map init_alt = {init_altVal} init_lon = {init_lonVal}/></div> */}
      {/* <div className="grid-item-1"><Map socket={socket} buffer={data}/></div> */}
      <div className="grid-item-1"><Map buffer={data}/></div>
      <div className="grid-item-1"></div>
      {/* <div className="grid-item-1"></div> */}
      <div className="grid-item-2">
        <div className="gridChild-item-Side">
          <div className="gridChild-item-1  gridchild-title"><DropdownList socket={socket} onModeChange={handleModeChange}/></div>
        </div>
        <div className="">
          <div className=""><ArrowButton socket={socket} selectedMode={selectedMode} isConnected={isConnected}/></div>
        </div>
        {/* <div className="gridChild-item-Side"> */}
          {/* <div className="gridChild-item-1  gridchild-title"><ArrowButton socket={socket} /></div> */}
        {/* </div> */}
        {/* <div className="gridChild-item-Side">
          <div className="gridChild-item-1  gridchild-title"><p>ANTENA TRACKER</p></div>
          <div className="item-side-col1"><p>longitude</p></div>
          <div className="item-side-col2"><p className='val-color'>{init_lonVal}</p></div>
          <div className="item-side-col1"><p>latitude</p></div>
          <div className="item-side-col2"><p className='val-color'>{init_latVal}</p></div>
          <div className="item-side-col1"><p>altitude</p></div>
          <div className="item-side-col2"><p className='val-color'>{init_altVal}</p></div>
        </div> */}
        {/* <div className="gridChild-item-Side"><ArrowButton /></div> */}
        <div className="gridChild-item-Side">
          <div className="gridChild-item-1 gridchild-title"><p>PAYLOAD</p></div>
          <div className="item-side-col1"><p>longitude</p></div>
          <div className="item-side-col2"><p className='val-color'>{curpos[1]}</p></div>
          <div className="item-side-col1"><p>latitude</p></div>
          <div className="item-side-col2"><p className='val-color'>{curpos[2]}</p></div>
          <div className="item-side-col1"><p>altitude</p></div>
          <div className="item-side-col2"><p className='val-color'>{curpos[3]}</p></div>
          <div className="item-side-col1"><p>wind dir</p></div>
          <div className="item-side-col2"><p className='val-color'></p></div>
          <div className="item-side-col1"><p>velocity</p></div>
          <div className="item-side-col2"><p className='val-color'></p></div>
        </div>
      </div>
      <div className="grid-item-3">
        {/* <div className="gridChild-item-bot">
          <div className="gridChild-item-1 gridchild-title"><p>GEOMETRI</p></div>
          <div className="item-bot-col1"><p>roll (x)</p>
            <p className='val-color'>{rolVal}</p>
          </div>
          <div className="item-bot-col2"><p>pitch (y)</p>
            <p className='val-color'>{pitchVal}</p>
          </div>
        </div> */}
        <div className="gridChild-item-Side">
          <div className="gridChild-item-1  gridchild-title"><p>GEOMETRI</p></div>
          <div className="item-side-col1"><p>roll</p></div>
          <div className="item-side-col2"><p className='val-color'>{rolVal}</p></div>
          <div className="item-side-col1"><p>pitch</p></div>
          <div className="item-side-col2"><p className='val-color'>{pitchVal}</p></div>
        </div>
        {/* <div className="gridChild-item-bot">
          <div className="gridChild-item-1 gridchild-title"><p>MOTOR 1</p></div>
          <div className="item-bot-col1"><p>voltage</p>
            <p className='val-color'>{voltVal_1}</p></div>
          <div className="item-bot-col2"><p>current</p>
            <p className='val-color'>{currVal_1}</p></div>
        </div> */}
        {/* <div className="gridChild-item-bot">
          <div className="gridChild-item-1 gridchild-title"><p>MOTOR 2</p></div>
          <div className="item-bot-col1"><p>voltage</p></div>
          <div className="item-bot-col1"><p>current</p></div>
            <p className='item-bot-col2 val-color'>{currVal_2}</p>
            <p className='item-bot-col2 val-color'>{voltVal_2}</p>
        </div> */}

        <div className="gridChild-item-Side">
          <div className="gridChild-item-1  gridchild-title"><p>MOTOR 1 : 2</p></div>
          <div className="item-side-col1"><p>voltage (v)</p></div>
          <div className="item-side-col2"><p className='val-color'>{voltVal_1} : {voltVal_2}</p></div>
          <div className="item-side-col1"><p>current (mA)</p></div>
          <div className="item-side-col2"><p className='val-color'>{currVal_1} : {currVal_2}</p></div>
        </div>
        {/* <div className="gridChild-item-bot"> */}
        <div className="gridChild-item-Side">
          <div className="gridChild-item-1  gridchild-title"><p>ANTENA TRACKER</p></div>
          <div className="item-side-col1"><p>longitude</p></div>
          <div className="item-side-col2"><p className='val-color'>{initpoint[0]}</p></div>
          <div className="item-side-col1"><p>latitude</p></div>
          <div className="item-side-col2"><p className='val-color'>{initpoint[1]}</p></div>
          <div className="item-side-col1"><p>altitude</p></div>
          <div className="item-side-col2"><p className='val-color'>{initpoint[2]}</p></div>
        </div>
        {/* </div> */}
        <div className="gridChild-item-Side">
          <div className="gridChild-item-1 gridchild-title"><p>PAYLOAD</p></div>
          <div className="item-side-col1"><p>longitude</p></div>
          <div className="item-side-col2"><p className='val-color'>{lonVal}</p></div>
          <div className="item-side-col1"><p>latitude</p></div>
          <div className="item-side-col2"><p className='val-color'>{latVal}</p></div>
          <div className="item-side-col1"><p>altitude</p></div>
          <div className="item-side-col2"><p className='val-color'>{altVal}</p></div>
          {/* <div className="item-side-col1"><p>wind dir</p></div>
          <div className="item-side-col2"><p className='val-color'></p></div>
          <div className="item-side-col1"><p>velocity</p></div>
          <div className="item-side-col2"><p className='val-color'></p></div> */}
        </div>
      </div>
    </div>

  );
}

export default Sensor;