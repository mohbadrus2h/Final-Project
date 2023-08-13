import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const Map = ({ gps_buffer, est_buffer }) => {
  const mapContainerRef = useRef(null);
  const gps_polylineRef = useRef(null);
  const est_polylineRef = useRef(null);

  useEffect(() => {

    if (!gps_buffer || gps_buffer.length === 0) return;
    if (!est_buffer || est_buffer.length === 0) return;
    
    const map = L.map(mapContainerRef.current).setView([gps_buffer[0][1], gps_buffer[0][2]], 20);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    const gps_filteredBuffer = gps_buffer.filter(point => point[1] !== 0 || point[2] !== 0);
    const est_filteredBuffer = est_buffer.filter(point => point[1] !== 0 || point[2] !== 0);

    if (gps_filteredBuffer.length === 0) return;

    const gps_latLngs = gps_buffer.map(point => [point[1], point[2]]);
    const gps_color = gps_buffer.map(point => point[6]);
    
    if (est_filteredBuffer.length === 0) return;
    const est_latLngs = est_buffer.map(point => [point[1], point[2]]);
    const est_color = est_buffer.map(point => point[4]);

    console.log(gps_buffer)

    const gps_polylineOptions = {
      color: gps_color[0],
      weight: 3,
    };

    const est_polylineOptions = {
      color: est_color[0],
      weight: 3,
    };

    gps_polylineRef.current = L.polyline(gps_latLngs, gps_polylineOptions).addTo(map);
    est_polylineRef.current = L.polyline(est_latLngs, est_polylineOptions).addTo(map);

    map.fitBounds(gps_polylineRef.current.getBounds());
    map.fitBounds(est_polylineRef.current.getBounds());

    const addLegendToMap = (map) => {
      const legendControl = L.control({ position: 'topright' });

      legendControl.onAdd = () => {
        const legendDiv = L.DomUtil.create('div', 'legend');
        const legendContent = `
        <div class="legend-item">
            <div class="legend-color" style="background-color: ${gps_color[0]}"></div>
            <div class="legend-label">GPS Buffer</div>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background-color: ${est_color[0]}"></div>
            <div class="legend-label">Estimation Buffer</div>
          </div>
        `;
        legendDiv.innerHTML = legendContent;
        return legendDiv;
      };

      legendControl.addTo(map);
    };

    addLegendToMap(map);

    return () => {
      map.remove();
    };
  }, [est_buffer], [gps_buffer]);

  useEffect(() => {

    if (gps_polylineRef.current && gps_buffer) {
      const gps_latLngs = gps_buffer.map(point => [point[1], point[2]]);
      gps_polylineRef.current.setLatLngs(gps_latLngs);
    }

    if (est_polylineRef.current && est_buffer) {
      const est_latLngs = est_buffer.map(point => [point[1], point[2]]);
      est_polylineRef.current.setLatLngs(est_latLngs);
    }
  }, [est_buffer], [gps_buffer]);

  // useEffect(() => {

  //   if (!est_buffer || est_buffer.length === 0) return;

  //   const est_filteredBuffer = est_buffer.filter(point => point[1] !== 0 || point[2] !== 0);

  //   if (est_filteredBuffer.length === 0) return;

  //   const est_map = L.map(mapContainerRef.current).setView([est_buffer[0][1], est_buffer[0][2]], 20);

  //   L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(est_map);

  //   const est_latLngs = est_buffer.map(point => [point[1], point[2]]);
  //   const est_color = est_buffer.map(point => point[4]);

  //   // console.log(est_latLngs)

  //   console.log(est_color[0])

  //   const polylineOptions = {
  //     color: est_color[0],
  //     weight: 3,
  //   };
  //   polylineRef.current = L.polyline(est_latLngs, polylineOptions).addTo(est_map);
    
  //   est_map.fitBounds(polylineRef.current.getBounds());

  //   return () => {
  //     est_map.remove();
  //   };
  // }, [est_buffer]);

  // useEffect(() => {

  //   if (polylineRef.current && est_buffer) {
  //     const est_latLngs = est_buffer.map(point => [point[1], point[2]]);
  //     polylineRef.current.setLatLngs(est_latLngs);
  //   }
  // }, [est_buffer]);

  return <div ref={mapContainerRef} style={{ height: '450px' }} />;
};

export default Map;
