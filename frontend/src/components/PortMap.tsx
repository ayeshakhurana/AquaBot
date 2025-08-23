import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { API_ENDPOINTS } from '../utils/api';

const PortMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const [tileTemplate, setTileTemplate] = useState<string | null>(null);

  useEffect(() => {
    // Fetch public config for tile template
    fetch(API_ENDPOINTS.config)
      .then((r) => r.json())
      .then((cfg) => setTileTemplate(cfg.maptilerTileUrlTemplate || null))
      .catch(() => setTileTemplate(null));
  }, []);

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    // Initialize map centered on Singapore
    const map = L.map(mapRef.current).setView([1.2905, 103.8520], 5);
    leafletMapRef.current = map;

    // Add tiles (MapTiler if available, else OSM)
    const url = tileTemplate || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const attribution = tileTemplate
      ? '© MapTiler © OpenStreetMap contributors'
      : '© OpenStreetMap contributors';

    L.tileLayer(url, {
      attribution,
      maxZoom: 19
    }).addTo(map);

    // Marker for Singapore
    L.marker([1.2905, 103.8520]).addTo(map).bindPopup('Singapore');

    return () => {
      map.remove();
      leafletMapRef.current = null;
    };
  }, [tileTemplate]);

  return (
    <div className="w-full h-64 rounded-md border border-gray-200 overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};

export default PortMap; 