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

  socket.on('init_pos', (initpos) => {
    
    io.emit('init_pos', initpos)

  })

  socket.on('gps', (data) => {

    gps_buffer.push(data);

    if (gps_buffer.length >= bufferSize) {
      
      console.log(gps_buffer);
  
      io.emit('gps', gps_buffer)
      gps_buffer = []
    }
  });

  socket.on('gps_est', (data) => {

    est_buffer.push(data);

    if (est_buffer.length >= bufferSize) {
      
      console.log(est_buffer);
      // saveBufferToDatabase(buffer)
      io.emit('gps_est', est_buffer)

      est_buffer = []
    }
  });

  socket.on('acs', (acs_data) => {

    console.log(acs_data)
    io.emit('acs', acs_data)
  })

  socket.on('arrowData', (arrow_Data) => { 
    io.emit('arrowData', arrow_Data)
    console.log(arrow_Data)
  });
  
  socket.on('telemetry-data', async (payload) => {
    try {
      const query = {
        text: 'INSERT INTO telemetry (Date, Latitude, Longitude, Altitude) VALUES ($1, $2, $3, $4)',
        values: [payload.tanggal, payload.gps_lat, payload.gps_lon, payload.gps_alt],
      };

      await pool.query(query);
      io.emit('telemetry-data', payload);

    } catch (error) {
      console.log("Error saving data to database")
    }
  });

  socket.on('fetchData', (date) => {
    pool.query(`SELECT * FROM gpstab WHERE date = '${date}'`, (err, result) => {
      
      if (err) {
        console.error('Error', err.stack);
      } else {
        socket.emit('data', result.rows);
        console.log(date);
      }
      
    });
  });

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
  const headers = ["Date", "Latitude", "Longitude", "Altitude"];
  const csvRows = [];

  csvRows.push(headers.join(","));

  for (const item of data) {
    const values = [item.date, item.latitude, item.longitude, item.altitude];
    csvRows.push(values.join(","));
  }
  return csvRows.join("\n");
}

function saveBufferToDatabase(buffer) {
 
  const query = 'INSERT INTO gpstab (date, latitude, longitude, altitude) VALUES ($1, $2, $3, $4)';

  buffer.forEach(row => {
    const dataToInsert = row.slice(0, -1);

    pool.query(query, dataToInsert)
      .then(() => console.log('Data inserted successfully'))
      .catch(error => console.error('Error inserting data:', error));
  });
}

server.listen(port, hostname, () => {
  console.log('listening on *:4000');
});   

// server.listen(4000, "0.0.0.0", () => {
//   console.log('listening on *:4000');
// });   