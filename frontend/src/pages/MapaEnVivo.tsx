import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  AlertTriangle,
  Navigation,
  Route as RouteIcon,
  Signal,
  Play,
  Pause,
  RotateCcw,
  Gauge,
  Info,
  Sun,
  Moon
} from 'lucide-react';
import L from 'leaflet';

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

const rutas: Record<string, RutaDetalle> = {
  'A-17': {
    id: 'Ruta A-17',
    zona: 'San Sebastián',
    conductor: 'Julio Quispe M.',
    placa: 'EG-8140',
    estado: 'En ruta',
    tiempoEstimado: '8 min',
    velocidadBase: 30,
    puntos: [
      { lat: -13.5298, lng: -71.9284 }, // Larapa / San Sebastián
      { lat: -13.5252, lng: -71.9365 }, // Av. de la Cultura
      { lat: -13.5221, lng: -71.9422 }, // Plaza San Sebastián
      { lat: -13.5205, lng: -71.9515 }, // Cervecería
      { lat: -13.5186, lng: -71.9590 }, // Óvalo Garcilaso
      { lat: -13.5165, lng: -71.9680 }  // Final Av. Garcilaso
    ],
    paradas: [
      { nombre: 'Inicio Larapa', hora: '08:30', progressPercent: 0 },
      { nombre: 'Plaza San Sebastián', hora: '08:50', progressPercent: 40 },
      { nombre: 'Cervecería', hora: '09:05', progressPercent: 65 },
      { nombre: 'Av. Garcilaso (Final)', hora: '09:20', progressPercent: 100 }
    ]
  },
  'B-04': {
    id: 'Ruta B-04',
    zona: 'Centro Histórico',
    conductor: 'Marcos Condori T.',
    placa: 'EG-3420',
    estado: 'En recolección',
    tiempoEstimado: '12 min',
    velocidadBase: 20,
    puntos: [
      { lat: -13.5168, lng: -71.9785 }, // Plaza de Armas
      { lat: -13.5191, lng: -71.9765 }, // Calle Santa Catalina
      { lat: -13.5222, lng: -71.9729 }, // Av. El Sol / Coricancha
      { lat: -13.5241, lng: -71.9688 }, // Estación Wanchaq
      { lat: -13.5228, lng: -71.9625 }  // Av. Garcilaso
    ],
    paradas: [
      { nombre: 'Plaza de Armas', hora: '08:00', progressPercent: 0 },
      { nombre: 'Coricancha', hora: '08:20', progressPercent: 50 },
      { nombre: 'Estación Wanchaq', hora: '08:45', progressPercent: 75 },
      { nombre: 'Av. Garcilaso (Final)', hora: '09:00', progressPercent: 100 }
    ]
  },
  'C-11': {
    id: 'Ruta C-11',
    zona: 'Wanchaq',
    conductor: 'Efraín Mamani H.',
    placa: 'EG-1190',
    estado: 'Por iniciar',
    tiempoEstimado: '20 min',
    velocidadBase: 35,
    puntos: [
      { lat: -13.5241, lng: -71.9688 }, // Estación Wanchaq
      { lat: -13.5218, lng: -71.9635 }, // Av. Garcilaso
      { lat: -13.5202, lng: -71.9582 }, // Óvalo Garcilaso
      { lat: -13.5235, lng: -71.9541 }, // Av. Tacna
      { lat: -13.5262, lng: -71.9508 }  // Marcavalle
    ],
    paradas: [
      { nombre: 'Estación Wanchaq', hora: '09:10', progressPercent: 0 },
      { nombre: 'Óvalo Garcilaso', hora: '09:30', progressPercent: 50 },
      { nombre: 'Marcavalle (Final)', hora: '09:50', progressPercent: 100 }
    ]
  }
};

const alertas = [
  {
    titulo: 'Tránsito lento en Av. Sol',
    detalle: 'Se estima retraso de 6 minutos en la Ruta B-04 (Centro Histórico).',
    color: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-500/20 dark:text-amber-300'
  },
  {
    titulo: 'Recolección prioritaria',
    detalle: 'Zona San Sebastián con alta demanda de reciclables hoy.',
    color: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-500/20 dark:text-emerald-300'
  }
];

