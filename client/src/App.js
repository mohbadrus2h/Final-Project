import React, { useEffect, useRef, useState } from 'react';
import {BrowserRouter, Router, Route, Routes} from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js'
import io, { Socket } from 'socket.io-client'
import Mode from './components/mode/DropdownList'
import Map from './components/sensor_page/map';
import Sensor from './components/sensor_page/Sensor';
// import ManualButton from './components/ArrowButtonsPage'
import Database from './components/database_page/Database';

import './App.css';

const socket = io.connect("http://localhost:4000");

function App() {

  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/main" /> */}
        <Route path="/map" element={<Map/>}/>
        <Route path="/main" element={<Sensor socket={socket} />} />
        <Route path="/mode" element={<Mode socket={socket} />} />
        <Route path='/search-data' element={<Database socket={socket} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

// import React, { useState } from "react";
// import io from "socket.io-client";

// const socket = io("http://localhost:4000");

// function App() {
//   const [date, setDate] = useState("");
//   const [data, setData] = useState([]);

//   const handleSearch = () => {
//     socket.emit("fetchData", date);
//   };

//   socket.on("data", (result) => {
//     setData(result);
//   });

//   return (
//     <div>
//       <input
//         type="date"
//         value={date}
//         onChange={(e) => setDate(e.target.value)}
//       />
//       <button onClick={handleSearch}>Search</button>
//       <table>
//         <thead>
//           <tr>
//             <th>ID</th>
//             <th>Date</th>
//             <th>Latitude</th>
//             <th>Longitude</th>
//             <th>Altitude</th>
//           </tr>
//         </thead>
//         <tbody>
//           {data.map((item) => (
//             <tr key={item.id}>
//               <td>{item.id}</td>
//               <td>{item.date}</td>
//               <td>{item.latitude}</td>
//               <td>{item.longitude}</td>
//               <td>{item.altitude}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// export default App;
