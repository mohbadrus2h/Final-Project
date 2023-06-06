import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const Map = ({ buffer }) => {
  const mapContainerRef = useRef(null);
  const polylineRef = useRef(null);

  useEffect(() => {
    if (!buffer || buffer.length === 0) return;

    const map = L.map(mapContainerRef.current).setView([buffer[0][1], buffer[0][2]], 20);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    const latLngs = buffer.map(point => [point[1], point[2]]);
    const color = buffer[0][4];

    // console.log(color)

    const polylineOptions = {
      color: color,
      weight: 3,
    };
    polylineRef.current = L.polyline(latLngs, polylineOptions).addTo(map);
    
    map.fitBounds(polylineRef.current.getBounds());

    return () => {
      map.remove();
    };
  }, [buffer]);

  useEffect(() => {
    if (polylineRef.current && buffer) {
      const latLngs = buffer.map(point => [point[1], point[2]]);
      polylineRef.current.setLatLngs(latLngs);
    }
  }, [buffer]);

  return <div ref={mapContainerRef} style={{ height: '450px' }} />;
};

export default Map;
