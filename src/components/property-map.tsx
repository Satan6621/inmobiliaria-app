"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";

interface PropertyMapProps {
  properties: Array<{
    id: number;
    titulo: string;
    direccion: string;
    ciudad: string;
    precio: number;
    tipo: string;
    lat?: number;
    lng?: number;
  }>;
  onPropertySelect?: (id: number) => void;
  height?: string;
}

declare global {
  interface Window {
    google: any;
    initMapCallback: () => void;
  }
}

export function PropertyMap({ properties, onPropertySelect, height = "500px" }: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
    if (!key) {
      setMapError(true);
      setLoading(false);
      return;
    }

    // Load Google Maps script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&callback=initMapCallback`;
    script.async = true;
    script.defer = true;

    window.initMapCallback = () => {
      initMap();
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const initMap = () => {
    if (!mapRef.current || !window.google) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 10.4806, lng: -66.9036 },
      zoom: 12,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
    });

    const geocoder = new window.google.maps.Geocoder();

    properties.forEach((prop) => {
      const lat = prop.lat;
      const lng = prop.lng;

      if (lat && lng) {
        addMarker(map, prop, lat, lng);
      } else {
        geocoder.geocode(
          { address: `${prop.direccion}, ${prop.ciudad}, Venezuela` },
          (results: any, status: any) => {
            if (status === "OK" && results[0]) {
              const newLat = results[0].geometry.location.lat();
              const newLng = results[0].geometry.location.lng();
              addMarker(map, prop, newLat, newLng);
            }
          }
        );
      }
    });

    setLoading(false);
  };

  const addMarker = (map: any, prop: any, lat: number, lng: number) => {
    const position = { lat: lat as number, lng: lng as number };
    const marker = new window.google.maps.Marker({
      position,
      map,
      title: prop.titulo,
      icon: {
        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="14" fill="#C8102E" stroke="white" stroke-width="2"/>
            <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">$</text>
          </svg>`
        ),
        scaledSize: new window.google.maps.Size(32, 32),
      },
    });

    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="padding:8px;max-width:200px">
          <h3 style="font-weight:600;font-size:14px;margin:0 0 4px">${prop.titulo}</h3>
          <p style="color:#555;font-size:12px;margin:0 0 4px">${prop.direccion}, ${prop.ciudad}</p>
          <p style="color:#C8102E;font-weight:700;font-size:16px;margin:0">$${prop.precio.toLocaleString()} USD</p>
          <p style="color:#888;font-size:11px;margin:4px 0 0">${prop.tipo}</p>
        </div>
      `,
    });

    marker.addListener("click", () => {
      infoWindow.open(map, marker);
      if (onPropertySelect) onPropertySelect(prop.id);
    });
  };

  if (mapError) {
    return (
      <div className="glass-card p-8 text-center" style={{ height }}>
        <MapPin className="w-12 h-12 text-text-muted mx-auto mb-3" />
        <p className="text-sm text-text-secondary mb-1">Google Maps no configurado</p>
        <p className="text-xs text-text-muted">
          Agrega <code className="bg-surface px-1 py-0.5 rounded text-primary">NEXT_PUBLIC_GOOGLE_MAPS_KEY</code> en Vercel
        </p>
      </div>
    );
  }

  return (
    <div className="relative rounded-xl overflow-hidden border border-border">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface z-10">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
            <p className="text-sm text-text-muted">Cargando mapa...</p>
          </div>
        </div>
      )}
      <div ref={mapRef} style={{ height, width: "100%" }} />
    </div>
  );
}
