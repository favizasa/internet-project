import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { mapaApi } from '../../../api';

// Coordenadas centrales de Ventanilla, Callao
const CENTRO_VENTANILLA: [number, number] = [-11.8756, -77.1256];

type Punto = { latitud: number; longitud: number };

export default function MapaCalor() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const [capa, setCapa] = useState<'tickets' | 'solicitudes'>('tickets');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const heatLayerRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current).setView(CENTRO_VENTANILLA, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    const cargarDatos = async () => {
      if (!mapInstance.current) return;
      setCargando(true);
      setError('');

      try {
        const puntos: Punto[] = capa === 'tickets'
          ? await mapaApi.tickets()
          : await mapaApi.solicitudes();

        if (heatLayerRef.current) {
          mapInstance.current.removeLayer(heatLayerRef.current);
        }

        if (puntos.length === 0) {
          setError('No hay registros con coordenadas para mostrar en esta capa todavía.');
          setCargando(false);
          return;
        }

        const heatData = puntos.map((p) => [Number(p.latitud), Number(p.longitud), 0.6] as [number, number, number]);

        // @ts-ignore - leaflet.heat extiende L en tiempo de ejecución
        heatLayerRef.current = L.heatLayer(heatData, {
          radius: 30,
          blur: 20,
          maxZoom: 15,
          gradient: { 0.2: 'blue', 0.4: 'lime', 0.6: 'yellow', 0.8: 'orange', 1.0: 'red' },
        }).addTo(mapInstance.current);
      } catch (err: any) {
        setError(err.message || 'Error al cargar los puntos del mapa.');
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [capa]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-white mb-1">MAPA DE CALOR — ZONA VENTANILLA</h1>
      <p className="text-gray-400 text-sm mb-4">
        Visualización geográfica de la demanda y las incidencias de conectividad.
      </p>

      <div className="flex gap-3 mb-4">
        <button
          onClick={() => setCapa('tickets')}
          className={`px-4 py-2 rounded font-semibold ${capa === 'tickets' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}
        >
          Incidencias (Tickets)
        </button>
        <button
          onClick={() => setCapa('solicitudes')}
          className={`px-4 py-2 rounded font-semibold ${capa === 'solicitudes' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}
        >
          Demanda (Solicitudes)
        </button>
      </div>

      {cargando && <p className="text-gray-400 mb-2">Cargando puntos...</p>}
      {error && (
        <div className="bg-red-900/40 border border-red-700 text-red-200 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      <div
        ref={mapRef}
        style={{ height: '520px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}
      />
    </div>
  );
}