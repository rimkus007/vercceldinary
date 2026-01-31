"use client";
import React, { useEffect, useRef } from 'react';
import { SanitizeService } from '../../lib/sanitize';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MerchantData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  category: string;
  totalRevenue: number;
  transactionAmount: number;
  transactionCount: number;
}

interface HeatmapMapProps {
  data: MerchantData[];
}

export default function HeatmapMap({ data }: HeatmapMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || data.length === 0) return;

    // Initialize map
    const map = L.map(mapContainerRef.current).setView([36.7538, 3.0588], 10); // Alger coordinates
    mapRef.current = map;

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Create custom icons for different categories
    const createCategoryIcon = (category: string, revenue: number) => {
      const colors = {
        'restaurants': '#e74c3c',
        'shopping': '#3498db',
        'services': '#2ecc71',
        'entertainment': '#f39c12',
        'health': '#9b59b6',
        'education': '#1abc9c',
        'transport': '#34495e',
        'other': '#95a5a6'
      };

      const color = colors[category as keyof typeof colors] || colors.other;
      const size = Math.max(20, Math.min(40, revenue / 1000)); // Size based on revenue

      return L.divIcon({
        html: `<div style="
          width: ${size}px;
          height: ${size}px;
          background-color: ${color};
          border: 2px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${size * 0.4}px;
          color: white;
          font-weight: bold;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ">${category.charAt(0).toUpperCase()}</div>`,
        className: 'custom-marker',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });
    };

    // Add markers for each merchant
    data.forEach((merchant) => {
      if (merchant.latitude && merchant.longitude) {
        const icon = createCategoryIcon(merchant.category, merchant.transactionAmount);
        
        const marker = L.marker([merchant.latitude, merchant.longitude], { icon })
          .addTo(map);

        // Create popup content
        const popupContent = `
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; color: #2c3e50;">${merchant.name}</h3>
            <div style="margin-bottom: 4px;">
              <strong>Catégorie:</strong> ${merchant.category}
            </div>
            <div style="margin-bottom: 4px;">
              <strong>Revenus totaux:</strong> ${merchant.totalRevenue.toLocaleString()} DZD
            </div>
            <div style="margin-bottom: 4px;">
              <strong>Volume transactions:</strong> ${merchant.transactionAmount.toLocaleString()} DZD
            </div>
            <div style="margin-bottom: 4px;">
              <strong>Nombre de transactions:</strong> ${merchant.transactionCount}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
      }
    });

    // Fit map to show all markers
    if (data.length > 0) {
      const group = new L.featureGroup();
      data.forEach((merchant) => {
        if (merchant.latitude && merchant.longitude) {
          group.addLayer(L.marker([merchant.latitude, merchant.longitude]));
        }
      });
      map.fitBounds(group.getBounds().pad(0.1));
    }

    // Add legend
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = function (map) {
      const div = L.DomUtil.create('div', 'legend');
      div.style.cssText = `
        background: white;
        padding: 10px;
        border-radius: 5px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        font-size: 12px;
        line-height: 1.4;
      `;
      
      const categories = [...new Set(data.map(m => m.category))];
      const legendHtml = SanitizeService.sanitizeHtml(`
        <h4 style="margin: 0 0 8px 0;">Catégories</h4>
        ${categories.map(category => {
          const colors = {
            'restaurants': '#e74c3c',
            'shopping': '#3498db',
            'services': '#2ecc71',
            'entertainment': '#f39c12',
            'health': '#9b59b6',
            'education': '#1abc9c',
            'transport': '#34495e',
            'other': '#95a5a6'
          };
          const color = colors[category as keyof typeof colors] || colors.other;
          return `<div style="display: flex; align-items: center; margin-bottom: 4px;">
            <div style="width: 12px; height: 12px; background-color: ${color}; border-radius: 50%; margin-right: 8px;"></div>
            <span>${SanitizeService.sanitizeText(category)}</span>
          </div>`;
        }).join('')}
        <div style="margin-top: 8px; font-size: 10px; color: #666;">
          Taille = Volume des transactions
        </div>
      `);
      
      div.innerHTML = legendHtml;
      
      return div;
    };
    legend.addTo(map);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [data]);

  return (
    <div className="w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full rounded-lg" />
    </div>
  );
}