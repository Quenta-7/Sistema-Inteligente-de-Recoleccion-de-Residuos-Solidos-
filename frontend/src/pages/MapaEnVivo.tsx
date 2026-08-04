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

// Rutas reales en el distrito de San Jerónimo, Cusco
// Coordenadas aproximadas centradas en San Jerónimo (-13.548, -71.878)
const rutas: Record<string, RutaDetalle> = {
  'SJ-01': {
    id: 'Ruta SJ-01',
    zona: 'Sector Central – Urb. Kennedy',
    conductor: 'Julio Quispe M.',
    placa: 'A3T-851',
    estado: 'En ruta',
    tiempoEstimado: '10 min',
    velocidadBase: 20,
    puntos: [
      { lat: -13.5485, lng: -71.8772 }, // Plaza Principal San Jerónimo
      { lat: -13.5493, lng: -71.8755 }, // Jr. Cusco
      { lat: -13.5505, lng: -71.8740 }, // Av. Evitamiento
      { lat: -13.5518, lng: -71.8730 }, // Mercado San Jerónimo
      { lat: -13.5528, lng: -71.8718 }, // Urb. Kennedy inicio
      { lat: -13.5535, lng: -71.8705 }, // Jr. Simón Bolívar
      { lat: -13.5522, lng: -71.8695 }  // Final Kennedy
    ],
    paradas: [
      { nombre: 'Plaza Principal San Jerónimo', hora: '07:00', progressPercent: 0 },
      { nombre: 'Mercado San Jerónimo (Av. Evitamiento)', hora: '07:20', progressPercent: 40 },
      { nombre: 'Urb. Kennedy – Jr. Simón Bolívar', hora: '07:40', progressPercent: 75 },
      { nombre: 'Final Urb. Kennedy', hora: '08:00', progressPercent: 100 }
    ]
  },
  'SJ-02': {
    id: 'Ruta SJ-02',
    zona: 'Urb. Los Incas – Sector Pillao Matao',
    conductor: 'Efraín Mamani H.',
    placa: 'B2R-412',
    estado: 'En recolección',
    tiempoEstimado: '15 min',
    velocidadBase: 18,
    puntos: [
      { lat: -13.5470, lng: -71.8760 }, // Urb. Los Incas – ingreso
      { lat: -13.5462, lng: -71.8745 }, // Av. Principal Los Incas
      { lat: -13.5455, lng: -71.8730 }, // Jr. Los Incas
      { lat: -13.5465, lng: -71.8720 }, // Conexión
      { lat: -13.5475, lng: -71.8708 }, // Sector Pillao Matao
      { lat: -13.5490, lng: -71.8698 }, // Av. Huáscar
      { lat: -13.5505, lng: -71.8688 }  // Final Pillao Matao
    ],
    paradas: [
      { nombre: 'Ingreso Urb. Los Incas', hora: '07:00', progressPercent: 0 },
      { nombre: 'Jr. Los Incas (Zona Central)', hora: '07:25', progressPercent: 35 },
      { nombre: 'Inicio Sector Pillao Matao', hora: '07:50', progressPercent: 65 },
      { nombre: 'Final Pillao Matao – Av. Huáscar', hora: '08:15', progressPercent: 100 }
    ]
  },
  'SJ-03': {
    id: 'Ruta SJ-03',
    zona: 'Urb. Santa Rosa – Sector Conchacalla',
    conductor: 'Marcos Condori T.',
    placa: 'C5W-738',
    estado: 'Por iniciar',
    tiempoEstimado: '25 min',
    velocidadBase: 22,
    puntos: [
      { lat: -13.5500, lng: -71.8750 }, // Urb. Santa Rosa – ingreso
      { lat: -13.5510, lng: -71.8760 }, // Jr. Santa Rosa
      { lat: -13.5515, lng: -71.8775 }, // Zona central Santa Rosa
      { lat: -13.5508, lng: -71.8790 }, // Transición
      { lat: -13.5495, lng: -71.8802 }, // Sector Conchacalla
      { lat: -13.5480, lng: -71.8812 }, // Calle Conchacalla
      { lat: -13.5468, lng: -71.8820 }  // Final Conchacalla
    ],
    paradas: [
      { nombre: 'Ingreso Urb. Santa Rosa', hora: '07:00', progressPercent: 0 },
      { nombre: 'Jr. Santa Rosa (Centro)', hora: '07:20', progressPercent: 35 },
      { nombre: 'Inicio Sector Conchacalla', hora: '07:45', progressPercent: 65 },
      { nombre: 'Final Conchacalla', hora: '08:10', progressPercent: 100 }
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
  const polylineRef = useRef<L.Polyline | null>(null);
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
        }).setView([-13.5495, -71.8755], 15); // Centro de San Jerónimo

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors'
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

    stopMarkersRef.current.forEach((m) => m.remove());
    stopMarkersRef.current = [];

    if (polylineRef.current) polylineRef.current.remove();

    const latLngs = activeRoute.puntos.map((p) => [p.lat, p.lng] as [number, number]);
    const polyline = L.polyline(latLngs, {
      color: '#059669',
      weight: 6,
      opacity: 0.85,
      dashArray: '10, 8'
    }).addTo(map);
    polylineRef.current = polyline;

    map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

    fetchStreetRoute(activeRoute.puntos).then((streetCoords) => {
      if (!mapRef.current) return;
      if (polylineRef.current) polylineRef.current.remove();
      const poly = L.polyline(streetCoords, {
        color: '#059669',
        weight: 6,
        opacity: 0.9,
        lineJoin: 'round',
        lineCap: 'round'
      }).addTo(mapRef.current);
      polylineRef.current = poly;
      mapRef.current.fitBounds(poly.getBounds(), { padding: [50, 50] });
    });

    activeRoute.paradas.forEach((parada, idx) => {
      const ptIndex = Math.min(
        Math.floor((parada.progressPercent / 100) * (activeRoute.puntos.length - 1)),
        activeRoute.puntos.length - 1
      );
      const pt = activeRoute.puntos[ptIndex];

      const paradaIcon = L.divIcon({
        className: 'custom-parada-icon-wrapper',
        html: `<div id="map-stop-${idx}" class="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-lg bg-slate-500 transition-all duration-300">
                 ${idx + 1}
               </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([pt.lat, pt.lng], { icon: paradaIcon })
        .bindPopup(`<strong>Parada ${idx + 1}: ${parada.nombre}</strong><br/>Hora estimada: ${parada.hora}`)
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
