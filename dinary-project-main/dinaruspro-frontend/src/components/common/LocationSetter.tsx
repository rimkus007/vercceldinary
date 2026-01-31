"use client";

import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Correction pour l'icône par défaut de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

interface LocationSetterProps {
  initialPosition: [number, number];
  onPositionChange: (lat: number, lng: number) => void;
}

const LocationSetter: React.FC<LocationSetterProps> = ({
  initialPosition,
  onPositionChange,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialisation de la carte (une seule fois)
  useEffect(() => {
    if (containerRef.current && !mapRef.current) {
      const map = L.map(containerRef.current).setView(initialPosition, 15);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      const marker = L.marker(initialPosition, { draggable: true }).addTo(map);

      marker.on("dragend", () => {
        const { lat, lng } = marker.getLatLng();
        onPositionChange(lat, lng);
      });

      mapRef.current = map;
      markerRef.current = marker;
    }
  }, []);

  // Mise à jour de la position quand initialPosition change
  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      const newLatLng = L.latLng(initialPosition[0], initialPosition[1]);
      
      // Déplacer le marqueur vers la nouvelle position
      markerRef.current.setLatLng(newLatLng);
      
      // Centrer la carte sur la nouvelle position avec une animation
      mapRef.current.flyTo(newLatLng, 16, {
        duration: 1, // Durée de l'animation en secondes
        easeLinearity: 0.5,
      });
    }
  }, [initialPosition]);

  return (
    <div
      ref={containerRef}
      id="location-map"
      style={{
        height: "400px",
        width: "100%",
        borderRadius: "12px",
        zIndex: 0,
      }}
    />
  );
};

export default LocationSetter;
