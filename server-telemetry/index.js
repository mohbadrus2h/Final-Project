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

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000"
  }

})

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "data_gps",
  password: "user",
  port: 5432,
})

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const bufferSize = 10;
let buffer = [];

io.on('connect', (socket) => {

  console.log('Client connected');
  
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
    
    console.log(initpos)
    io.emit('init_pos', initpos)

  })


  socket.on('gps', (data) => {

    buffer.push(data);

    if (buffer.length >= bufferSize) {
      
      console.log(buffer)
      io.emit('buffer', buffer)

      buffer = []
    }
  });

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
    pool.query(`SELECT * FROM value WHERE date = '${date}'`, (err, result) => {
      
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
      "SELECT * FROM value WHERE date = $1",
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

server.listen(4000, () => {
  console.log('listening on *:4000');
}); 