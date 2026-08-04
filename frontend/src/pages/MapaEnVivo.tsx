import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Navigation,
  Route as RouteIcon,
  Signal,
  Gauge,
  Info,
  Sun,
  Moon,
  MapPin
} from 'lucide-react';
import L from 'leaflet';
import { authedFetch } from '../api';
import { fetchStreetRoute } from '../utils/routing';

type RutaDetalle = {
  id: string;
  zona: string;
  conductor: string;
  placa: string;
  estado: string;
  tiempoEstimado: string;
  velocidadBase: number;
  puntos: { lat: number; lng: number }[];
  paradas: { nombre: string; hora: string; progressPercent: number }[];
};

// Coordenadas reales del contorno del Distrito de San Jerónimo, Cusco
const SAN_JERONIMO_BOUNDARY: [number, number][] = [
  [-13.5220, -71.8750], // Norte (Montañas hacia Taray)
  [-13.5280, -71.8580], // Noreste
  [-13.5380, -71.8480], // Este (Límite con Saylla)
  [-13.5520, -71.8430], // Sureste (Valle de Saylla)
  [-13.5680, -71.8530], // Sur (Cerros de Yaurisque)
  [-13.5780, -71.8680], // Suroeste
  [-13.5680, -71.8840], // Oeste (Límite con San Sebastián)
  [-13.5500, -71.8920], // Noroeste urbano (Vía Evitamiento / San Sebastián)
  [-13.5350, -71.8850], // Alto Noroeste
  [-13.5220, -71.8750]  // Cierre del polígono
];

const WORLD_OUTER_RING: [number, number][] = [
  [-90, -180],
  [-90, 180],
  [90, 180],
  [90, -180],
  [-90, -180]
];

// Función helper para calcular el ángulo de rumbo (bearing) entre dos puntos geográficos
function calculateBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const y = Math.sin(dLng) * Math.cos(lat2 * (Math.PI / 180));
  const x =
    Math.cos(lat1 * (Math.PI / 180)) * Math.sin(lat2 * (Math.PI / 180)) -
    Math.sin(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.cos(dLng);
  return (Math.atan2(y, x) * (180 / Math.PI) + 360) % 360;
}

// Función helper para desplazar las líneas por el carril derecho según la dirección del vehículo
function applyRightHandOffset(coords: [number, number][], offset: number = 0.00006): [number, number][] {
  if (coords.length < 2) return coords;
  const result: [number, number][] = [];

  for (let i = 0; i < coords.length; i++) {
    let dLat = 0;
    let dLng = 0;

    if (i < coords.length - 1) {
      dLat += coords[i + 1][0] - coords[i][0];
      dLng += coords[i + 1][1] - coords[i][1];
    }
    if (i > 0) {
      dLat += coords[i][0] - coords[i - 1][0];
      dLng += coords[i][1] - coords[i - 1][1];
    }

    const len = Math.sqrt(dLat * dLat + dLng * dLng);
    if (len < 1e-7) {
      result.push(coords[i]);
    } else {
      const normLat = -dLng / len;
      const normLng = dLat / len;
      result.push([coords[i][0] + normLat * offset, coords[i][1] + normLng * offset]);
    }
  }

  return result;
}

