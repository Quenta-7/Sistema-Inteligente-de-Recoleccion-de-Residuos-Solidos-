import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  MapPin, 
  LogOut, 
  Trophy, 
  ShieldAlert, 
  BarChart3, 
  RefreshCw, 
  Search,
  CheckSquare,
  Shield,
  FileCheck2,
  Sun,
  Moon,
  Trash2,
  Plus,
  Edit,
  Activity,
  Map,
  Play,
  Pause,
  RotateCcw,
  Gauge,
  Info,
  Clock,
  Navigation
} from 'lucide-react';
import { authedFetch } from '../api';
import L from 'leaflet';

type Evidencia = {
  id: number;
  usuario: number;
  usuario_nombre: string;
  zona: number;
  zona_nombre: string;
  tipo_residuo: string;
  descripcion: string;
  foto_url: string | null;
  cantidad: string;
  ecopuntos: number;
  estado: string;
  created_at: string;
  validador?: number;
  validador_nombre?: string;
  fecha_validacion?: string;
};

type Usuario = {
  id: number;
  email: string;
  nombre_completo: string;
  rol: string;
  zona: number | null;
  telefono: string;
  activo: boolean;
  ecopuntos: number;
  acepta_terminos: boolean;
  fecha_aceptacion_terminos: string | null;
  foto_perfil_url?: string | null;
};

type Zona = {
  id: number;
  nombre: string;
  codigo: string;
  descripcion: string | null;
  activa: boolean;
};

type Ruta = {
  id: number;
  recolector: number;
  recolector_nombre?: string;
  zona: number;
  zona_nombre?: string;
  fecha: string;
  hora_inicio: string;
  hora_fin_estimada: string;
  estado: string;
  observaciones?: string;
  distancia_restante: string;
  geometria_ruta?: any;
};

// Simulation constants for San Jerónimo
type RutaDetalle = {
  id: string;
  zona: string;
  conductor: string;
  placa: string;
  puntos: { lat: number; lng: number }[];
  paradas: { nombre: string; hora: string; progressPercent: number }[];
};

