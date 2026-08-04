import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Navigation,
  AlertTriangle,
  CheckCircle,
  Truck,
  LogOut,
  Calendar,
  Clock,
  Compass,
  AlertOctagon,
  RefreshCw,
  Send,
  Volume2,
  VolumeX,
  Sun,
  Moon
} from 'lucide-react';
import L from 'leaflet';
import { authedFetch } from '../api';
import { fetchStreetRoute } from '../utils/routing';

interface RouteNode {
  lat: number;
  lng: number;
  nombre: string;
}

interface Ruta {
  id: number;
  recolector_nombre: string;
  zona_nombre: string;
  fecha: string;
  hora_inicio: string;
  hora_fin_estimada: string;
  estado: 'programada' | 'en_progreso' | 'completada' | 'parcialmente_completada' | 'no_completada';
  observaciones?: string;
  geometria_ruta?: RouteNode[];
  distancia_restante: string;
}

interface Incidencia {
  id: number;
  recolector_nombre: string;
  tipo: string;
  descripcion: string;
  estado: 'pendiente' | 'resuelta';
  respuesta_admin?: string;
  created_at: string;
}

export default function RecolectorDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'rutas' | 'mapa' | 'incidencias'>('rutas');
  
  // Real GPS Tracking State
  const [realGpsError, setRealGpsError] = useState<string | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [lastGpsSyncTime, setLastGpsSyncTime] = useState<string | null>(null);

  // Active Route State
  const [activeRuta, setActiveRuta] = useState<Ruta | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastBeepTime, setLastBeepTime] = useState(0);
  const [currentPosition, setCurrentPosition] = useState<[number, number] | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // Modal / Form States
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionRouteId, setCompletionRouteId] = useState<number | null>(null);
  const [completionStatus, setCompletionStatus] = useState<'completada' | 'parcialmente_completada' | 'no_completada'>('completada');
  const [completionNotes, setCompletionNotes] = useState('');
  const [submittingCompletion, setSubmittingCompletion] = useState(false);

  const [incidenyType, setIncidentType] = useState('');
  const [incidentDesc, setIncidentDesc] = useState('');
  const [submittingIncident, setSubmittingIncident] = useState(false);
  const [incidentSuccessMsg, setIncidentSuccessMsg] = useState('');

  // Map References
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const truckMarkerRef = useRef<L.Marker | null>(null);
  const stopMarkersRef = useRef<L.Marker[]>([]);

  // Theme support
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('color-theme') as 'light' | 'dark') || 'light';
  });

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

  // Helper to play beep sound
  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // High pitch alert
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.2);
    } catch (e) {
      console.log('AudioContext warning:', e);
    }
  };

  // Fetch dashboard data
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch profile
      const profRes = await authedFetch('/api/perfil/');
      if (profRes.ok) {
        const profData = await profRes.json();
        if (profData.user.rol !== 'recolector') {
          // If not collector, redirect to standard dashboard
          navigate('/dashboard');
          return;
        }
        setUser(profData.user);
      } else {
        navigate('/login');
        return;
      }

      // Fetch routes
      const rRes = await authedFetch('/api/rutas/');
      if (rRes.ok) {
        const rData = await rRes.json();
        setRutas(rData);
        // Set active route to en_progreso or first available route if none selected
        const currentActive = rData.find((r: Ruta) => r.estado === 'en_progreso') || (rData.length > 0 ? rData[0] : null);
        if (currentActive && !activeRuta) {
          setActiveRuta(currentActive);
        }
      }

      // Fetch incidents
      const iRes = await authedFetch('/api/incidencias/');
      if (iRes.ok) {
        const iData = await iRes.json();
        setIncidencias(iData);
      }
    } catch (err) {
      console.error('Error fetching collector data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Distance calculator helper
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371000; // meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Real HTML5 GPS Location Listener (watchPosition)
  useEffect(() => {
    if (!activeRuta) return;

    if (!('geolocation' in navigator)) {
      setRealGpsError('La geolocalización HTML5 no está disponible en este navegador.');
      return;
    }

    setRealGpsError(null);

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setCurrentPosition([latitude, longitude]);
        setGpsAccuracy(accuracy);
        setLastGpsSyncTime(new Date().toLocaleTimeString());

        // Transmit coordinates to backend API
        try {
          await authedFetch(`/api/rutas/${activeRuta.id}/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lat_actual: latitude,
              lng_actual: longitude
            })
          });
        } catch (err) {
          console.error('Error enviando posición GPS al servidor:', err);
        }
      },
      (err) => {
        console.warn('GPS Error:', err.message);
        setRealGpsError(`Permiso de GPS pendiente o señal no activa (${err.message}). Por favor habilita la ubicación en tu navegador/móvil.`);
        
        // Fallback initial position to route start node if device GPS not accessible yet
        if (!currentPosition && activeRuta?.geometria_ruta && activeRuta.geometria_ruta.length > 0) {
          const firstNode = activeRuta.geometria_ruta[0];
          setCurrentPosition([firstNode.lat, firstNode.lng]);
        }
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [activeRuta]);

  // Proximity alerts calculated directly from real GPS position
  useEffect(() => {
    if (!currentPosition || !activeRuta?.geometria_ruta || activeRuta.geometria_ruta.length === 0) return;
    const [lat, lng] = currentPosition;
    const nodes = activeRuta.geometria_ruta;

    let closeNodeName: string | null = null;
    nodes.forEach((node: any) => {
      const dist = getDistance(lat, lng, node.lat, node.lng);
      if (dist < 50) {
        closeNodeName = node.nombre;
      }
    });

    if (closeNodeName) {
      setAlertMessage(`Proximidad: Menos de 50m del punto "${closeNodeName}". Sonando alerta sonora.`);
      const now = Date.now();
      if (now - lastBeepTime > 4000) {
        playBeep();
        setLastBeepTime(now);
      }
    } else {
      setAlertMessage(null);
    }
  }, [currentPosition, activeRuta]);

  // Leaflet Map Initialization and updates
  useEffect(() => {
    if (activeTab === 'mapa' && mapContainerRef.current) {
      if ((mapContainerRef.current as any)._leaflet_id && !mapRef.current) {
        (mapContainerRef.current as any)._leaflet_id = null;
      }

      if (!mapRef.current) {
        const initialCenter = currentPosition || [-13.5485, -71.8772];
        const map = L.map(mapContainerRef.current, {
          zoomControl: false,
          scrollWheelZoom: true
        }).setView(initialCenter, 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        mapRef.current = map;
      }

      const map = mapRef.current;

      // Clear previous elements
      if (polylineRef.current) {
        polylineRef.current.remove();
        polylineRef.current = null;
      }
      stopMarkersRef.current.forEach((m) => m.remove());
      stopMarkersRef.current = [];
      if (truckMarkerRef.current) {
        truckMarkerRef.current.remove();
        truckMarkerRef.current = null;
      }

      // Draw active route path
      if (activeRuta?.geometria_ruta && activeRuta.geometria_ruta.length > 0) {
        const nodes = activeRuta.geometria_ruta;

        // Numbered markers ONLY for key stops/nodes to avoid marker cluttering
        const keyStops = nodes.length > 10 
          ? nodes.filter((n, idx) => (n.nombre && !n.nombre.startsWith('Punto ')) || idx === 0 || idx === nodes.length - 1 || idx % Math.max(1, Math.floor(nodes.length / 4)) === 0)
          : nodes;

        keyStops.forEach((node, idx) => {
          const stopIcon = L.divIcon({
            className: 'custom-stop-icon',
            html: `<div class="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black text-white shadow bg-emerald-700">
                     ${idx + 1}
                   </div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });

          const m = L.marker([node.lat, node.lng], { icon: stopIcon })
            .bindPopup(`<strong>Punto ${idx + 1}:</strong> ${node.nombre || 'Parada de Acopio'}`)
            .addTo(map);
          stopMarkersRef.current.push(m);
        });

        // Draw route polyline
        const coords = nodes.map(n => [n.lat, n.lng] as [number, number]);
        const poly = L.polyline(coords, {
          color: '#10b981',
          weight: 6,
          opacity: 0.9,
          lineJoin: 'round',
          lineCap: 'round'
        }).addTo(map);
        polylineRef.current = poly;
        map.fitBounds(poly.getBounds(), { padding: [30, 30] });

        // If nodes has fewer than 10 points, calculate OSRM street path asynchronously
        if (nodes.length < 10) {
          fetchStreetRoute(nodes).then((streetCoords) => {
            if (!mapRef.current) return;
            if (polylineRef.current) polylineRef.current.remove();
            
            const streetPoly = L.polyline(streetCoords, {
              color: '#10b981',
              weight: 6,
              opacity: 0.9,
              lineJoin: 'round',
              lineCap: 'round'
            }).addTo(mapRef.current);
            polylineRef.current = streetPoly;
            mapRef.current.fitBounds(streetPoly.getBounds(), { padding: [30, 30] });
          });
        }
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [activeTab, activeRuta]);

  // Update truck marker dynamically
  useEffect(() => {
    const map = mapRef.current;
    if (activeTab === 'mapa' && map && currentPosition) {
      if (!truckMarkerRef.current) {
        const truckIcon = L.divIcon({
          className: 'custom-truck-icon-wrapper',
          html: `<div class="w-10 h-10 bg-emerald-500 rounded-xl border-2 border-white flex items-center justify-center shadow-xl transition-transform animate-pulse">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5">
                     <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                     <path d="M19 18h2a1 1 0 0 0 1-1v-5.05a1.009 1.009 0 0 0-.29-.707l-4.07-4.07a1.009 1.009 0 0 0-.707-.29H14" />
                     <circle cx="5.5" cy="18.5" r="2.5" />
                     <circle cx="18.5" cy="18.5" r="2.5" />
                   </svg>
                 </div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });

        truckMarkerRef.current = L.marker(currentPosition, { icon: truckIcon })
          .bindPopup(`<strong>Camión Recolector</strong><br/>Tu ubicación GPS real en vivo`)
          .addTo(map);
      } else {
        truckMarkerRef.current.setLatLng(currentPosition);
      }
    }
  }, [currentPosition, activeTab]);

  // Start route execution
  const startRoute = async (routeId: number) => {
    try {
      const res = await authedFetch(`/api/rutas/${routeId}/`, {
        method: 'PATCH',
        body: JSON.stringify({ estado: 'en_progreso' })
      });
      if (res.ok) {
        const updated = await res.json();
        // Update list
        setRutas(prev => prev.map(r => r.id === routeId ? updated : r));
        setActiveRuta(updated);
        setActiveTab('mapa'); // Switch to map GPS automatically
      }
    } catch (err) {
      console.error('Error starting route:', err);
    }
  };

  // Route Completion Submit
  const handleCompletionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completionRouteId) return;

    setSubmittingCompletion(true);
    try {
      const res = await authedFetch(`/api/rutas/${completionRouteId}/`, {
        method: 'PATCH',
        body: JSON.stringify({
          estado: completionStatus,
          observaciones: completionNotes,
          fecha_hora_reporte: new Date().toISOString()
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setRutas(prev => prev.map(r => r.id === completionRouteId ? updated : r));
        if (activeRuta?.id === completionRouteId) {
          setActiveRuta(null);
        }
        setShowCompletionModal(false);
        setCompletionNotes('');
        setCompletionRouteId(null);
      }
    } catch (err) {
      console.error('Error completing route:', err);
    } finally {
      setSubmittingCompletion(false);
    }
  };

  // Incident Submit
  const handleIncidentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidenyType || incidentDesc.length < 10) return;

    setSubmittingIncident(true);
    setIncidentSuccessMsg('');
    try {
      const res = await authedFetch('/api/incidencias/', {
        method: 'POST',
        body: JSON.stringify({
          tipo: incidenyType,
          descripcion: incidentDesc
        })
      });

      if (res.ok) {
        const newInc = await res.json();
        setIncidencias(prev => [newInc, ...prev]);
        setIncidentType('');
        setIncidentDesc('');
        setIncidentSuccessMsg('Incidencia reportada con éxito al administrador.');
      }
    } catch (err) {
      console.error('Error reporting incident:', err);
    } finally {
      setSubmittingIncident(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authedFetch('/api/auth/logout/', { method: 'POST' });
    } catch (e) {
      console.log(e);
    }
    sessionStorage.removeItem('auth_token');
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center transition-colors duration-300">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-10 w-10 text-emerald-500 animate-spin" />
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Cargando panel de recolector...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100 font-sans flex flex-col transition-colors duration-300">
      
      {/* Mobile-first Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-emerald-500/25">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight">RutaSegura Movil</h1>
            <p className="text-[10px] text-slate-500 font-medium">Panel Recolector</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl text-slate-600 dark:text-slate-300 transition-colors"
            title="Cambiar tema"
          >
            {theme === 'light' ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5 text-amber-400" />}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-red-500/10 hover:text-red-500 text-slate-500 rounded-xl transition-all"
            title="Cerrar sesion"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </header>

      {/* Main Content Area - Scrollable */}
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-24 max-w-lg mx-auto w-full">
        
        {/* Welcome Card */}
        <div className="glass-panel p-4 rounded-2xl mb-4 border border-emerald-500/15 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-600 dark:text-emerald-400">Recolector Autenticado</span>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">{user?.nombre_completo || 'Cargando...'}</h2>
            <p className="text-[10px] text-slate-500 mt-0.5">{user?.email}</p>
          </div>
          <div className="flex flex-col items-end">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              En Linea
            </span>
          </div>
        </div>

        {/* Tab 1: Rutas List */}
        {activeTab === 'rutas' && (
          <div className="space-y-4 fade-in-up">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Mis Rutas Asignadas</h3>
              <button 
                onClick={fetchData} 
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            {rutas.length === 0 ? (
              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-8 rounded-2xl text-center">
                <Calendar className="h-8 w-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-500">No tienes rutas programadas asignadas.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {rutas.map((ruta) => {
                  const isCurrentActive = activeRuta?.id === ruta.id;
                  
                  return (
                    <div 
                      key={ruta.id} 
                      className={`border rounded-2xl bg-white dark:bg-slate-950 p-4 transition-all relative overflow-hidden ${
                        isCurrentActive 
                          ? 'border-emerald-500 shadow-md shadow-emerald-500/5' 
                          : 'border-slate-200 dark:border-slate-850'
                      }`}
                    >
                      {/* Top info */}
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">{ruta.fecha}</span>
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{ruta.zona_nombre}</h4>
                        </div>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          ruta.estado === 'en_progreso' 
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-400/10 dark:text-amber-400' 
                            : ruta.estado === 'completada'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-400'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {ruta.estado.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Detail row */}
                      <div className="grid grid-cols-2 gap-2 text-xs border-t border-b border-slate-100 dark:border-slate-900 py-2 my-2 font-medium text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>{ruta.hora_inicio} - {ruta.hora_fin_estimada}</span>
                        </div>
                        <div className="flex items-center gap-1.5 justify-end">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          <span>{ruta.geometria_ruta?.length || 0} Puntos</span>
                        </div>
                      </div>

                      {/* Observations if completed */}
                      {ruta.observaciones && (
                        <p className="text-[10px] text-slate-500 italic bg-slate-50 dark:bg-slate-900/40 p-2 rounded-xl border border-slate-200/50 dark:border-slate-850/50 mb-3">
                          Obs: {ruta.observaciones}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 mt-2">
                        {ruta.estado === 'programada' && (
                          <button
                            onClick={() => startRoute(ruta.id)}
                            className="w-full flex items-center justify-center gap-1 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 py-2.5 rounded-xl transition-all shadow shadow-emerald-500/15"
                          >
                            <Navigation className="h-3.5 w-3.5" />
                            Iniciar Recorrido
                          </button>
                        )}

                        {ruta.estado === 'en_progreso' && (
                          <>
                            <button
                              onClick={() => {
                                setActiveRuta(ruta);
                                setActiveTab('mapa');
                              }}
                              className="flex-1 flex items-center justify-center gap-1 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 py-2.5 rounded-xl transition-all shadow shadow-amber-500/15"
                            >
                              <Navigation className="h-3.5 w-3.5" />
                              Ver Mapa
                            </button>
                            <button
                              onClick={() => {
                                setCompletionRouteId(ruta.id);
                                setShowCompletionModal(true);
                              }}
                              className="flex-1 flex items-center justify-center gap-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 py-2.5 rounded-xl transition-all shadow shadow-emerald-600/15"
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                              Finalizar
                            </button>
                          </>
                        )}

                        {(ruta.estado === 'completada' || ruta.estado === 'parcialmente_completada' || ruta.estado === 'no_completada') && (
                          <div className="w-full text-center text-[10px] font-bold text-slate-400 py-1 flex items-center justify-center gap-1">
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                            Ruta Finalizada
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Mapa GPS Real */}
        {activeTab === 'mapa' && (
          <div className="space-y-4 fade-in-up">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Navegación GPS y Telemetría en Vivo</h3>
                {activeRuta && (
                  <p className="text-[10px] text-emerald-500 font-bold mt-0.5">{activeRuta.zona_nombre}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-2 rounded-xl border transition-colors ${
                    soundEnabled 
                      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                      : 'border-slate-200 dark:border-slate-800 text-slate-500'
                  }`}
                  title={soundEnabled ? 'Silenciar alertas' : 'Activar alertas'}
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {realGpsError && (
              <div className="bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 p-3.5 rounded-2xl text-xs text-amber-800 dark:text-amber-300 font-medium">
                {realGpsError}
              </div>
            )}

            {/* No route active warning */}
            {!activeRuta ? (
              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-8 rounded-2xl text-center">
                <Compass className="h-8 w-8 text-slate-300 dark:text-slate-700 mx-auto mb-2 animate-pulse" />
                <p className="text-xs font-semibold text-slate-500">Primero debes iniciar una ruta en la pestaña "Mis Rutas" para abrir la navegación GPS.</p>
                <button 
                  onClick={() => setActiveTab('rutas')}
                  className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold"
                >
                  Ver Rutas
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Proximity Alerts Banner */}
                {alertMessage && (
                  <div className="bg-amber-500 text-white border border-amber-600 p-3.5 rounded-2xl flex items-center gap-3 animate-bounce shadow-lg shadow-amber-500/10">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0 animate-pulse" />
                    <div>
                      <p className="text-xs font-extrabold">{alertMessage}</p>
                      <p className="text-[9px] opacity-90 mt-0.5">Alertando sonoramente a los ciudadanos de la zona.</p>
                    </div>
                  </div>
                )}

                {/* Leaflet Map Div */}
                <div className="relative">
                  <div 
                    ref={mapContainerRef} 
                    className="h-80 w-full rounded-2xl border border-slate-200 dark:border-slate-850 shadow-inner z-10"
                  />
                  <div className="absolute right-2.5 bottom-2.5 bg-white/95 dark:bg-slate-950/95 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 shadow z-20 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                    Transmitiendo GPS Real
                  </div>
                </div>

                {/* Real GPS Status & Telemetry Card */}
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-4 rounded-2xl shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                        Transmisión GPS Real en Tiempo Real
                      </h4>
                      <p className="text-[9px] text-slate-500 font-medium">Ubicación satelital emitida desde tu dispositivo a la central municipal</p>
                    </div>
                    {currentPosition && (
                      <button
                        onClick={() => {
                          if (mapRef.current && currentPosition) {
                            mapRef.current.setView(currentPosition, 16);
                          }
                        }}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-bold transition-all shadow-sm shadow-emerald-500/20"
                      >
                        Centrar Ubicación
                      </button>
                    )}
                  </div>

                  {/* Real GPS coordinates & telemetry details */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-900 text-[10px]">
                    <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Latitud Real</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{currentPosition ? currentPosition[0].toFixed(5) : 'Conectando...'}</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Longitud Real</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{currentPosition ? currentPosition[1].toFixed(5) : 'Conectando...'}</span>
                    </div>
                    <div className="col-span-2 sm:col-span-1 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Precisión Satelital</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {gpsAccuracy ? `±${gpsAccuracy.toFixed(1)}m (GPS)` : 'Transmitiendo'}
                      </span>
                    </div>
                  </div>
                  {lastGpsSyncTime && (
                    <p className="text-[9px] text-slate-400 font-mono mt-2 text-right">
                      Última señal sincronizada: {lastGpsSyncTime}
                    </p>
                  )}
                </div>

                {/* Quick Stop List */}
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-4 rounded-2xl shadow-sm">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Paradas en esta Ruta</h4>
                  <div className="space-y-3">
                    {activeRuta.geometria_ruta?.map((node, idx) => {
                      const dist = currentPosition ? getDistance(currentPosition[0], currentPosition[1], node.lat, node.lng) : 999;
                      const isNear = dist < 50;

                      return (
                        <div key={node.nombre || `node-${idx}-${node.lat}`} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-2 last:border-0 last:pb-0">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <div>
                              <p className="text-xs font-bold text-slate-800 dark:text-white">{node.nombre || `Parada ${idx + 1}`}</p>
                              <p className="text-[9px] text-slate-500">Distancia: {dist.toFixed(0)}m</p>
                            </div>
                          </div>

                          {isNear ? (
                            <span className="text-[9px] font-black uppercase bg-amber-500 text-white px-2 py-0.5 rounded-lg">
                              Proximo
                            </span>
                          ) : dist < 200 ? (
                            <span className="text-[9px] font-bold bg-sky-500 text-white px-2 py-0.5 rounded-lg">
                              Cerca
                            </span>
                          ) : (
                            <span className="text-[9px] font-medium bg-slate-100 dark:bg-slate-900 text-slate-500 px-2 py-0.5 rounded-lg">
                              En ruta
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Incidencias List & Form */}
        {activeTab === 'incidencias' && (
          <div className="space-y-4 fade-in-up">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Reportar Incidencia de Ruta</h3>
            
            {/* Form */}
            <form onSubmit={handleIncidentSubmit} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-4 rounded-2xl shadow-sm space-y-4">
              {incidentSuccessMsg && (
                <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 p-3 rounded-xl text-xs font-bold">
                  {incidentSuccessMsg}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Tipo de Incidencia</label>
                <select
                  required
                  value={incidenyType}
                  onChange={(e) => setIncidentType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Selecciona una opción...</option>
                  <option value="Vehiculo averiado">Vehículo averiado / Falla mecánica</option>
                  <option value="Via bloqueada">Vía bloqueada / Obra vial</option>
                  <option value="Accidente de transito">Accidente de tránsito</option>
                  <option value="Contenedor inaccesible">Contenedor inaccesible</option>
                  <option value="Clima adverso">Clima adverso / Lluvia extrema</option>
                  <option value="Otro">Otro (Especificar en descripción)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Descripción del Incidente</label>
                <textarea
                  required
                  rows={3}
                  value={incidentDesc}
                  onChange={(e) => setIncidentDesc(e.target.value)}
                  placeholder="Detalla lo sucedido (mínimo 10 caracteres)..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-emerald-800/10 dark:border-slate-800 p-2.5 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-500"
                />
                {incidentDesc.length > 0 && incidentDesc.length < 10 && (
                  <p className="text-[10px] text-red-500 mt-1">Faltan {10 - incidentDesc.length} caracteres.</p>
                )}
              </div>

              <button
                type="submit"
                disabled={submittingIncident || !incidenyType || incidentDesc.length < 10}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow shadow-emerald-500/15 flex items-center justify-center gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                {submittingIncident ? 'Enviando...' : 'Enviar Reporte'}
              </button>
            </form>

            {/* List of past incidents */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mt-6">Historial de Incidencias</h4>
              {incidencias.length === 0 ? (
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl text-center">
                  <AlertOctagon className="h-6 w-6 text-slate-350 mx-auto mb-1.5" />
                  <p className="text-xs text-slate-500">No has reportado incidencias.</p>
                </div>
              ) : (
                incidencias.map((inc) => (
                  <div key={inc.id} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-4 rounded-2xl">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold">{new Date(inc.created_at).toLocaleDateString()}</span>
                        <h5 className="text-xs font-extrabold text-slate-800 dark:text-white">{inc.tipo}</h5>
                      </div>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        inc.estado === 'resuelta' 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-400' 
                          : 'bg-red-100 text-red-800 dark:bg-red-400/10 dark:text-red-400'
                      }`}>
                        {inc.estado}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-xl">
                      {inc.descripcion}
                    </p>

                    {inc.respuesta_admin && (
                      <div className="mt-2 text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-xl">
                        <strong>Respuesta Administrador:</strong>
                        <p className="mt-0.5 opacity-90">{inc.respuesta_admin}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* Completion Dialog / Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <form 
            onSubmit={handleCompletionSubmit} 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-xl"
          >
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Reportar Finalización de Ruta</h3>
              <p className="text-xs text-slate-500">Completa los detalles de cumplimiento de la ruta.</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Estado de Finalización</label>
              <select
                value={completionStatus}
                onChange={(e: any) => setCompletionStatus(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-905 border border-slate-250 dark:border-slate-800 p-2.5 rounded-xl text-xs font-bold focus:outline-none"
              >
                <option value="completada">Completada al 100%</option>
                <option value="parcialmente_completada">Parcialmente Completada</option>
                <option value="no_completada">No Completada</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Observaciones / Feedback</label>
              <textarea
                rows={3}
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="Indica cualquier inconveniente o detalle de la recolección..."
                className="w-full bg-slate-50 dark:bg-slate-905 border border-slate-250 dark:border-slate-800 p-2.5 rounded-xl text-xs focus:outline-none"
              />
            </div>

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowCompletionModal(false);
                  setCompletionNotes('');
                  setCompletionRouteId(null);
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 font-bold text-xs py-2.5 rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submittingCompletion}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md shadow-emerald-500/10"
              >
                {submittingCompletion ? 'Guardando...' : 'Confirmar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bottom Sticky Tab Bar for Mobile App Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-45 bg-white/95 dark:bg-slate-950/95 border-t border-slate-200 dark:border-slate-800 py-2.5 px-6 flex justify-around backdrop-blur-md shadow-lg transition-colors duration-300">
        
        {/* Tab 1: Rutas */}
        <button
          onClick={() => setActiveTab('rutas')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all ${
            activeTab === 'rutas' 
              ? 'text-emerald-500 dark:text-emerald-400 scale-105' 
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
          }`}
        >
          <Calendar className="h-5 w-5" />
          <span>Mis Rutas</span>
        </button>

        {/* Tab 2: Mapa */}
        <button
          onClick={() => setActiveTab('mapa')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all ${
            activeTab === 'mapa' 
              ? 'text-emerald-500 dark:text-emerald-400 scale-105' 
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
          }`}
        >
          <Compass className="h-5 w-5" />
          <span>Navegar GPS</span>
        </button>

        {/* Tab 3: Incidencias */}
        <button
          onClick={() => setActiveTab('incidencias')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all ${
            activeTab === 'incidencias' 
              ? 'text-emerald-500 dark:text-emerald-400 scale-105' 
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
          }`}
        >
          <AlertOctagon className="h-5 w-5" />
          <span>Incidencias</span>
        </button>
      </nav>
    </div>
  );
}