// Rutas divididas en 4 cuadrantes geográficos independientes sin solapamiento, con origen y retorno común en la Base Municipal
const rutas: Record<string, RutaDetalle> = {
  'SJ-01': {
    id: 'Ruta SJ-01',
    zona: 'Cuadrante Este – Urb. Larapa Residencial & Larapa Grande & Pata Pata',
    conductor: 'Julio Quispe M.',
    placa: 'A3T-851',
    estado: 'En ruta',
    tiempoEstimado: '10 min',
    velocidadBase: 20,
    puntos: [
      { lat: -13.5510, lng: -71.8740 }, // Base Municipal (Salida)
      { lat: -13.5525, lng: -71.8705 }, // Calle Los Álamos (Larapa Residencial)
      { lat: -13.5515, lng: -71.8680 }, // Av. Larapa Central
      { lat: -13.5525, lng: -71.8655 }, // Urb. Larapa Grande (Calle Interior)
      { lat: -13.5545, lng: -71.8620 }, // Sector Pata Pata Residencial
      { lat: -13.5505, lng: -71.8715 }, // Retorno por Av. Universidad
      { lat: -13.5510, lng: -71.8740 }  // Base Municipal (Retorno)
    ],
    paradas: [
      { nombre: 'Salida: Base Operativa Municipal', hora: '07:00', progressPercent: 0 },
      { nombre: 'Calle Los Álamos (Larapa Residencial)', hora: '07:15', progressPercent: 20 },
      { nombre: 'Av. Larapa Central', hora: '07:35', progressPercent: 40 },
      { nombre: 'Urb. Larapa Grande', hora: '07:55', progressPercent: 60 },
      { nombre: 'Sector Pata Pata Residencial', hora: '08:15', progressPercent: 80 },
      { nombre: 'Retorno: Base Operativa Municipal', hora: '08:35', progressPercent: 100 }
    ]
  },
  'SJ-02': {
    id: 'Ruta SJ-02',
    zona: 'Cuadrante Noreste (Arriba a la Derecha) – Versalles & Kantu & Huayna Picol Norte',
    conductor: 'Efraín Mamani H.',
    placa: 'B2R-412',
    estado: 'En recolección',
    tiempoEstimado: '15 min',
    velocidadBase: 18,
    puntos: [
      { lat: -13.5510, lng: -71.8740 }, // Base Municipal (Salida)
      { lat: -13.5480, lng: -71.8680 }, // Sector Kantu de Larapa
      { lat: -13.5450, lng: -71.8650 }, // Urb. Versalles (Arriba Derecha)
      { lat: -13.5415, lng: -71.8620 }, // APV Huayna Picol Norte
      { lat: -13.5440, lng: -71.8660 }, // APV San Antonio Norte
      { lat: -13.5490, lng: -71.8710 }, // Av. Collana Norte (Retorno)
      { lat: -13.5510, lng: -71.8740 }  // Base Municipal (Retorno)
    ],
    paradas: [
      { nombre: 'Salida: Base Operativa Municipal', hora: '07:00', progressPercent: 0 },
      { nombre: 'Sector Kantu de Larapa', hora: '07:20', progressPercent: 20 },
      { nombre: 'Urb. Versalles (Cuadrante Noreste)', hora: '07:45', progressPercent: 45 },
      { nombre: 'APV Huayna Picol Norte', hora: '08:05', progressPercent: 70 },
      { nombre: 'APV San Antonio Norte', hora: '08:20', progressPercent: 85 },
      { nombre: 'Retorno: Base Operativa Municipal', hora: '08:40', progressPercent: 100 }
    ]
  },
  'SJ-03': {
    id: 'Ruta SJ-03',
    zona: 'Cuadrante Noroeste (Arriba a la Izquierda) – Santa Rosa Alta & Mirador & Conchacalla Alta',
    conductor: 'Marcos Condori T.',
    placa: 'C5W-738',
    estado: 'Por iniciar',
    tiempoEstimado: '25 min',
    velocidadBase: 22,
    puntos: [
      { lat: -13.5510, lng: -71.8740 }, // Base Municipal (Salida)
      { lat: -13.5450, lng: -71.8785 }, // Urb. Santa Rosa Alta
      { lat: -13.5420, lng: -71.8800 }, // APV Pampa Chanca Alta
      { lat: -13.5380, lng: -71.8815 }, // APV Mirador San Jerónimo (Laderas Altas de Casas)
      { lat: -13.5400, lng: -71.8835 }, // APV Conchacalla Alta
      { lat: -13.5470, lng: -71.8780 }, // Bajada Conchacalla
      { lat: -13.5510, lng: -71.8740 }  // Base Municipal (Retorno)
    ],
    paradas: [
      { nombre: 'Salida: Base Operativa Municipal', hora: '07:00', progressPercent: 0 },
      { nombre: 'Urb. Santa Rosa Alta', hora: '07:20', progressPercent: 20 },
      { nombre: 'APV Pampa Chanca Alta', hora: '07:40', progressPercent: 40 },
      { nombre: 'APV Mirador San Jerónimo (Zona Alta de Casas)', hora: '08:05', progressPercent: 65 },
      { nombre: 'APV Conchacalla Alta', hora: '08:25', progressPercent: 85 },
      { nombre: 'Retorno: Base Operativa Municipal', hora: '08:50', progressPercent: 100 }
    ]
  },
  'SJ-04': {
    id: 'Ruta SJ-04',
    zona: 'Cuadrante Suroeste (Abajo a la Izquierda) – Pillao Matao Sur & Chimpahuaylla Sur & Retamales Sur',
    conductor: 'David Ramos V.',
    placa: 'E4M-902',
    estado: 'En ruta',
    tiempoEstimado: '35 min',
    velocidadBase: 24,
    puntos: [
      { lat: -13.5510, lng: -71.8740 }, // Base Municipal (Salida)
      { lat: -13.5525, lng: -71.8770 }, // Sector Chimpahuaylla Sur
      { lat: -13.5535, lng: -71.8805 }, // Pillao Matao Sur
      { lat: -13.5545, lng: -71.8830 }, // APV Los Retamales Sur
      { lat: -13.5560, lng: -71.8860 }, // Límite San Sebastián Sur
      { lat: -13.5530, lng: -71.8790 }, // Retorno Av. Cusco Sur
      { lat: -13.5510, lng: -71.8740 }  // Base Municipal (Retorno)
    ],
    paradas: [
      { nombre: 'Salida: Base Operativa Municipal', hora: '07:00', progressPercent: 0 },
      { nombre: 'Sector Chimpahuaylla Sur', hora: '07:15', progressPercent: 20 },
      { nombre: 'Pillao Matao Sur', hora: '07:35', progressPercent: 45 },
      { nombre: 'APV Los Retamales Sur', hora: '07:55', progressPercent: 70 },
      { nombre: 'Límite San Sebastián Sur', hora: '08:15', progressPercent: 85 },
      { nombre: 'Retorno: Base Operativa Municipal', hora: '08:35', progressPercent: 100 }
    ]
  }
};