const MapaEnVivo = () => {
  const [selectedRouteId, setSelectedRouteId] = useState<string>('A-17');
  const [progress, setProgress] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('color-theme') as 'light' | 'dark') || 'light';
  });

  const [telemetry, setTelemetry] = useState({
    velocidad: 0,
    llenado: 20,
    peso: 1.5,
    combustible: 88
  });

  const activeRoute = rutas[selectedRouteId];

  // Referencias para el mapa Leaflet
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const stopMarkersRef = useRef<L.Marker[]>([]);
  const truckMarkerRef = useRef<L.Marker | null>(null);

  // Efecto para sincronizar el tema de la aplicación
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setThemeState(nextTheme);
    localStorage.setItem('color-theme', nextTheme);
  };

  // Simulación de movimiento del camión
  useEffect(() => {
    let interval: number;
    if (isPlaying) {
      interval = window.setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            return 0; // Reiniciar ruta
          }
          return Math.min(prev + 0.5 * speedMultiplier, 100);
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, speedMultiplier]);

  // Actualización de telemetría basada en el progreso
  useEffect(() => {
    let currentSpeed = 0;
    if (isPlaying) {
      const isAtStop = activeRoute.paradas.some((stop) => {
        const diff = Math.abs(progress - stop.progressPercent);
        return diff < 3 && stop.progressPercent > 0 && stop.progressPercent < 100;
      });

      if (isAtStop) {
        currentSpeed = 0;
      } else {
        currentSpeed = Math.floor(
          activeRoute.velocidadBase + (Math.sin(progress) * 5) + (Math.random() * 3)
        );
      }
    }

    const baseLlenado = 20 + Math.floor(progress * 0.7);
    const basePeso = Number((1.2 + (progress * 0.035)).toFixed(1));
    const baseCombustible = Math.max(90 - Math.floor(progress * 0.1), 10);

    setTelemetry({
      velocidad: currentSpeed,
      llenado: baseLlenado,
      peso: basePeso,
      combustible: baseCombustible
    });
  }, [progress, selectedRouteId, isPlaying]);

  // Interpolación de coordenadas Lat/Lng para el camión
  const getTruckCoords = () => {
    const pts = activeRoute.puntos;
    if (pts.length === 0) return { lat: -13.522, lng: -71.95 };
    
    const numSegments = pts.length - 1;
    const progressPerSegment = 100 / numSegments;
    
    const segmentIndex = Math.min(
      Math.floor(progress / progressPerSegment),
      numSegments - 1
    );
    
    const startPoint = pts[segmentIndex];
    const endPoint = pts[segmentIndex + 1];
    
    const relativeProgress = (progress % progressPerSegment) / progressPerSegment;
    
    const lat = startPoint.lat + (endPoint.lat - startPoint.lat) * relativeProgress;
    const lng = startPoint.lng + (endPoint.lng - startPoint.lng) * relativeProgress;
    
    return { lat, lng };
  };

  // Inicializar mapa de Cusco
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true
      }).setView([-13.522, -71.95], 14);

      // Cargar capa de Google Maps (Roadmap)
      const googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: 'Map data &copy; Google'
      });
      googleStreets.addTo(map);

      mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Actualizar ruta activa y marcadores en el mapa
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Limpiar paradas anteriores
    stopMarkersRef.current.forEach((m) => m.remove());
    stopMarkersRef.current = [];

    // Limpiar polilínea anterior
    if (polylineRef.current) {
      polylineRef.current.remove();
    }

    // Dibujar ruta
    const latLngs = activeRoute.puntos.map((p) => [p.lat, p.lng] as [number, number]);
    const polyline = L.polyline(latLngs, {
      color: '#0284c7',
      weight: 6,
      opacity: 0.8,
      dashArray: '10, 10'
    }).addTo(map);
    polylineRef.current = polyline;

    // Encuadrar la vista de la ruta
    map.fitBounds(polyline.getBounds(), { padding: [40, 40] });

    // Crear marcadores de las paradas
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

  // Actualizar la posición del camión conforme avanza el progreso
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
        .bindPopup(`<strong>Camión Recolector</strong><br/>Unidad: ${activeRoute.placa}`)
        .addTo(map);
    } else {
      truckMarkerRef.current.setLatLng([truckPos.lat, truckPos.lng]);
    }

    // Actualizar dinámicamente los estilos visuales de las paradas según el progreso actual
    activeRoute.paradas.forEach((parada, idx) => {
      const el = document.getElementById(`map-stop-${idx}`);
      if (el) {
        const hasPassed = progress >= parada.progressPercent;
        const isCurrent = Math.abs(progress - parada.progressPercent) < 4;

        if (isCurrent) {
          el.className = "w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-slate-950 shadow-lg bg-amber-400 animate-pulse scale-110";
        } else if (hasPassed) {
          el.className = "w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-lg bg-emerald-500";
        } else {
          el.className = "w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-lg bg-slate-500";
        }
      }
    });

  }, [progress, activeRoute]);

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
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 transition-all self-start sm:self-auto"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="h-4 w-4 text-slate-600" />
                  <span>Modo Oscuro</span>
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4 text-amber-400" />
                  <span>Modo Claro</span>
                </>
              )}
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400">
                <Signal className="h-4 w-4 animate-pulse" />
                Seguimiento Satelital GPS Cusco
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">Mapa Operativo en Tiempo Real</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mt-1">
                Monitorea el recorrido de los camiones recolectores sobre el mapa real de Cusco. Selecciona una ruta para verificar el avance.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-4 rounded-2xl flex items-center gap-3 shadow-sm transition-colors duration-300">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">GPS Activo en Cusco</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto py-8 px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Interactive Map */}
        <section className="flex-1 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-5 rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-sm transition-colors duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 z-10 relative">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Mapa Satelital de Cusco (Google Maps)</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Presiona play para reanudar o ajusta la velocidad de la simulación</p>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-xl transition-colors duration-300">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-sky-600 dark:text-sky-400 transition-all"
                  title={isPlaying ? 'Pausar' : 'Reanudar'}
                >
                  {isPlaying ? <Pause className="h-4.5 w-4.5" /> : <Play className="h-4.5 w-4.5" />}
                </button>
                <button
                  onClick={() => setProgress(0)}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
                  title="Reiniciar"
                >
                  <RotateCcw className="h-4.5 w-4.5" />
                </button>
                <div className="h-4 w-px bg-slate-200 dark:bg-slate-800"></div>
                <button
                  onClick={() => setSpeedMultiplier(1)}
                  className={`px-2 py-1 text-xs rounded font-bold transition-all ${speedMultiplier === 1 ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  1x
                </button>
                <button
                  onClick={() => setSpeedMultiplier(2.5)}
                  className={`px-2 py-1 text-xs rounded font-bold transition-all ${speedMultiplier === 2.5 ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  2.5x
                </button>
                <button
                  onClick={() => setSpeedMultiplier(5)}
                  className={`px-2 py-1 text-xs rounded font-bold transition-all ${speedMultiplier === 5 ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  5x
                </button>
              </div>
            </div>

            {/* Google Maps Container via Leaflet */}
            <div className="relative">
              <div
                ref={mapContainerRef}
                className="h-[420px] w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 overflow-hidden shadow-inner relative z-10 transition-colors duration-300"
              />

              {/* HUD / Overlay */}
              <div className="absolute left-4 bottom-4 bg-white/95 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-850 px-4 py-3 rounded-xl backdrop-blur-sm text-xs font-semibold shadow-md z-20 transition-all duration-300">
                <p className="text-slate-500 dark:text-slate-400">Coordenadas del Camión</p>
                <p className="font-mono text-slate-800 dark:text-white mt-0.5">Lat: {truckPos.lat.toFixed(5)}, Lng: {truckPos.lng.toFixed(5)}</p>
              </div>

              <div className="absolute right-4 bottom-4 bg-white/95 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-850 px-4 py-3 rounded-xl backdrop-blur-sm text-xs text-right font-semibold shadow-md z-20 transition-all duration-300">
                <p className="text-slate-500 dark:text-slate-400">Progreso de la Ruta</p>
                <p className="text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">{progress.toFixed(0)}% Completado</p>
              </div>
            </div>
          </div>

          {/* Telemetry Panel */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-6 rounded-3xl flex flex-col gap-4 shadow-sm transition-colors duration-300">
            <h3 className="text-md font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Gauge className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              Telemetría de la Unidad en Cusco
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-4 rounded-xl transition-colors duration-300">
                <span className="text-[10px] text-slate-500 dark:text-gray-400 uppercase font-bold tracking-wider">Velocidad</span>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{telemetry.velocidad} <span className="text-xs font-medium text-slate-500 dark:text-slate-400">km/h</span></p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-4 rounded-xl transition-colors duration-300">
                <span className="text-[10px] text-slate-500 dark:text-gray-400 uppercase font-bold tracking-wider">Llenado Tolva</span>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xl font-extrabold text-slate-900 dark:text-white">{telemetry.llenado}%</p>
                  <span className={`h-2.5 w-2.5 rounded-full ${telemetry.llenado > 85 ? 'bg-red-500' : telemetry.llenado > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-4 rounded-xl transition-colors duration-300">
                <span className="text-[10px] text-slate-500 dark:text-gray-400 uppercase font-bold tracking-wider">Carga Segregada</span>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{telemetry.peso} <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Tons</span></p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-4 rounded-xl transition-colors duration-300">
                <span className="text-[10px] text-slate-500 dark:text-gray-400 uppercase font-bold tracking-wider">Combustible</span>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{telemetry.combustible}%</p>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Route Controller & Alerts */}
        <section className="w-full lg:w-96 flex flex-col gap-6">
          
          {/* Route selector card */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-6 rounded-3xl shadow-sm transition-colors duration-300">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <RouteIcon className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              Selección de Ruta Cusco
            </h3>
            <div className="space-y-3">
              {Object.values(rutas).map((ruta) => {
                const isSelected = activeRoute.id === ruta.id;
                const routeKey = ruta.id.replace('Ruta ', '');

                return (
                  <button
                    key={ruta.id}
                    onClick={() => {
                      setSelectedRouteId(routeKey);
                      setProgress(0);
                    }}
                    className={`w-full border p-4 rounded-2xl text-left transition-all flex justify-between items-center ${
                      isSelected 
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-500/10 shadow-sm' 
                        : 'border-slate-200 dark:border-slate-850 hover:border-slate-350 dark:hover:border-slate-750 bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-900/40 dark:hover:bg-slate-900/80'
                    }`}
                  >
                    <div>
                      <p className={`text-sm font-bold ${isSelected ? 'text-sky-600 dark:text-sky-400' : 'text-slate-800 dark:text-white'}`}>{ruta.id}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{ruta.zona}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-1">Conductor: {ruta.conductor}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-sky-100 dark:bg-sky-400/20 text-sky-700 dark:text-sky-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {isSelected ? 'Activo' : 'Ver'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stops List */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-6 rounded-3xl flex-1 flex flex-col justify-between shadow-sm transition-colors duration-300">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Navigation className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                Línea de Paradas
              </h3>
              <div className="space-y-4">
                {activeRoute.paradas.map((parada, idx) => {
                  const hasPassed = progress >= parada.progressPercent;
                  const isCurrent = Math.abs(progress - parada.progressPercent) < 4;

                  return (
                    <div key={parada.nombre} className="flex gap-3 items-start relative">
                      <div className="flex flex-col items-center">
                        <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          isCurrent 
                            ? 'bg-amber-400 border-amber-400 text-slate-950 scale-110 shadow-md shadow-amber-400/20 animate-pulse' 
                            : hasPassed 
                              ? 'bg-emerald-500 border-emerald-500 text-white' 
                              : 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-750 text-slate-500'
                        }`}>
                          <span className="text-[10px] font-black">{idx + 1}</span>
                        </div>
                        {idx < activeRoute.paradas.length - 1 && (
                          <div className={`w-0.5 h-10 border-l border-dashed my-1 ${hasPassed ? 'border-emerald-500' : 'border-slate-300 dark:border-slate-750'}`}></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-sm font-bold truncate ${isCurrent ? 'text-amber-500 dark:text-amber-400 font-extrabold' : hasPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                            {parada.nombre}
                          </p>
                          <span className="text-[10px] text-slate-500 font-mono flex-shrink-0">{parada.hora}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {isCurrent ? 'Recolectando en este punto...' : hasPassed ? 'Recolección Completada' : 'Camión en ruta'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-4 rounded-2xl flex gap-3 transition-colors duration-300">
              <Info className="h-5 w-5 text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                <p className="font-bold text-slate-900 dark:text-white">Detalle de la Unidad:</p>
                <p className="mt-0.5">Placa Municipal: <strong className="font-mono text-slate-800 dark:text-slate-200">{activeRoute.placa}</strong></p>
                <p>ETA Siguiente Parada: ~{activeRoute.tiempoEstimado}</p>
              </div>
            </div>
          </div>

          {/* Active Alerts */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-6 rounded-3xl shadow-sm transition-colors duration-300">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Alertas del Día
            </h3>
            <div className="space-y-3">
              {alertas.map((alerta) => (
                <div key={alerta.titulo} className={`border p-4 rounded-2xl text-xs transition-colors duration-300 ${alerta.color}`}>
                  <p className="font-bold">{alerta.titulo}</p>
                  <p className="mt-1 opacity-95 font-medium leading-relaxed">{alerta.detalle}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default MapaEnVivo;
