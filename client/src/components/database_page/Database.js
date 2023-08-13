import React, { useState } from 'react';

const Database = ({ socket }) => {
  const [date, setDate] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleDownload = () => {
    setLoading(true);
    socket.emit("downloadData", date);
    socket.on("downloadComplete", () => {
      setLoading(false);
    });
  }

  const handleSearch = () => {
    socket.emit("fetchData", date);
    console.log(date)
  };

  socket.on("data", (result) => {
    setData(result);
    // console.log(result);

  });

  return (
    <div>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
      <button onClick={handleDownload} disabled={!date || loading}>
        {loading ? "Downloading..." : "Download Data"}
      </button>
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Initial Latitude</th>
            <th scope="col">Initial Longitude</th>
            <th scope="col">Initial Altitude</th>
            <th scope="col">GPS Latitude</th>
            <th scope="col">GPS Longitude</th>
            <th scope="col">GPS Altitude</th>
            <th scope="col">Estimated Latitude</th>
            <th scope="col">Estimated Longitude</th>
            <th scope="col">Estimated Alltitude</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            // console.log(item) 
            <tr key={item.gps_latitude}>
              <td>{item.init_latitude}</td>
              <td>{item.init_longitude}</td>
              <td>{item.init_altitude}</td>
              <td>{item.gps_latitude}</td>
              <td>{item.gps_longitude}</td>
              <td>{item.gps_altitude}</td>
              <td>{item.est_latitude}</td>
              <td>{item.est_longitude}</td>
              <td>{item.est_altitude}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Database;
