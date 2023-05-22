import React, { useState } from 'react';

const Database = ({socket}) => {
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
  };

  socket.on("data", (result) => {
    setData(result);
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
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Latitude</th>
            <th>Longitude</th>
            <th>Altitude</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td>{item.date}</td>
              <td>{item.latitude}</td>
              <td>{item.longitude}</td>
              <td>{item.altitude}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Database;