const simRutas: Record<string, RutaDetalle> = {
  'SJ-01': {
    id: 'Ruta SJ-01',
    zona: 'Sector Central – Urb. Kennedy',
    conductor: 'Julio Quispe M.',
    placa: 'A3T-851',
    puntos: [
      { lat: -13.5485, lng: -71.8772 },
      { lat: -13.5493, lng: -71.8755 },
      { lat: -13.5505, lng: -71.8740 },
      { lat: -13.5518, lng: -71.8730 },
      { lat: -13.5528, lng: -71.8718 },
      { lat: -13.5535, lng: -71.8705 },
      { lat: -13.5522, lng: -71.8695 }
    ],
    paradas: [
      { nombre: 'Plaza Principal San Jerónimo', hora: '07:00', progressPercent: 0 },
      { nombre: 'Mercado San Jerónimo', hora: '07:20', progressPercent: 40 },
      { nombre: 'Urb. Kennedy – Jr. Simón Bolívar', hora: '07:40', progressPercent: 75 },
      { nombre: 'Final Urb. Kennedy', hora: '08:00', progressPercent: 100 }
    ]
  },
  'SJ-02': {
    id: 'Ruta SJ-02',
    zona: 'Urb. Los Incas – Sector Pillao Matao',
    conductor: 'Efraín Mamani H.',
    placa: 'B2R-412',
    puntos: [
      { lat: -13.5470, lng: -71.8760 },
      { lat: -13.5462, lng: -71.8745 },
      { lat: -13.5455, lng: -71.8730 },
      { lat: -13.5465, lng: -71.8720 },
      { lat: -13.5475, lng: -71.8708 },
      { lat: -13.5490, lng: -71.8698 },
      { lat: -13.5505, lng: -71.8688 }
    ],
    paradas: [
      { nombre: 'Ingreso Urb. Los Incas', hora: '07:00', progressPercent: 0 },
      { nombre: 'Jr. Los Incas (Zona Central)', hora: '07:25', progressPercent: 35 },
      { nombre: 'Inicio Sector Pillao Matao', hora: '07:50', progressPercent: 65 },
      { nombre: 'Final Pillao Matao', hora: '08:15', progressPercent: 100 }
    ]
  }
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminName, setAdminName] = useState('Administrador');
  const [activeTab, setActiveTab] = useState<'stats' | 'evidencias' | 'usuarios' | 'zonas' | 'rutas' | 'monitoreo'>('stats');
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('color-theme') as 'light' | 'dark') || 'light';
  });

  // Datos
  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [rutas, setRutas] = useState<Ruta[]>([]);

  // Estados de carga e info
  const [loadingEvidencias, setLoadingEvidencias] = useState(false);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [loadingZonas, setLoadingZonas] = useState(false);
  const [loadingRutas, setLoadingRutas] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Filtros
  const [filtroUsuario, setFiltroUsuario] = useState('');
  const [filtroEstadoEvidencia, setFiltroEstadoEvidencia] = useState('todos');

  // Modales CRUD States
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<Usuario> | null>(null);
  const [userForm, setUserForm] = useState({
    email: '',
    nombre_completo: '',
    rol: 'ciudadano',
    zona: '',
    telefono: '',
    activo: true,
    ecopuntos: 0,
    password: ''
  });

  const [showZonaModal, setShowZonaModal] = useState(false);
  const [editingZona, setEditingZona] = useState<Partial<Zona> | null>(null);
  const [zonaForm, setZonaForm] = useState({
    nombre: '',
    codigo: '',
    descripcion: '',
    activa: true
  });

  const [showRutaModal, setShowRutaModal] = useState(false);
  const [editingRuta, setEditingRuta] = useState<Partial<Ruta> | null>(null);
  const [rutaForm, setRutaForm] = useState({
    recolector: '',
    zona: '',
    fecha: '',
    hora_inicio: '',
    hora_fin_estimada: '',
    estado: 'programada',
    observaciones: '',
    distancia_restante: '0.0'
  });

  // Simulation State for Monitoreo Tab
  const [selectedRouteId, setSelectedRouteId] = useState<string>('SJ-01');
  const [progress, setProgress] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [telemetry, setTelemetry] = useState({
    velocidad: 0,
    llenado: 20,
    peso: 1.5,
    combustible: 88
  });

  const activeSimRoute = simRutas[selectedRouteId];
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const stopMarkersRef = useRef<L.Marker[]>([]);
  const truckMarkerRef = useRef<L.Marker | null>(null);

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

  useEffect(() => {
    const token = localStorage.getItem('auth_token') ?? sessionStorage.getItem('auth_token');
    const userDataRaw = localStorage.getItem('user_data') ?? sessionStorage.getItem('user_data');
    
    if (!token || !userDataRaw) {
      navigate('/login');
      return;
    }

    try {
      const userData = JSON.parse(userDataRaw);
      if (userData.rol === 'admin') {
        setIsAdmin(true);
        setAdminName(userData.nombre_completo || 'Administrador');
      } else {
        setIsAdmin(false);
      }
    } catch (e) {
      setIsAdmin(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (isAdmin === true) {
      cargarEvidencias();
      cargarUsuarios();
      cargarZonas();
      cargarRutas();
    }
  }, [isAdmin]);

  const cargarEvidencias = async () => {
    try {
      setLoadingEvidencias(true);
      const res = await authedFetch('/api/evidencias/');
      if (res.ok) {
        const data = await res.json();
        setEvidencias(Array.isArray(data) ? data : data.results || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEvidencias(false);
    }
  };

  const cargarUsuarios = async () => {
    try {
      setLoadingUsuarios(true);
      const res = await authedFetch('/api/usuarios/');
      if (res.ok) {
        const data = await res.json();
        setUsuarios(Array.isArray(data) ? data : data.results || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const cargarZonas = async () => {
    try {
      setLoadingZonas(true);
      const res = await authedFetch('/api/zonas/');
      if (res.ok) {
        const data = await res.json();
        setZonas(Array.isArray(data) ? data : data.results || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingZonas(false);
    }
  };

  const cargarRutas = async () => {
    try {
      setLoadingRutas(true);
      const res = await authedFetch('/api/rutas/');
      if (res.ok) {
        const data = await res.json();
        setRutas(Array.isArray(data) ? data : data.results || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRutas(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authedFetch('/api/auth/logout/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error invalidando token en servidor:', error);
    } finally {
      localStorage.removeItem('user_data');
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('user_data');
      sessionStorage.removeItem('auth_token');
      navigate('/login');
    }
  };

  const showFeedback = (text: string, type: 'success' | 'error') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 4500);
  };

  // Validar evidencia (Aprobar / Rechazar)
  const cambiarEstadoEvidencia = async (id: number, nuevoEstado: 'resuelto' | 'en_revision' | 'rechazado') => {
    try {
      const res = await authedFetch(`/api/evidencias/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ estado: nuevoEstado })
      });
      if (res.ok) {
        showFeedback(
          nuevoEstado === 'resuelto' 
            ? 'Evidencia aprobada correctamente. EcoPuntos otorgados.' 
            : nuevoEstado === 'rechazado'
            ? 'Evidencia rechazada correctamente.'
            : 'Evidencia marcada en revisión / observada.', 
          'success'
        );
        cargarEvidencias();
        cargarUsuarios();
      } else {
        showFeedback('Error al actualizar el estado de la evidencia.', 'error');
      }
    } catch (err) {
      showFeedback('Error de comunicación con el servidor.', 'error');
    }
  };

  // USER CRUD
  const saveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEditing = !!editingUser;
      const url = isEditing ? `/api/usuarios/${editingUser.id}/` : `/api/usuarios/`;
      const method = isEditing ? 'PATCH' : 'POST';

      const payload: any = {
        email: userForm.email,
        nombre_completo: userForm.nombre_completo,
        rol: userForm.rol,
        zona: userForm.zona ? Number(userForm.zona) : null,
        telefono: userForm.telefono,
        activo: userForm.activo,
        ecopuntos: Number(userForm.ecopuntos)
      };

      if (!isEditing) {
        payload.username = userForm.email;
        payload.password = userForm.password;
      }

      const res = await authedFetch(url, {
        method,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showFeedback(isEditing ? 'Usuario modificado con éxito.' : 'Usuario creado con éxito.', 'success');
        setShowUserModal(false);
        setEditingUser(null);
        cargarUsuarios();
      } else {
        const errData = await res.json();
        showFeedback(errData.detail || 'Error al guardar el usuario.', 'error');
      }
    } catch (err) {
      showFeedback('Error de conexión con el servidor.', 'error');
    }
  };

  const deleteUser = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar este usuario?')) return;
    try {
      const res = await authedFetch(`/api/usuarios/${id}/`, { method: 'DELETE' });
      if (res.status === 204 || res.ok) {
        showFeedback('Usuario eliminado con éxito.', 'success');
        cargarUsuarios();
      } else {
        showFeedback('No se pudo eliminar el usuario.', 'error');
      }
    } catch (err) {
      showFeedback('Error al intentar conectar con el servidor.', 'error');
    }
  };

  // ZONA CRUD
  const saveZona = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEditing = !!editingZona;
      const url = isEditing ? `/api/zonas/${editingZona.id}/` : `/api/zonas/`;
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await authedFetch(url, {
        method,
        body: JSON.stringify(zonaForm)
      });

      if (res.ok) {
        showFeedback(isEditing ? 'Zona modificada con éxito.' : 'Zona creada con éxito.', 'success');
        setShowZonaModal(false);
        setEditingZona(null);
        cargarZonas();
      } else {
        showFeedback('Error al guardar la zona.', 'error');
      }
    } catch (err) {
      showFeedback('Error de conexión.', 'error');
    }
  };

  const deleteZona = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar esta zona?')) return;
    try {
      const res = await authedFetch(`/api/zonas/${id}/`, { method: 'DELETE' });
      if (res.status === 204 || res.ok) {
        showFeedback('Zona eliminada con éxito.', 'success');
        cargarZonas();
      } else {
        showFeedback('No se pudo eliminar la zona.', 'error');
      }
    } catch (err) {
      showFeedback('Error de conexión.', 'error');
    }
  };

  // RUTA CRUD
  const saveRuta = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEditing = !!editingRuta;
      const url = isEditing ? `/api/rutas/${editingRuta.id}/` : `/api/rutas/`;
      const method = isEditing ? 'PATCH' : 'POST';

      const payload = {
        recolector: Number(rutaForm.recolector),
        zona: Number(rutaForm.zona),
        fecha: rutaForm.fecha,
        hora_inicio: rutaForm.hora_inicio,
        hora_fin_estimada: rutaForm.hora_fin_estimada,
        estado: rutaForm.estado,
        observaciones: rutaForm.observaciones,
        distancia_restante: rutaForm.distancia_restante
      };

      const res = await authedFetch(url, {
        method,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showFeedback(isEditing ? 'Ruta modificada con éxito.' : 'Ruta creada con éxito.', 'success');
        setShowRutaModal(false);
        setEditingRuta(null);
        cargarRutas();
      } else {
        showFeedback('Error al guardar la ruta.', 'error');
      }
    } catch (err) {
      showFeedback('Error al guardar la ruta.', 'error');
    }
  };

  const deleteRuta = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar esta ruta?')) return;
    try {
      const res = await authedFetch(`/api/rutas/${id}/`, { method: 'DELETE' });
      if (res.status === 204 || res.ok) {
        showFeedback('Ruta eliminada con éxito.', 'success');
        cargarRutas();
      } else {
        showFeedback('No se pudo eliminar la ruta.', 'error');
      }
    } catch (err) {
      showFeedback('Error de conexión.', 'error');
    }
  };

  // GPS Simulation engine for admin monitoreo tab
  useEffect(() => {
    let interval: number;
    if (activeTab === 'monitoreo' && isPlaying) {
      interval = window.setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) return 0;
          return Math.min(prev + 0.5 * speedMultiplier, 100);
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [activeTab, isPlaying, speedMultiplier]);

  useEffect(() => {
    if (activeTab === 'monitoreo') {
      let currentSpeed = 0;
      if (isPlaying) {
        const isAtStop = activeSimRoute?.paradas.some((stop) => {
          const diff = Math.abs(progress - stop.progressPercent);
          return diff < 3 && stop.progressPercent > 0 && stop.progressPercent < 100;
        });
        currentSpeed = isAtStop ? 0 : Math.floor(20 + (Math.sin(progress) * 4) + (Math.random() * 3));
      }
      setTelemetry({
        velocidad: currentSpeed,
        llenado: 20 + Math.floor(progress * 0.65),
        peso: Number((1.0 + (progress * 0.032)).toFixed(1)),
        combustible: Math.max(92 - Math.floor(progress * 0.08), 10)
      });
    }
  }, [progress, selectedRouteId, isPlaying, activeTab, activeSimRoute]);

  const getTruckCoords = () => {
    const pts = activeSimRoute?.puntos || [];
    if (pts.length === 0) return { lat: -13.5485, lng: -71.8772 };
    const numSegments = pts.length - 1;
    const progressPerSegment = 100 / numSegments;
    const segmentIndex = Math.min(Math.floor(progress / progressPerSegment), numSegments - 1);
    const startPoint = pts[segmentIndex];
    const endPoint = pts[segmentIndex + 1];
    const relativeProgress = (progress % progressPerSegment) / progressPerSegment;
    return {
      lat: startPoint.lat + (endPoint.lat - startPoint.lat) * relativeProgress,
      lng: startPoint.lng + (endPoint.lng - startPoint.lng) * relativeProgress
    };
  };

  useEffect(() => {
    if (activeTab === 'monitoreo' && mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true
      }).setView([-13.5495, -71.8755], 15);

      L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: 'Map data &copy; Google'
      }).addTo(map);

      mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [activeTab]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || activeTab !== 'monitoreo' || !activeSimRoute) return;

    stopMarkersRef.current.forEach((m) => m.remove());
    stopMarkersRef.current = [];
    if (polylineRef.current) polylineRef.current.remove();

    const latLngs = activeSimRoute.puntos.map((p) => [p.lat, p.lng] as [number, number]);
    const polyline = L.polyline(latLngs, {
      color: '#0284c7',
      weight: 6,
      opacity: 0.85,
      dashArray: '10, 8'
    }).addTo(map);
    polylineRef.current = polyline;

    map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

    activeSimRoute.paradas.forEach((parada, idx) => {
      const ptIndex = Math.min(
        Math.floor((parada.progressPercent / 100) * (activeSimRoute.puntos.length - 1)),
        activeSimRoute.puntos.length - 1
      );
      const pt = activeSimRoute.puntos[ptIndex];

      const paradaIcon = L.divIcon({
        className: 'custom-parada-icon-wrapper',
        html: `<div id="admin-map-stop-${idx}" class="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-lg bg-slate-500 transition-all duration-300">
                 ${idx + 1}
               </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([pt.lat, pt.lng], { icon: paradaIcon })
        .bindPopup(`<strong>Parada ${idx + 1}: ${parada.nombre}</strong><br/>Hora: ${parada.hora}`)
        .addTo(map);

      stopMarkersRef.current.push(marker);
    });
  }, [selectedRouteId, activeTab, activeSimRoute]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || activeTab !== 'monitoreo' || !activeSimRoute) return;

    const truckPos = getTruckCoords();

    if (!truckMarkerRef.current) {
      const truckIcon = L.divIcon({
        className: 'custom-truck-icon-wrapper',
        html: `<div class="w-10 h-10 bg-emerald-505 bg-sky-600 rounded-xl border-2 border-white flex items-center justify-center shadow-xl">
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
        .bindPopup(`<strong>Camión Recolector</strong><br/>Placa: ${activeSimRoute.placa}`)
        .addTo(map);
    } else {
      truckMarkerRef.current.setLatLng([truckPos.lat, truckPos.lng]);
    }

    activeSimRoute.paradas.forEach((parada, idx) => {
      const el = document.getElementById(`admin-map-stop-${idx}`);
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
  }, [progress, activeSimRoute, activeTab]);

  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-white transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="font-semibold text-lg">Cargando perfil administrativo...</p>
        </div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-slate-105 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-900 dark:text-white text-center font-sans transition-colors duration-300">
        <div className="max-w-md glass-panel p-8 rounded-3xl border border-red-500/30">
          <ShieldAlert className="h-20 w-20 text-red-500 mx-auto mb-6 animate-pulse" />
          <h1 className="text-3xl font-black mb-3">Acceso Denegado</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
            Esta área está reservada exclusivamente para los administradores del sistema. Tu cuenta no cuenta con los privilegios necesarios.
          </p>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-505 hover:to-teal-505 text-white font-bold rounded-xl shadow-md transition-all transform hover:-translate-y-0.5"
          >
            Volver al Panel Ciudadano
          </button>
        </div>
      </div>
    );
  }

  const totalEcoPuntosOtorgados = usuarios.reduce((sum, u) => sum + u.ecopuntos, 0);
  const evidenciasPendientes = evidencias.filter(e => e.estado === 'nuevo').length;
  const totalUsuariosCiudadanos = usuarios.filter(u => u.rol === 'ciudadano').length;

  const evidenciasFiltradas = evidencias.filter(e => {
    const cumpleEstado = filtroEstadoEvidencia === 'todos' || e.estado === filtroEstadoEvidencia;
    const cumpleUsuario = e.usuario_nombre.toLowerCase().includes(filtroUsuario.toLowerCase()) || 
                          e.tipo_residuo.toLowerCase().includes(filtroUsuario.toLowerCase());
    return cumpleEstado && cumpleUsuario;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      
      {/* Top Admin Nav */}
      <nav className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 py-4 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-tr from-sky-500 to-indigo-650 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-slate-900 dark:text-white text-xl font-extrabold tracking-tight">
                Control <span className="text-sky-600 dark:text-sky-400">Municipal</span> San Jerónimo
              </span>
              <p className="text-[10px] text-slate-505 dark:text-gray-400 font-bold uppercase tracking-wider">Gestión Administrativa Completa</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-350 hover:text-amber-500 transition-colors bg-slate-100 dark:bg-slate-900 rounded-full border border-slate-200"
              title="Modo Oscuro/Claro"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5 text-amber-400" />}
            </button>
            <div className="hidden md:block text-right">
              <p className="text-sm font-bold text-slate-850 dark:text-slate-200">{adminName}</p>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-sky-100 dark:bg-sky-400/10 text-sky-700 dark:text-sky-400">
                Rol: Administrador
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800"></div>
            <button 
              onClick={handleLogout}
              className="p-2.5 text-slate-500 hover:text-red-650 dark:text-gray-400 dark:hover:text-red-450 transition-colors bg-slate-100 dark:bg-slate-900 rounded-full border border-slate-200"
              title="Cerrar Sesión"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="flex-1 max-w-7xl w-full mx-auto py-10 px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Controls */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            <p className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest mb-3 px-2">Menú Operativo</p>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left ${activeTab === 'stats' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-605 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-805'}`}
            >
              <BarChart3 className="h-4 w-4" />
              Resumen e Indicadores
            </button>
            <button
              onClick={() => setActiveTab('evidencias')}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all text-left ${activeTab === 'evidencias' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-605 dark:text-slate-300 hover:bg-slate-105 dark:hover:bg-slate-805'}`}
            >
              <div className="flex items-center gap-3">
                <CheckSquare className="h-4 w-4" />
                Validar Evidencias
              </div>
              {evidenciasPendientes > 0 && (
                <span className="bg-amber-500 text-slate-950 font-black text-xs px-2 py-0.5 rounded-full">
                  {evidenciasPendientes}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('usuarios')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left ${activeTab === 'usuarios' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-605 dark:text-slate-300 hover:bg-slate-105 dark:hover:bg-slate-805'}`}
            >
              <Users className="h-4 w-4" />
              Gestión de Usuarios
            </button>
            <button
              onClick={() => setActiveTab('zonas')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left ${activeTab === 'zonas' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-605 dark:text-slate-300 hover:bg-slate-105 dark:hover:bg-slate-805'}`}
            >
              <MapPin className="h-4 w-4" />
              Sectores de Acopio
            </button>
            <button
              onClick={() => setActiveTab('rutas')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left ${activeTab === 'rutas' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-605 dark:text-slate-300 hover:bg-slate-105 dark:hover:bg-slate-805'}`}
            >
              <Map className="h-4 w-4" />
              Rutas de Recolección
            </button>
            <button
              onClick={() => setActiveTab('monitoreo')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left ${activeTab === 'monitoreo' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-605 dark:text-slate-300 hover:bg-slate-105 dark:hover:bg-slate-805'}`}
            >
              <Activity className="h-4 w-4 text-emerald-500" />
              Monitoreo y Telemetría
            </button>
          </div>
        </aside>

        {/* Main Panel Content */}
        <main className="flex-1 min-w-0">
          {feedbackMsg && (
            <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 justify-between shadow-lg fade-in-up ${
              feedbackMsg.type === 'success' ? 'bg-emerald-950/70 border-emerald-500/30 text-emerald-300' : 'bg-red-950/70 border-red-500/30 text-red-300'
            }`}>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm font-semibold">{feedbackMsg.text}</p>
              </div>
            </div>
          )}

          {/* Tab 1: Stats */}
          {activeTab === 'stats' && (
            <div className="space-y-8 fade-in-up">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Indicadores del Proyecto Semestral</h1>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Gestión administrativa y cumplimiento del Atributo del Graduado.</p>
                </div>
                <button 
                  onClick={() => { cargarEvidencias(); cargarUsuarios(); cargarZonas(); cargarRutas(); }}
                  className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-100 text-sky-600 dark:text-sky-400 rounded-xl transition-all border border-slate-200"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                  <p className="text-xs font-bold text-slate-500 uppercase">Evidencias Pendientes</p>
                  <p className="text-3xl font-black text-amber-500 mt-2">{evidenciasPendientes}</p>
                </div>
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                  <p className="text-xs font-bold text-slate-500 uppercase">Ciudadanos Activos</p>
                  <p className="text-3xl font-black text-emerald-600 mt-2">{totalUsuariosCiudadanos}</p>
                </div>
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                  <p className="text-xs font-bold text-slate-500 uppercase">EcoPuntos Emitidos</p>
                  <p className="text-3xl font-black text-sky-600 mt-2">{totalEcoPuntosOtorgados.toLocaleString()}</p>
                </div>
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                  <p className="text-xs font-bold text-slate-500 uppercase">Rutas Registradas</p>
                  <p className="text-3xl font-black text-indigo-605 mt-2">{rutas.length}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Validar Evidencias */}
          {activeTab === 'evidencias' && (
            <div className="space-y-6 fade-in-up">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Validación de Reciclaje</h1>
                <p className="text-slate-650 dark:text-slate-400 text-sm mt-1">Revisa y valida las evidencias para otorgar los 50 EcoPuntos reglamentarios.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-200 shadow-sm">
                <input
                  type="text"
                  placeholder="Filtrar por ciudadano o residuo..."
                  value={filtroUsuario}
                  onChange={(e) => setFiltroUsuario(e.target.value)}
                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-4 text-sm"
                />
                <select
                  value={filtroEstadoEvidencia}
                  onChange={(e) => setFiltroEstadoEvidencia(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-4 text-sm"
                >
                  <option value="todos">Todos los Estados</option>
                  <option value="nuevo">Pendientes</option>
                  <option value="en_revision">En revisión</option>
                  <option value="resuelto">Aprobados</option>
                </select>
              </div>

              {loadingEvidencias ? (
                <p className="text-center py-20 text-slate-500">Cargando evidencias...</p>
              ) : evidenciasFiltradas.length === 0 ? (
                <p className="text-center py-10 bg-white dark:bg-slate-950/30 rounded-2xl">No se encontraron evidencias.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {evidenciasFiltradas.map((evidencia) => (
                    <div key={evidencia.id} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm">
                      <div>
                        {evidencia.foto_url && (
                          <img src={evidencia.foto_url} alt="Evidencia" className="w-full h-48 object-cover" />
                        )}
                        <div className="p-5">
                          <span className="text-[10px] font-bold text-sky-600 bg-sky-100 px-2 py-0.5 rounded">{evidencia.tipo_residuo}</span>
                          <p className="text-sm font-bold text-slate-900 dark:text-white mt-2">{evidencia.usuario_nombre}</p>
                          <p className="text-xs text-slate-500 mb-2">{evidencia.zona_nombre}</p>
                          <p className="text-xs text-slate-750 dark:text-slate-300 bg-slate-55 dark:bg-slate-900/60 p-3 rounded-lg mb-4">{evidencia.descripcion}</p>
                          <p className="text-xs font-semibold text-slate-500">Cantidad: {evidencia.cantidad} kg | Puntos a otorgar: {evidencia.ecopuntos} pts</p>
                        </div>
                      </div>
                      {evidencia.estado === 'nuevo' && (
                        <div className="p-5 pt-0 flex gap-2">
                          <button onClick={() => cambiarEstadoEvidencia(evidencia.id, 'resuelto')} className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl">Aprobar (50 pts)</button>
                          <button onClick={() => cambiarEstadoEvidencia(evidencia.id, 'rechazado')} className="flex-1 py-2 bg-red-600 hover:bg-red-550 text-white font-bold text-xs rounded-xl">Rechazar</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Usuarios (Con CRUD) */}
          {activeTab === 'usuarios' && (
            <div className="space-y-6 fade-in-up">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Gestión de Usuarios</h1>
                  <p className="text-slate-650 dark:text-slate-400 text-sm mt-1">Crea, modifica y elimina cuentas de ciudadanos, recolectores y administradores.</p>
                </div>
                <button
                  onClick={() => {
                    setUserForm({
                      email: '',
                      nombre_completo: '',
                      rol: 'ciudadano',
                      zona: '',
                      telefono: '',
                      activo: true,
                      ecopuntos: 0,
                      password: ''
                    });
                    setEditingUser(null);
                    setShowUserModal(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-505 text-white font-bold text-xs rounded-xl"
                >
                  <Plus className="h-4 w-4" /> Nuevo Usuario
                </button>
              </div>

              {loadingUsuarios ? (
                <p className="text-center py-20">Cargando usuarios...</p>
              ) : (
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                    <thead className="bg-slate-100 dark:bg-slate-950">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Nombre / Correo</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Rol</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">EcoPuntos</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Estado</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-250 dark:divide-slate-800 bg-white/40 dark:bg-slate-950/20">
                      {usuarios.map(u => (
                        <tr key={u.id} className="hover:bg-slate-100/40 transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{u.nombre_completo}</p>
                            <p className="text-xs text-slate-500">{u.email}</p>
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold capitalize text-slate-700 dark:text-slate-300">{u.rol}</td>
                          <td className="px-6 py-4 text-sm font-bold text-emerald-600">{u.ecopuntos} pts</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${u.activo ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                              {u.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center space-x-2">
                            <button
                              onClick={() => {
                                setEditingUser(u);
                                setUserForm({
                                  email: u.email,
                                  nombre_completo: u.nombre_completo,
                                  rol: u.rol,
                                  zona: u.zona ? String(u.zona) : '',
                                  telefono: u.telefono || '',
                                  activo: u.activo,
                                  ecopuntos: u.ecopuntos,
                                  password: ''
                                });
                                setShowUserModal(true);
                              }}
                              className="p-1.5 bg-sky-100 hover:bg-sky-200 text-sky-700 rounded-lg inline-flex items-center"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteUser(u.id)}
                              className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg inline-flex items-center"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Zonas (Sectores) (Con CRUD) */}
          {activeTab === 'zonas' && (
            <div className="space-y-6 fade-in-up">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Sectores de San Jerónimo</h1>
                  <p className="text-slate-650 dark:text-slate-400 text-sm mt-1">Crea, modifica y configura los sectores activos en San Jerónimo.</p>
                </div>
                <button
                  onClick={() => {
                    setZonaForm({
                      nombre: '',
                      codigo: '',
                      descripcion: '',
                      activa: true
                    });
                    setEditingZona(null);
                    setShowZonaModal(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-505 text-white font-bold text-xs rounded-xl"
                >
                  <Plus className="h-4 w-4" /> Nuevo Sector
                </button>
              </div>

              {loadingZonas ? (
                <p className="text-center py-20">Cargando sectores...</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {zonas.map(z => (
                    <div key={z.id} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{z.nombre}</h3>
                          <span className="text-xs font-mono bg-slate-100 dark:bg-slate-900 border border-slate-250 px-2 py-0.5 rounded">{z.codigo}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 min-h-[40px] leading-relaxed mb-4">{z.descripcion || 'Sin descripción'}</p>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-900">
                        <span className={`text-xs font-bold ${z.activa ? 'text-emerald-500' : 'text-red-500'}`}>
                          {z.activa ? 'Activo' : 'Inactivo'}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingZona(z);
                              setZonaForm({
                                nombre: z.nombre,
                                codigo: z.codigo,
                                descripcion: z.descripcion || '',
                                activa: z.activa
                              });
                              setShowZonaModal(true);
                            }}
                            className="p-1.5 bg-sky-100 text-sky-700 hover:bg-sky-200 rounded-lg inline-flex items-center"
                            title="Editar"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => deleteZona(z.id)}
                            className="p-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg inline-flex items-center"
                            title="Eliminar"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 5: Rutas de Recolección (Con CRUD) */}
          {activeTab === 'rutas' && (
            <div className="space-y-6 fade-in-up">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Rutas de Recolección</h1>
                  <p className="text-slate-650 dark:text-slate-450 text-sm mt-1">Administra las rutas, asigna recolectores, fechas y estados operativos.</p>
                </div>
                <button
                  onClick={() => {
                    setRutaForm({
                      recolector: usuarios.find(u => u.rol === 'recolector')?.id ? String(usuarios.find(u => u.rol === 'recolector')?.id) : '',
                      zona: zonas[0]?.id ? String(zonas[0].id) : '',
                      fecha: new Date().toISOString().split('T')[0],
                      hora_inicio: '07:00:00',
                      hora_fin_estimada: '10:00:00',
                      estado: 'programada',
                      observaciones: '',
                      distancia_restante: '0.0'
                    });
                    setEditingRuta(null);
                    setShowRutaModal(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-505 text-white font-bold text-xs rounded-xl"
                >
                  <Plus className="h-4 w-4" /> Nueva Ruta
                </button>
              </div>

              {loadingRutas ? (
                <p className="text-center py-20">Cargando rutas...</p>
              ) : (
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                    <thead className="bg-slate-100 dark:bg-slate-950">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Sector / Recolector</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Fecha / Horario</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Estado</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-250 dark:divide-slate-800 bg-white/40 dark:bg-slate-950/20">
                      {rutas.map(r => (
                        <tr key={r.id} className="hover:bg-slate-100/40 transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{r.zona_nombre || `Zona ID: ${r.zona}`}</p>
                            <p className="text-xs text-slate-500">Chofer: {r.recolector_nombre || `ID: ${r.recolector}`}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{r.fecha}</p>
                            <p className="text-[11px] text-slate-500 font-mono">{r.hora_inicio.substring(0,5)} - {r.hora_fin_estimada.substring(0,5)}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold capitalize ${
                              r.estado === 'programada' ? 'bg-blue-100 text-blue-800' :
                              r.estado === 'en_progreso' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                              r.estado === 'completada' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {r.estado.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center space-x-2">
                            <button
                              onClick={() => {
                                setEditingRuta(r);
                                setRutaForm({
                                  recolector: String(r.recolector),
                                  zona: String(r.zona),
                                  fecha: r.fecha,
                                  hora_inicio: r.hora_inicio,
                                  hora_fin_estimada: r.hora_fin_estimada,
                                  estado: r.estado,
                                  observaciones: r.observaciones || '',
                                  distancia_restante: r.distancia_restante
                                });
                                setShowRutaModal(true);
                              }}
                              className="p-1.5 bg-sky-100 text-sky-700 hover:bg-sky-200 rounded-lg inline-flex items-center"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteRuta(r.id)}
                              className="p-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg inline-flex items-center"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 6: Monitoreo GPS y Telemetría (Moved from Citizen to Admin) */}
          {activeTab === 'monitoreo' && (
            <div className="space-y-6 fade-in-up">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <Activity className="h-7 w-7 text-sky-655" /> Monitoreo y Telemetría GPS
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Visualiza los vehículos recolectores en vivo sobre Cusco y audita la telemetría.</p>
                </div>
                <div className="bg-white dark:bg-slate-950 p-3.5 rounded-xl border flex items-center gap-2.5 shadow-sm text-xs font-semibold">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>Servidor de GPS En Línea</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-6">
                
                {/* Map & Controller */}
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl flex flex-col gap-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Mapa Operativo - San Jerónimo</p>
                      <p className="text-[11px] text-slate-500">Controles de velocidad y reproducción satelital</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border p-1 rounded-lg">
                      <button onClick={() => setIsPlaying(!isPlaying)} className="p-1 hover:bg-slate-200 rounded">
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </button>
                      <button onClick={() => setProgress(0)} className="p-1 hover:bg-slate-200 rounded">
                        <RotateCcw className="h-4 w-4" />
                      </button>
                      <div className="h-4 w-px bg-slate-200"></div>
                      {[1, 2.5, 5].map((speed) => (
                        <button
                          key={speed}
                          onClick={() => setSpeedMultiplier(speed)}
                          className={`px-1.5 py-0.5 text-xs rounded font-bold ${speedMultiplier === speed ? 'bg-sky-505 bg-sky-500 text-white' : 'text-slate-500'}`}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative">
                    <div ref={mapContainerRef} className="h-[360px] w-full rounded-2xl border bg-slate-100 overflow-hidden relative z-10" />
                    <div className="absolute left-3 bottom-3 bg-white/95 dark:bg-slate-950/90 border border-slate-200 p-2.5 rounded-lg text-[10px] font-mono shadow z-20">
                      Lat: {getTruckCoords().lat.toFixed(5)}, Lng: {getTruckCoords().lng.toFixed(5)}
                    </div>
                    <div className="absolute right-3 bottom-3 bg-white/95 dark:bg-slate-950/90 border border-slate-200 p-2.5 rounded-lg text-[10px] text-right font-bold text-emerald-650 shadow z-20">
                      Ruta: {progress.toFixed(0)}%
                    </div>
                  </div>

                  {/* Telemetría Panel (Exclusive to admin dashboard) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
                    {[
                      { label: 'Velocidad Camión', value: `${telemetry.velocidad} km/h` },
                      { label: 'Capacidad Tolva', value: `${telemetry.llenado}%`, alert: telemetry.llenado > 80 },
                      { label: 'Carga Recogida', value: `${telemetry.peso} Tons` },
                      { label: 'Tanque Combustible', value: `${telemetry.combustible}%` }
                    ].map((item, idx) => (
                      <div key={idx} className="bg-slate-50 dark:bg-slate-900 border p-3.5 rounded-xl">
                        <p className="text-[10px] text-slate-500 uppercase font-bold">{item.label}</p>
                        <p className={`text-lg font-black mt-1 ${item.alert ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right side selector & Stops list */}
                <div className="flex flex-col gap-6">
                  
                  {/* Select Route */}
                  <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
                    <p className="text-sm font-bold text-slate-900 dark:text-white mb-3">Selecciona la Unidad</p>
                    <div className="space-y-2.5">
                      {Object.values(simRutas).map(r => {
                        const isSelected = selectedRouteId === r.id.replace('Ruta ', '');
                        return (
                          <button
                            key={r.id}
                            onClick={() => { setSelectedRouteId(r.id.replace('Ruta ', '')); setProgress(0); }}
                            className={`w-full border p-3 rounded-xl text-left text-xs ${isSelected ? 'border-sky-500 bg-sky-50 dark:bg-sky-500/10' : 'border-slate-100 hover:bg-slate-50'}`}
                          >
                            <p className="font-bold">{r.id}</p>
                            <p className="text-slate-550 mt-0.5">{r.zona}</p>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">Placa: {r.placa}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Stops Timeline */}
                  <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-6 rounded-3xl shadow-sm flex-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white mb-4">Línea de Paradas Realizadas</p>
                    <div className="space-y-3">
                      {activeSimRoute?.paradas.map((p, idx) => {
                        const hasPassed = progress >= p.progressPercent;
                        return (
                          <div key={idx} className="flex gap-2 text-xs">
                            <span className={`h-4.5 w-4.5 rounded-full flex items-center justify-center font-bold text-[9px] border ${hasPassed ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                              {idx + 1}
                            </span>
                            <div className="flex-1">
                              <p className={`font-bold ${hasPassed ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{p.nombre}</p>
                              <span className="text-[10px] text-slate-450 font-mono">{p.hora}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

        </main>
      </div>

      {/* Modales CRUD */}

      {/* USER MODAL */}
      {showUserModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={saveUser} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h2>
            
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase">Nombre Completo</label>
                <input required type="text" value={userForm.nombre_completo} onChange={e => setUserForm({...userForm, nombre_completo: e.target.value})} className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase">Correo Electrónico</label>
                <input required type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 dark:text-white" />
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Contraseña</label>
                  <input required type="password" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 dark:text-white" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Teléfono</label>
                  <input type="text" value={userForm.telefono} onChange={e => setUserForm({...userForm, telefono: e.target.value})} className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-850 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Rol</label>
                  <select value={userForm.rol} onChange={e => setUserForm({...userForm, rol: e.target.value})} className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 dark:text-white">
                    <option value="ciudadano">Ciudadano</option>
                    <option value="recolector">Recolector</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Sector / Zona</label>
                  <select value={userForm.zona} onChange={e => setUserForm({...userForm, zona: e.target.value})} className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 dark:text-white">
                    <option value="">Ninguno</option>
                    {zonas.map(z => <option key={z.id} value={z.id}>{z.nombre}</option>)}
                  </select>
                </div>
                {editingUser && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase">EcoPuntos</label>
                    <input type="number" value={userForm.ecopuntos} onChange={e => setUserForm({...userForm, ecopuntos: Number(e.target.value)})} className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 dark:text-white" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="activo" checked={userForm.activo} onChange={e => setUserForm({...userForm, activo: e.target.checked})} className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500" />
                <label htmlFor="activo" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Usuario Activo en el Sistema</label>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button type="button" onClick={() => { setShowUserModal(false); setEditingUser(null); }} className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 font-bold text-xs py-3 rounded-xl">Cancelar</button>
              <button type="submit" className="flex-1 bg-sky-600 hover:bg-sky-550 text-white font-bold text-xs py-3 rounded-xl shadow-md">Guardar Usuario</button>
            </div>
          </form>
        </div>
      )}

      {/* ZONA MODAL */}
      {showZonaModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={saveZona} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{editingZona ? 'Editar Sector' : 'Crear Nuevo Sector'}</h2>
            
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase">Nombre del Sector</label>
                <input required type="text" value={zonaForm.nombre} onChange={e => setZonaForm({...zonaForm, nombre: e.target.value})} className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Código Único</label>
                  <input required type="text" value={zonaForm.codigo} onChange={e => setZonaForm({...zonaForm, codigo: e.target.value})} className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 dark:text-white" />
                </div>
                <div className="flex items-center gap-2 pt-4">
                  <input type="checkbox" id="zona-activa" checked={zonaForm.activa} onChange={e => setZonaForm({...zonaForm, activa: e.target.checked})} className="h-4 w-4 rounded" />
                  <label htmlFor="zona-activa" className="text-xs font-semibold">Sector Activo</label>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase">Descripción / Observaciones</label>
                <textarea rows={3} value={zonaForm.descripcion} onChange={e => setZonaForm({...zonaForm, descripcion: e.target.value})} className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 dark:text-white" />
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-slate-100">
              <button type="button" onClick={() => { setShowZonaModal(false); setEditingZona(null); }} className="flex-1 bg-slate-100 text-slate-700 font-bold text-xs py-3 rounded-xl">Cancelar</button>
              <button type="submit" className="flex-1 bg-sky-600 text-white font-bold text-xs py-3 rounded-xl">Guardar Sector</button>
            </div>
          </form>
        </div>
      )}

      {/* RUTA MODAL */}
      {showRutaModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={saveRuta} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{editingRuta ? 'Editar Ruta de Recolección' : 'Crear Nueva Ruta'}</h2>
            
            <div className="grid grid-cols-1 gap-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Recolector (Chofer)</label>
                  <select required value={rutaForm.recolector} onChange={e => setRutaForm({...rutaForm, recolector: e.target.value})} className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 dark:text-white">
                    <option value="">Selecciona recolector</option>
                    {usuarios.filter(u => u.rol === 'recolector').map(u => <option key={u.id} value={u.id}>{u.nombre_completo}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Sector Asignado</label>
                  <select required value={rutaForm.zona} onChange={e => setRutaForm({...rutaForm, zona: e.target.value})} className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 dark:text-white">
                    <option value="">Selecciona sector</option>
                    {zonas.map(z => <option key={z.id} value={z.id}>{z.nombre}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Fecha</label>
                  <input required type="date" value={rutaForm.fecha} onChange={e => setRutaForm({...rutaForm, fecha: e.target.value})} className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 rounded-xl p-2.5 text-[10px] text-slate-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Hora Inicio</label>
                  <input required type="text" placeholder="HH:MM:SS" value={rutaForm.hora_inicio} onChange={e => setRutaForm({...rutaForm, hora_inicio: e.target.value})} className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Hora Fin Est.</label>
                  <input required type="text" placeholder="HH:MM:SS" value={rutaForm.hora_fin_estimada} onChange={e => setRutaForm({...rutaForm, hora_fin_estimada: e.target.value})} className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 dark:text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Estado Operativo</label>
                  <select value={rutaForm.estado} onChange={e => setRutaForm({...rutaForm, estado: e.target.value})} className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 dark:text-white">
                    <option value="programada">Programada</option>
                    <option value="en_progreso">En progreso</option>
                    <option value="completada">Completada</option>
                    <option value="parcialmente_completada">Parcialmente completada</option>
                    <option value="no_completada">No completada</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Distancia Restante (km)</label>
                  <input type="text" value={rutaForm.distancia_restante} onChange={e => setRutaForm({...rutaForm, distancia_restante: e.target.value})} className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase">Observaciones Operacionales</label>
                <textarea rows={3} value={rutaForm.observaciones} onChange={e => setRutaForm({...rutaForm, observaciones: e.target.value})} className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 dark:text-white" />
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-slate-100">
              <button type="button" onClick={() => { setShowRutaModal(false); setEditingRuta(null); }} className="flex-1 bg-slate-100 text-slate-700 font-bold text-xs py-3 rounded-xl">Cancelar</button>
              <button type="submit" className="flex-1 bg-sky-600 text-white font-bold text-xs py-3 rounded-xl">Guardar Ruta</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