const MapaEnVivo = () => {
  const [selectedRouteId, setSelectedRouteId] = useState<string>('SJ-01');
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('color-theme') as 'light' | 'dark') || 'light';
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [realGpsCoords, setRealGpsCoords] = useState<{ lat: number; lng: number } | null>(null);

  const activeRoute = rutas[selectedRouteId];

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const polylinesRef = useRef<L.Polyline[]>([]);
  const stopMarkersRef = useRef<L.Marker[]>([]);
  const truckMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [theme]);

  useEffect(() => {
    const userDataRaw = localStorage.getItem('user_data') ?? sessionStorage.getItem('user_data');
    if (userDataRaw) {
      try {
        const userData = JSON.parse(userDataRaw);
        if (userData.rol === 'admin') {
          setIsAdmin(true);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setThemeState(nextTheme);
    localStorage.setItem('color-theme', nextTheme);
  };

  // Poll backend for real GPS coordinates sent by collector
  useEffect(() => {
    const fetchLiveGps = async () => {
      try {
        const res = await authedFetch('/api/rutas/');
        if (res.ok) {
          const data = await res.json();
          const rList = Array.isArray(data) ? data : data.results || [];
          const activeR = rList.find((r: any) => r.estado === 'en_progreso' && r.lat_actual && r.lng_actual);
          if (activeR) {
            setRealGpsCoords({ lat: activeR.lat_actual, lng: activeR.lng_actual });
          }
        }
      } catch (err) {
        console.error('Error fetching live GPS:', err);
      }
    };

    fetchLiveGps();
    const interval = setInterval(fetchLiveGps, 4000);
    return () => clearInterval(interval);
  }, []);

  const getTruckCoords = () => {
    if (realGpsCoords) {
      return realGpsCoords;
    }
    const pts = activeRoute?.puntos || [];
    if (pts.length === 0) return { lat: -13.5485, lng: -71.8772 };
    return { lat: pts[0].lat, lng: pts[0].lng };
  };

  // Inicializar mapa centrado en San Jerónimo, Cusco
  useEffect(() => {
    if (mapContainerRef.current) {
      if ((mapContainerRef.current as any)._leaflet_id && !mapRef.current) {
        (mapContainerRef.current as any)._leaflet_id = null;
      }
      if (!mapRef.current) {
        const map = L.map(mapContainerRef.current, {
          zoomControl: true,
          scrollWheelZoom: true
        }).setView([-13.5495, -71.8755], 14); // Vista panorámica del Distrito de San Jerónimo

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Capa de Máscara: Oscurece todo el mapa fuera del límite de San Jerónimo
        L.polygon([WORLD_OUTER_RING, SAN_JERONIMO_BOUNDARY], {
          color: '#020617',
          fillColor: '#020617',
          fillOpacity: 0.60,
          weight: 0,
          stroke: false
        }).addTo(map);

        // Borde resaltado del perímetro del Distrito de San Jerónimo
        L.polygon(SAN_JERONIMO_BOUNDARY, {
          color: '#10b981',
          weight: 3.5,
          fillOpacity: 0.03,
          dashArray: '8, 6'
        }).addTo(map);

        mapRef.current = map;
      }
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // 1. Limpiar marcadores y flechas previas
    stopMarkersRef.current.forEach((m) => m.remove());
    stopMarkersRef.current = [];

    // 2. Limpiar polilíneas previas directamente del mapa
    polylinesRef.current.forEach((p) => p.remove());
    polylinesRef.current = [];

    const drawRouteOnMap = (coords: [number, number][]) => {
      if (!mapRef.current || coords.length < 2) return;

      // Limpiar capas previas en este renderizado
      polylinesRef.current.forEach((p) => p.remove());
      polylinesRef.current = [];

      const midIdx = Math.floor(coords.length / 2);
      const rawIda = coords.slice(0, midIdx + 1);
      const rawVuelta = coords.slice(midIdx);

      // Desplazamiento por carril derecho según sentido de marcha
      const idaCoords = applyRightHandOffset(rawIda, 0.00006);
      const vueltaCoords = applyRightHandOffset(rawVuelta, 0.00006);

      // 1. Línea de Ida (Esmeralda entrecortada con espaciado de 14px)
      const polyIda = L.polyline(idaCoords, {
        color: '#059669',
        weight: 3.5,
        opacity: 0.95,
        dashArray: '14, 10',
        lineJoin: 'round',
        lineCap: 'round'
      }).addTo(mapRef.current);
      polylinesRef.current.push(polyIda);

      // 2. Línea de Vuelta (Turquesa/Teal entrecortada con espaciado de 14px)
      if (vueltaCoords.length >= 2) {
        const polyVuelta = L.polyline(vueltaCoords, {
          color: '#0d9488',
          weight: 3.5,
          opacity: 0.95,
          dashArray: '14, 10',
          lineJoin: 'round',
          lineCap: 'round'
        }).addTo(mapRef.current);
        polylinesRef.current.push(polyVuelta);
      }

      // Encuadre óptimo de la ruta en el mapa
      const boundsGroup = L.featureGroup(polylinesRef.current);
      if (boundsGroup.getBounds().isValid()) {
        mapRef.current.fitBounds(boundsGroup.getBounds(), { padding: [50, 50] });
      }

      // Flechas de dirección para la Línea de Ida
      const stepIda = Math.max(1, Math.floor(idaCoords.length / 5));
      for (let i = 0; i < idaCoords.length - 1; i += stepIda) {
        const pt1 = idaCoords[i];
        const pt2 = idaCoords[Math.min(i + 1, idaCoords.length - 1)];
        const bearing = calculateBearing(pt1[0], pt1[1], pt2[0], pt2[1]);

        const arrowIcon = L.divIcon({
          className: 'route-direction-arrow-ida',
          html: `<div style="transform: rotate(${bearing}deg);" class="flex items-center justify-center text-emerald-600 dark:text-emerald-400 drop-shadow">
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                     <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
                   </svg>
                 </div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });

        const arrowMarker = L.marker([pt1[0], pt1[1]], { icon: arrowIcon, interactive: false }).addTo(mapRef.current);
        stopMarkersRef.current.push(arrowMarker);
      }

      // Flechas de dirección para la Línea de Vuelta
      if (vueltaCoords.length >= 2) {
        const stepVuelta = Math.max(1, Math.floor(vueltaCoords.length / 5));
        for (let i = 0; i < vueltaCoords.length - 1; i += stepVuelta) {
          const pt1 = vueltaCoords[i];
          const pt2 = vueltaCoords[Math.min(i + 1, vueltaCoords.length - 1)];
          const bearing = calculateBearing(pt1[0], pt1[1], pt2[0], pt2[1]);

          const arrowIconVuelta = L.divIcon({
            className: 'route-direction-arrow-vuelta',
            html: `<div style="transform: rotate(${bearing}deg);" class="flex items-center justify-center text-teal-600 dark:text-teal-400 drop-shadow">
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                       <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
                     </svg>
                   </div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          });

          const arrowMarkerVuelta = L.marker([pt1[0], pt1[1]], { icon: arrowIconVuelta, interactive: false }).addTo(mapRef.current);
          stopMarkersRef.current.push(arrowMarkerVuelta);
        }
      }
    };

    // Renderizar de inmediato los waypoints por defecto (garantiza visibilidad instantánea)
    const fallbackCoords = activeRoute.puntos.map((p) => [p.lat, p.lng] as [number, number]);
    drawRouteOnMap(fallbackCoords);

    // Luego cargar las calles exactas de OSRM para reemplazar suavemente
    fetchStreetRoute(activeRoute.puntos).then((streetCoords) => {
      if (streetCoords && streetCoords.length >= 2) {
        drawRouteOnMap(streetCoords);
      }
    });

    // Marcador de la Base Operativa Municipal: compacto, estático (sin desbordamiento de texto)
    const baseCoords = activeRoute.puntos[0];
    const baseIcon = L.divIcon({
      className: 'custom-base-icon-wrapper',
      html: `<div class="bg-amber-500 text-white font-bold px-3 py-1 rounded-md border border-white shadow-md text-[11px] whitespace-nowrap inline-flex items-center justify-center">
               🚩 Base Municipal (Inicio/Fin)
             </div>`,
      iconSize: [185, 28],
      iconAnchor: [92, 14]
    });

    const baseMarker = L.marker([baseCoords.lat, baseCoords.lng], { icon: baseIcon })
      .bindPopup(`<strong>🚩 Base Operativa Municipal (San Jerónimo)</strong><br/>Salida: ${activeRoute.paradas[0].hora} hrs<br/>Retorno estimado: ${activeRoute.paradas[activeRoute.paradas.length - 1].hora} hrs`)
      .addTo(map);

    stopMarkersRef.current.push(baseMarker);

    // Renderizar paradas intermedias de recolección numeradas (1, 2, 3...) dentro del sector
    const paradasIntermedias = activeRoute.paradas.slice(1, activeRoute.paradas.length - 1);
    paradasIntermedias.forEach((parada, idx) => {
      const ptIndex = Math.min(
        Math.floor(((idx + 1) / (activeRoute.paradas.length - 1)) * (activeRoute.puntos.length - 1)),
        activeRoute.puntos.length - 1
      );
      const pt = activeRoute.puntos[ptIndex];

      const paradaNumero = idx + 1;
      const paradaIcon = L.divIcon({
        className: 'custom-parada-icon-wrapper',
        html: `<div id="map-stop-${idx}" class="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-xs font-black text-white shadow-lg bg-emerald-600 transition-all duration-300">
                 ${paradaNumero}
               </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([pt.lat, pt.lng], { icon: paradaIcon })
        .bindPopup(`<strong>Parada ${paradaNumero}: ${parada.nombre}</strong><br/>Hora estimada: ${parada.hora}`)
        .addTo(map);

      stopMarkersRef.current.push(marker);
    });
  }, [selectedRouteId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const truckPos = getTruckCoords();

    if (!truckMarkerRef.current) {
      const truckIcon = L.divIcon({
        className: 'custom-truck-icon-wrapper',
        html: `<div class="w-10 h-10 bg-emerald-500 rounded-xl border-2 border-white flex items-center justify-center shadow-xl">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                   <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                   <path d="M19 18h2a1 1 0 0 0 1-1v-5.05a1.009 1.009 0 0 0-.29-.707l-4.07-4.07a1.009 1.009 0 0 0-.707-.29H14" />
                   <circle cx="5.5" cy="18.5" r="2.5" />
                   <circle cx="18.5" cy="18.5" r="2.5" />
                 </svg>
               </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      truckMarkerRef.current = L.marker([truckPos.lat, truckPos.lng], { icon: truckIcon })
        .bindPopup(`<strong>Camión Recolector – San Jerónimo</strong><br/>Unidad: ${activeRoute.placa}`)
        .addTo(map);
    } else {
      truckMarkerRef.current.setLatLng([truckPos.lat, truckPos.lng]);
    }
  }, [realGpsCoords, activeRoute]);

  const truckPos = getTruckCoords();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100 font-sans flex flex-col justify-between transition-colors duration-300">

      {/* Header */}
      <header className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 py-6 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center text-sm font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 transition-all"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Panel
            </Link>
            <button
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 transition-all self-start sm:self-auto"
            >
              {theme === 'light' ? (<><Moon className="h-4 w-4 text-slate-600" /><span>Modo Oscuro</span></>) : (<><Sun className="h-4 w-4 text-amber-400" /><span>Modo Claro</span></>)}
            </button>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                <Signal className="h-4 w-4 animate-pulse" />
                GPS en Vivo – Distrito San Jerónimo, Cusco
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">Mapa Operativo en Tiempo Real</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mt-1">
                Monitorea el recorrido del camión recolector en el Distrito de San Jerónimo. Selecciona una ruta para ver el avance.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-4 rounded-2xl flex items-center gap-3 shadow-sm transition-colors duration-300">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">GPS Activo – San Jerónimo</span>
            </div>
          </div>
        </div>
      </header>

      {/* Franja de sector info */}
      <div className="bg-emerald-600 dark:bg-emerald-800 text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs font-semibold">
          <MapPin className="h-3.5 w-3.5" />
          <span>Distrito de San Jerónimo, Provincia de Cusco, Perú · Lat: -13.5495° S · Lng: -71.8755° O</span>
        </div>
      </div>

      {/* Main Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto py-8 px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8">

        {/* Left Column: Map */}
        <section className="flex-1 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-5 rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-sm transition-colors duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 z-10 relative">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Mapa – Distrito San Jerónimo, Cusco</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Rastreo satelital en tiempo real emitido por los camiones recolectores.</p>
              </div>
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                GPS Real Conectado
              </div>
            </div>

            <div className="relative">
              <div
                ref={mapContainerRef}
                className="h-[420px] w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 overflow-hidden shadow-inner relative z-10 transition-colors duration-300"
              />
              <div className="absolute left-4 bottom-4 bg-white/95 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-850 px-4 py-3 rounded-xl backdrop-blur-sm text-xs font-semibold shadow-md z-20 transition-all duration-300">
                <p className="text-slate-500 dark:text-slate-400">Coordenadas del Camión</p>
                <p className="font-mono text-slate-800 dark:text-white mt-0.5">Lat: {truckPos.lat.toFixed(5)}, Lng: {truckPos.lng.toFixed(5)}</p>
              </div>
            </div>
          </div>

          {/* Telemetría (Solo para Administradores) */}
          {isAdmin ? (
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-6 rounded-3xl flex flex-col gap-4 shadow-sm transition-colors duration-300">
              <h3 className="text-md font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Gauge className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                Telemetría de la Unidad – San Jerónimo (Modo Admin)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-4 rounded-xl">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Señal GPS</span>
                  <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">Activa en Vivo</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-4 rounded-xl">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Unidad Asignada</span>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">{activeRoute?.placa || 'A3T-851'}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-4 rounded-xl">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Conductor</span>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-1 truncate">{activeRoute?.conductor || 'Chofer'}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-4 rounded-xl">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Sector</span>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-1 truncate">{activeRoute?.zona || 'San Jerónimo'}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-6 rounded-3xl flex flex-col gap-4 shadow-sm transition-colors duration-300 animate-fade-in">
              <h3 className="text-md font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                Puntos Estratégicos de Acopio Autorizados
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Las paradas indicadas en el mapa representan los puntos estratégicos de reciclaje y acopio autorizados en el distrito de <strong>San Jerónimo</strong>. Por favor, deposita tus residuos sólidos generales únicamente en estos puntos en los días y horarios indicados:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                {activeRoute?.paradas.map((parada, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-3 rounded-xl flex items-start gap-2.5 hover:border-emerald-500 transition-colors">
                    <span className="h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">{idx + 1}</span>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{parada.nombre}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Horario estimado: {parada.hora}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Right Column: Route Selector + Stops */}
        <section className="w-full lg:w-96 flex flex-col gap-6">

          {/* Selector de Rutas */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-6 rounded-3xl shadow-sm transition-colors duration-300">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <RouteIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Rutas – Distrito San Jerónimo
            </h3>
            <div className="space-y-3">
              {Object.values(rutas).map((ruta) => {
                const isSelected = activeRoute?.id === ruta.id;
                const routeKey = ruta.id.replace('Ruta ', '');
                return (
                  <button
                    key={ruta.id}
                    onClick={() => setSelectedRouteId(routeKey)}
                    className={`w-full border p-4 rounded-2xl text-left transition-all flex justify-between items-center ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 shadow-sm'
                        : 'border-slate-200 dark:border-slate-850 hover:border-slate-350 dark:hover:border-slate-750 bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-900/40 dark:hover:bg-slate-900/80'
                    }`}
                  >
                    <div>
                      <p className={`text-sm font-bold ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-white'}`}>{ruta.id}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{ruta.zona}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-1">Conductor: {ruta.conductor}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-emerald-100 dark:bg-emerald-400/20 text-emerald-700 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {isSelected ? 'Activo' : 'Ver'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lista de Paradas */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-6 rounded-3xl flex-1 flex flex-col justify-between shadow-sm transition-colors duration-300">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Navigation className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                Paradas de la Ruta
              </h3>
              <div className="space-y-4">
                {activeRoute?.paradas.map((parada, idx) => (
                  <div key={parada.nombre} className="flex gap-3 items-start relative">
                    <div className="flex flex-col items-center">
                      <div className="h-6 w-6 rounded-full border-2 bg-emerald-500 border-emerald-500 text-white flex items-center justify-center">
                        <span className="text-[10px] font-black">{idx + 1}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{parada.nombre}</p>
                      <p className="text-[10px] text-slate-500">Horario: {parada.hora}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-4 rounded-2xl flex gap-3 transition-colors duration-300">
              <Info className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                <p className="font-bold text-slate-900 dark:text-white">Detalle de la Unidad:</p>
                <p className="mt-0.5">Placa Municipal: <strong className="font-mono text-slate-800 dark:text-slate-200">{activeRoute.placa}</strong></p>
                <p>Zona: <strong>{activeRoute.zona}</strong></p>
                <p>ETA Siguiente Parada: ~{activeRoute.tiempoEstimado}</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default MapaEnVivo;
