import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import http from 'http'
import express from 'express'
import { Server } from 'socket.io'
import pkg from 'pg';
import cors from 'cors'
import fs from 'fs'
import { builtinModules } from 'module';

const { Pool } = pkg;
const app = express()
const server = http.createServer(app)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = 4000;
const hostname = '192.168.100.10';

const io = new Server(server, {
  cors: {
    origin: "*"
  }

})

app.get('/', (req, res) => {
  
  res.sendFile(__dirname + '/index.html');
});

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "gpslogger",
  password: "user",
  port: 5432,
})

pool.connect()
  .then(() => {
    console.log('Connected to the database');
  })
  .catch(error => console.error('Error connecting to the database:', error));

const bufferSize = 10;
let gps_buffer = [];
let est_buffer = [];
let usbDevices = [];
const connectedDevices = {};

let initialDataId = null;

io.on('connect', (socket) => {

  console.log('Client connected');

  socket.on('usb_devices', (usbDevices) => {
    socket.emit('usb_devices', usbDevices);
    console.log(usbDevices)
  });

  socket.on('new_usb_device', (data) => {
    const { port } = data;

    usbDevices.push(port);

    io.emit('usb_devices', usbDevices);

    console.log('New USB device connected:', port);
  });

  socket.on('usb_device_disconnected', (data) => {
    const { port } = data;

    usbDevices = usbDevices.filter((device) => device !== port);

    io.emit('usb_devices', usbDevices);

    console.log(usbDevices)
  })

  socket.on('connect_usb', ({ deviceType, device, baudRate }) => {

    console.log({ deviceType, device, baudRate })
    console.log(`Device ${device} connected for ${deviceType} with baud rate ${baudRate}.`);
    console.log('Emitting usb_connect event:', { deviceType, device, baudRate });

    io.emit('usb_connect', { deviceType, device, baudRate });
  });

  socket.on('disconnect_usb', ({ deviceType }) => {

    console.log(`Device disconnected for ${deviceType}.`);

    io.emit('usb_disconnect', { deviceType });
  });

  
  socket.on('selection', (selection) => {

    console.log('msg:', selection);

    if (socket.connected) {
      io.emit('selection', selection);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  // let detailedTime = null

  socket.on('init_pos', async(initpos) => {

    const currentTime = new Date();
    const timeString = currentTime.toLocaleTimeString();
    const seconds = currentTime.getSeconds();
    const milliseconds = currentTime.getMilliseconds();
    const detailedTime = `${seconds}.${milliseconds}`;

    console.log('server time(s):', detailedTime);

    io.emit('time', detailedTime)

    // io.emit('init_pos', initpos)
    
    try {
      // initialDataId = await insertInitialData(initpos)
      
    }catch (error) {
      console.error('Error inserting initial_data:', error);
    }
  })

  // io.emit('time', detailedTime)

  socket.on('gps', async(data) => {

    gps_buffer.push(data);

    if (gps_buffer.length >= bufferSize) {
      io.emit('gps', gps_buffer)
      // console.log(gps_buffer)
      try {

        if (initialDataId) {
          // await insertGPSData(gps_buffer, initialDataId);      
          gps_buffer = []
      }
    }catch (error) {
        console.error('Error inserting GPS data:', error);
      }
    }
  });

  socket.on('gps_est', async(data) => {
    est_buffer.push(data);

    if (est_buffer.length >= bufferSize) {
      io.emit('gps_est', est_buffer)
      // console.log(est_buffer)

      try {

        if (initialDataId) {
          // await insertEstData(est_buffer, initialDataId);
          
          est_buffer = []
      }
    }catch (error) {
        console.error('Error inserting estimated data:', error);
      }
    }
  });

  socket.on('thet', async(data) => {

    io.emit('thet', data)

    try {

      // console.log(data)
      if (initialDataId) {
        await insertThetData(data, initialDataId);
    }
  }catch (error) {
      console.error('Error inserting theta data:', error);
    }
  })

  socket.on('acs', (acs_data) => {

    console.log(acs_data)
    io.emit('acs', acs_data)
  })

  socket.on('arrowData', (arrow_Data) => { 
    io.emit('arrowData', arrow_Data)
    console.log(arrow_Data)
  });
  
  // socket.on('telemetry-data', async (payload) => {
  //   try {
  //     const query = {
  //       text: 'INSERT INTO telemetry (Date, Latitude, Longitude, Altitude) VALUES ($1, $2, $3, $4)',
  //       values: [payload.tanggal, payload.gps_lat, payload.gps_lon, payload.gps_alt],
  //     };

  //     await pool.query(query);
  //     io.emit('telemetry-data', payload);

  //   } catch (error) {
  //     console.log("Error saving data to database")
  //   }
  // });

  socket.on('fetchData', async (selectedDate) => {

    console.log(selectedDate)

    const query = `
    SELECT
      i.init_latitude, i.init_longitude, init_altitude,
      g.gps_latitude, g.gps_longitude, g.gps_altitude, g.color AS gps_color,
      e.est_latitude, e.est_longitude, e.est_altitude, e.color AS est_color
      
    FROM
      initial_data i
    LEFT JOIN
      gps_data g ON i.id = g.init_data_id
    LEFT JOIN
      estimated_data e ON g.id = e.gps_data_id
    
    WHERE
      i.date = $1
  `;
  
    try {
      const result = await pool.query(query, [selectedDate]);
      socket.emit('data', result.rows);
      console.log(result);
    } catch (err) {
      console.error('Error:', err.stack);
    }
  });
  

  // socket.on('fetchData', (date) => {
  //   pool.query(`SELECT * FROM gpstab WHERE date = '${date}'`, (err, result) => {
      
  //     if (err) {
  //       console.error('Error', err.stack);
  //     } else {
  //       socket.emit('data', result.rows);
  //       console.log(date);
  //     }
      
  //   });
  // });

  socket.on("downloadData", async (date) => {
    const result = await pool.query(
      "SELECT * FROM gpstab WHERE date = $1",
      [date],
    );
    const data = result.rows;

    const csvData = convertToCSV(data);
    const filename = `data-${date}.csv`;

    fs.writeFile(filename, csvData, (err) => {
      if (err) throw err;
      console.log(`File ${filename} saved`);
    });
  });

});

function convertToCSV(data) {
  const headers = ["Date", "GPS_Latitude", "GPS_Longitude", "GPS_Altitude", "Estimated_Latitude", "Estimated_Longitude", "Estimated_Alltitude", "Yaw", "Pitch"];
  const csvRows = [];

  csvRows.push(headers.join(","));

  for (const item of data) {
    const values = [item.date, item.gps_latitude, item.gps_longitude, item.gps_altitude, item.estimated_latitude, item.estimated_longitude, item.estimated_alltitude, item.yaw, item.pitch];
    csvRows.push(values.join(","));
  }
  return csvRows.join("\n");
}

async function insertInitialData(buffer) {
 
  const query = 'INSERT INTO initial_data (date, init_latitude, init_longitude, init_altitude) VALUES ($1, $2, $3, $4)';

  const values = buffer;

  try {
    await pool.query(query, values);
    const init_query = 'SELECT MAX(id) FROM initial_data';
    const result = await pool.query(init_query);

    return result.rows[0].max;

  } catch (error) {
    console.error('Error inserting initial_data:', error);
    throw error;
  }
}

async function insertGPSData(buffer, initialId) {
  const insertQuery = 'INSERT INTO gps_data (gps_latitude, gps_longitude, gps_altitude, color, init_data_id) VALUES ($1, $2, $3, $4, $5)';

  try {
    for (const gpsData of buffer) {

      const gpsValues = [gpsData[0], gpsData[1], gpsData[2], gpsData[3], initialId];
      await pool.query(insertQuery, gpsValues);
      
      console.log('GPS data inserted successfully');

    }
  } catch (error) {
    console.error('Error inserting GPS data:', error);
    throw error;
  }
}


// function insertGPSData(buffer, init_id) {
 
//   const query = 'INSERT INTO gps_data (date, gps_latitude, gps_longitude, gps_altitude, color, init_data_id) VALUES ($1, $2, $3, $4, $5)';

//   // buffer.forEach(row => {
//   //   const dataToInsert = row.slice(0, -1);

//   if (buffer.length !== 4) {
//     console.error('Invalid number of values in the buffer.');
//     return;
//   }

//     pool.query(query, buffer)
//       .then(() => console.log('Data inserted successfully'))
//       .catch(error => console.error('Error inserting data:', error));
//   // });
// }

async function insertEstData(buffer, initialId) {
 
  const query = 'INSERT INTO estimated_data (est_latitude, est_longitude, est_altitude, color, gps_data_id) VALUES ($1, $2, $3, $4, $5)';

  try {
    for (const estData of buffer) {

      const estValues = [estData[0], estData[1], estData[2], estData[3], initialId];
      await pool.query(query, estValues);
      
      console.log('estimated_data inserted successfully');

    }
  } catch (error) {
    console.error('Error inserting estimated data:', error);
    throw error;
  }
}

async function insertThetData(buffer, initialId) {
 
  const query = 'INSERT INTO theta_data (yaw, pitch, estimated_data_id) VALUES ($1, $2, $3)';
  
  try {

      const thetValues = [buffer[0], buffer[1], initialId];
      await pool.query(query, thetValues);
      
      console.log('theta data inserted successfully');

  } catch (error) {
    console.error('Error inserting theta data:', error);
    throw error;
  }
}

// function saveBufferToDatabase(buffer) {
 
//   const query = 'INSERT INTO gpstab (date, gps_latitude, gps_longitude, gps_altitude, estimated_latitude, estimated_longitude, estimated_alltitude, yaw, pitch) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)';

//   buffer.forEach(row => {
//     const dataToInsert = row.slice(0, -1);

//     pool.query(query, dataToInsert)
//       .then(() => console.log('Data inserted successfully'))
//       .catch(error => console.error('Error inserting data:', error));
//   });
// }

server.listen(port, hostname, () => {
  console.log('listening on *:4000');
});