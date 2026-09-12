import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapaPlanProps {
  latitud: number;
  longitud: number;
  nombrePlan: string;
  onCerrar: () => void;
}

export default function MapaPlan({ latitud, longitud, nombrePlan, onCerrar }: MapaPlanProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current).setView([latitud, longitud], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Círculo de cobertura tipo "calor": rojo (borde, señal débil) -> amarillo (media) -> verde (centro, señal fuerte)
    // Se dibujan del más grande al más chico para que el centro quede encima.
    L.circle([latitud, longitud], {
      radius: 900,
      color: '#ef4444',
      weight: 1,
      fillColor: '#ef4444',
      fillOpacity: 0.15,
    }).addTo(map);

    L.circle([latitud, longitud], {
      radius: 550,
      color: '#f59e0b',
      weight: 1,
      fillColor: '#f59e0b',
      fillOpacity: 0.25,
    }).addTo(map);

    L.circle([latitud, longitud], {
      radius: 250,
      color: '#22c55e',
      weight: 1,
      fillColor: '#22c55e',
      fillOpacity: 0.4,
    }).addTo(map);

    L.marker([latitud, longitud])
      .addTo(map)
      .bindPopup(`<b>${nombrePlan}</b><br/>Punto central de cobertura`)
      .openPopup();

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [latitud, longitud, nombrePlan]);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg p-5">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold uppercase text-white">📍 Ubicación de cobertura — {nombrePlan}</h3>
          <button
            onClick={onCerrar}
            className="text-white text-xl font-bold bg-gray-800 hover:bg-gray-700 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer"
          >
            ×
          </button>
        </div>
        <div
          ref={mapRef}
          style={{ height: '360px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}
        />
        <div className="flex items-center gap-4 mt-3 text-[10px] text-gray-400">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span> Señal fuerte</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span> Señal media</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span> Señal débil</span>
        </div>
      </div>
    </div>
  );
}