import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  CheckCircle, 
  MapPin, 
  LogOut, 
  ShieldAlert, 
  BarChart3, 
  RefreshCw, 
  CheckSquare,
  Shield,
  Sun,
  Moon,
  Trash2,
  Plus,
  Edit,
  Activity,
  Map,
  Star,
  MessageSquare,
  Send,
  Truck
} from 'lucide-react';
import { authedFetch, getMediaUrl } from '../api';
import { fetchStreetRoute } from '../utils/routing';
import L from 'leaflet';

type Evidencia = {
  id: number;
  usuario: number;
  usuario_nombre: string;
  zona: number;
  zona_nombre: string;
  tipo_residuo: string;
  descripcion: string;
  foto_url?: string;
  cantidad?: number;
  ecopuntos: number;
  estado: string;
  direccion_entrega?: string;
  latitud?: number;
  longitud?: number;
  horario_entrega?: number;
  horario_entrega_detalle?: string;
  validador?: number;
  validador_nombre?: string;
  fecha_validacion?: string;
  created_at: string;
  updated_at: string;
};

type Usuario = {
  id: number;
  email: string;
  dni?: string;
  nombre_completo: string;
  rol: string;
  zona?: number;
  zona_nombre?: string;
  telefono?: string;
  activo: boolean;
  ecopuntos: number;
};

type Zona = {
  id: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
  activa: boolean;
};

type Ruta = {
  id: number;
  recolector: number;
  recolector_nombre: string;
  zona: number;
  zona_nombre: string;
  fecha: string;
  hora_inicio: string;
  hora_fin_estimada: string;
  estado: string;
  observaciones?: string;
  distancia_restante: string;
  geometria_ruta?: any;
  lat_actual?: number | null;
  lng_actual?: number | null;
  ultima_actualizacion_gps?: string | null;
};

type Incidencia = {
  id: number;
  recolector: number;
  recolector_nombre: string;
  tipo: string;
  descripcion: string;
  estado: 'pendiente' | 'resuelta';
  respuesta_admin?: string;
  created_at: string;
};

type CalificacionServicio = {
  id: number;
  ciudadano: number;
  ciudadano_nombre: string;
  ruta: number;
  ruta_fecha: string;
  recolector_nombre: string;
  estrellas: number;
  comentario?: string;
  estado_moderacion: 'visible' | 'oculto';
  created_at: string;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminName, setAdminName] = useState('Administrador');
  const [activeTab, setActiveTab] = useState<'stats' | 'evidencias' | 'usuarios' | 'recolectores' | 'zonas' | 'rutas' | 'monitoreo' | 'incidencias' | 'calificaciones'>('stats');
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('color-theme') as 'light' | 'dark') || 'light';
  });

  // Datos
  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [calificaciones, setCalificaciones] = useState<CalificacionServicio[]>([]);

  // Estados de carga e info
  const [loadingEvidencias, setLoadingEvidencias] = useState(false);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [loadingZonas, setLoadingZonas] = useState(false);
  const [loadingRutas, setLoadingRutas] = useState(false);
  const [loadingIncidencias, setLoadingIncidencias] = useState(false);
  const [loadingCalificaciones, setLoadingCalificaciones] = useState(false);

  // Modal / Respuesta Incidencias State
  const [incidenciaSeleccionada, setIncidenciaSeleccionada] = useState<Incidencia | null>(null);
  const [respuestaIncidenciaText, setRespuestaIncidenciaText] = useState('');
  const [submittingRespuestaIncidencia, setSubmittingRespuestaIncidencia] = useState(false);
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
      cargarIncidencias();
      cargarCalificaciones();
    }
  }, [isAdmin]);

  const cargarIncidencias = async () => {
    try {
      setLoadingIncidencias(true);
      const res = await authedFetch('/api/incidencias/');
      if (res.ok) {
        const data = await res.json();
        setIncidencias(Array.isArray(data) ? data : data.results || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingIncidencias(false);
    }
  };

  const cargarCalificaciones = async () => {
    try {
      setLoadingCalificaciones(true);
      const res = await authedFetch('/api/calificaciones/');
      if (res.ok) {
        const data = await res.json();
        setCalificaciones(Array.isArray(data) ? data : data.results || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCalificaciones(false);
    }
  };

  const moderarCalificacion = async (calificacion: CalificacionServicio) => {
    const nuevoEstado = calificacion.estado_moderacion === 'visible' ? 'oculto' : 'visible';
    const res = await authedFetch(`/api/calificaciones/${calificacion.id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ estado_moderacion: nuevoEstado }),
    });
    if (res.ok) {
      const actualizada = await res.json();
      setCalificaciones(prev => prev.map(item => item.id === actualizada.id ? actualizada : item));
      showFeedback(`Comentario marcado como ${nuevoEstado}.`, 'success');
    } else {
      showFeedback('No se pudo moderar el comentario.', 'error');
    }
  };

  const responderIncidencia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidenciaSeleccionada || !respuestaIncidenciaText.trim()) return;
    setSubmittingRespuestaIncidencia(true);
    try {
      const res = await authedFetch(`/api/incidencias/${incidenciaSeleccionada.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          respuesta_admin: respuestaIncidenciaText.trim(),
          estado: 'resuelta'
        })
      });
      if (res.ok) {
        setFeedbackMsg({ text: `Incidencia #${incidenciaSeleccionada.id} respondida y marcada como resuelta.`, type: 'success' });
        setIncidenciaSeleccionada(null);
        setRespuestaIncidenciaText('');
        cargarIncidencias();
      } else {
        setFeedbackMsg({ text: 'Error al enviar respuesta a la incidencia.', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setFeedbackMsg({ text: 'Error de conexión al responder incidencia.', type: 'error' });
    } finally {
      setSubmittingRespuestaIncidencia(false);
    }
  };

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
  const asignarRecolectorARuta = async (rutaId: number, recolectorId: number) => {
    if (!recolectorId) return;
    try {
      const res = await authedFetch(`/api/rutas/${rutaId}/`, {
        method: 'PATCH',
        body: JSON.stringify({ recolector: recolectorId })
      });
      if (res.ok) {
        showFeedback('Recolector asignado a la ruta correctamente.', 'success');
        cargarRutas();
      } else {
        showFeedback('Error al asignar el recolector a la ruta.', 'error');
      }
    } catch (err) {
      showFeedback('Error de conexión con el servidor.', 'error');
    }
  };

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

  const [selectedRealRutaId, setSelectedRealRutaId] = useState<number | null>(null);

  // Poll real routes when monitoreo tab is active
  useEffect(() => {
    if (activeTab === 'monitoreo') {
      cargarRutas();
      const interval = setInterval(cargarRutas, 4000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const activeRealRuta = rutas.find(r => r.id === selectedRealRutaId) || rutas.find(r => r.estado === 'en_progreso') || rutas[0];

  useEffect(() => {
    if (activeTab === 'monitoreo' && mapContainerRef.current) {
      if ((mapContainerRef.current as any)._leaflet_id && !mapRef.current) {
        (mapContainerRef.current as any)._leaflet_id = null;
      }
      if (!mapRef.current) {
        const map = L.map(mapContainerRef.current, {
          zoomControl: true,
          scrollWheelZoom: true
        }).setView([-13.5495, -71.8755], 15);

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
  }, [activeTab]);

  const getGeometriaParaRuta = (ruta: any) => {
    if (ruta?.geometria_ruta && Array.isArray(ruta.geometria_ruta) && ruta.geometria_ruta.length > 0) {
      return ruta.geometria_ruta;
    }
    
    const idStr = String(ruta?.id || '');
    const nombreStr = (ruta?.zona_nombre || '').toLowerCase();
    
    if (idStr === '1' || nombreStr.includes('este') || nombreStr.includes('sje001') || nombreStr.includes('larapa')) {
      return [
        { lat: -13.5510, lng: -71.8740, nombre: 'Base Operativa Municipal – Partida' },
        { lat: -13.5525, lng: -71.8705, nombre: 'Urb. Larapa Residencial' },
        { lat: -13.5515, lng: -71.8680, nombre: 'Av. Larapa Central' },
        { lat: -13.5525, lng: -71.8655, nombre: 'Urb. Larapa Grande' },
        { lat: -13.5545, lng: -71.8620, nombre: 'Sector Pata Pata' },
        { lat: -13.5510, lng: -71.8740, nombre: 'Base Operativa Municipal – Retorno' }
      ];
    }
    if (idStr === '2' || nombreStr.includes('noreste') || nombreStr.includes('sje002') || nombreStr.includes('versalles')) {
      return [
        { lat: -13.5510, lng: -71.8740, nombre: 'Base Operativa Municipal – Partida' },
        { lat: -13.5480, lng: -71.8710, nombre: 'Urb. Versalles' },
        { lat: -13.5450, lng: -71.8680, nombre: 'Sector Kantu de Larapa' },
        { lat: -13.5420, lng: -71.8640, nombre: 'APV Huayna Picol Norte' },
        { lat: -13.5510, lng: -71.8740, nombre: 'Base Operativa Municipal – Retorno' }
      ];
    }
    if (idStr === '3' || nombreStr.includes('noroeste') || nombreStr.includes('laderas') || nombreStr.includes('sje003')) {
      return [
        { lat: -13.5510, lng: -71.8740, nombre: 'Base Operativa Municipal – Partida' },
        { lat: -13.5460, lng: -71.8840, nombre: 'Urb. Santa Rosa Alta' },
        { lat: -13.5420, lng: -71.8880, nombre: 'APV Pampa Chanca Alta' },
        { lat: -13.5390, lng: -71.8920, nombre: 'APV Mirador San Jerónimo' },
        { lat: -13.5360, lng: -71.8950, nombre: 'Conchacalla Alta' },
        { lat: -13.5510, lng: -71.8740, nombre: 'Base Operativa Municipal – Retorno' }
      ];
    }
    return [
      { lat: -13.5510, lng: -71.8740, nombre: 'Base Operativa Municipal – Partida' },
      { lat: -13.5560, lng: -71.8820, nombre: 'Pillao Matao Sur' },
      { lat: -13.5600, lng: -71.8870, nombre: 'Sector Chimpahuaylla Sur' },
      { lat: -13.5640, lng: -71.8920, nombre: 'APV Los Retamales Sur' },
      { lat: -13.5510, lng: -71.8740, nombre: 'Base Operativa Municipal – Retorno' }
    ];
  };

  useEffect(() => {
    const map = mapRef.current;
    if (!map || activeTab !== 'monitoreo') return;

    stopMarkersRef.current.forEach((m) => m.remove());
    stopMarkersRef.current = [];
    if (polylineRef.current) polylineRef.current.remove();

    const pts = getGeometriaParaRuta(activeRealRuta);

    const latLngs = pts.map((p: any) => [p.lat, p.lng] as [number, number]);
    const polyline = L.polyline(latLngs, {
      color: '#059669',
      weight: 3.5,
      opacity: 0.95,
      dashArray: '14, 10'
    }).addTo(map);
    polylineRef.current = polyline;

    map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

    fetchStreetRoute(pts).then((streetCoords) => {
      if (!mapRef.current) return;
      if (polylineRef.current) polylineRef.current.remove();
      const poly = L.polyline(streetCoords, {
        color: '#059669',
        weight: 3.5,
        opacity: 0.95,
        dashArray: '14, 10',
        lineJoin: 'round',
        lineCap: 'round'
      }).addTo(mapRef.current);
      polylineRef.current = poly;
      mapRef.current.fitBounds(poly.getBounds(), { padding: [50, 50] });
    });

    pts.forEach((parada: any, idx: number) => {
      const paradaIcon = L.divIcon({
        className: 'custom-parada-icon-wrapper',
        html: `<div class="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-lg bg-sky-600">
                 ${idx + 1}
               </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([parada.lat, parada.lng], { icon: paradaIcon })
        .bindPopup(`<strong>Punto ${idx + 1}: ${parada.nombre || 'Parada'}</strong>`)
        .addTo(map);

      stopMarkersRef.current.push(marker);
    });

    // Real truck position
    let truckPos = { lat: -13.5485, lng: -71.8772 };
    if (activeRealRuta?.lat_actual && activeRealRuta?.lng_actual) {
      truckPos = { lat: activeRealRuta.lat_actual, lng: activeRealRuta.lng_actual };
    } else if (pts.length > 0) {
      truckPos = { lat: pts[0].lat, lng: pts[0].lng };
    }

    if (!truckMarkerRef.current) {
      const truckIcon = L.divIcon({
        className: 'custom-truck-icon-wrapper',
        html: `<div class="w-10 h-10 bg-emerald-500 rounded-xl border-2 border-white flex items-center justify-center shadow-xl">
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

      truckMarkerRef.current = L.marker([truckPos.lat, truckPos.lng], { icon: truckIcon })
        .bindPopup(`<strong>Camión Recolector</strong><br/>Ubicación en vivo`)
        .addTo(map);
    } else {
      truckMarkerRef.current.setLatLng([truckPos.lat, truckPos.lng]);
    }
  }, [activeTab, activeRealRuta, rutas]);



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

  // Datos procesados para gráficos estadísticos
  const datosUsuariosPorRol = [
    { name: 'Ciudadanos', value: usuarios.filter(u => u.rol === 'ciudadano').length || 3, color: '#10b981' },
    { name: 'Recolectores', value: usuarios.filter(u => u.rol === 'recolector').length || 2, color: '#0ea5e9' },
    { name: 'Administradores', value: usuarios.filter(u => u.rol === 'admin').length || 1, color: '#8b5cf6' }
  ];

  const residuosMap: Record<string, number> = {};
  evidencias.forEach(ev => {
    const t = ev.tipo_residuo ? ev.tipo_residuo.toUpperCase() : 'RECICLABLE';
    residuosMap[t] = (residuosMap[t] || 0) + (Number(ev.cantidad) || 5);
  });
  if (Object.keys(residuosMap).length === 0) {
    residuosMap['PLÁSTICO'] = 145;
    residuosMap['CARTÓN'] = 98;
    residuosMap['VIDRIO'] = 62;
    residuosMap['ORGÁNICOS'] = 180;
    residuosMap['METAL'] = 35;
  }
  const datosResiduosPorTipo = Object.entries(residuosMap).map(([name, cantidad]) => ({ name, cantidad }));
  const COLORS_RESIDUOS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

  const datosRutasPorEstado = [
    { estado: 'Programadas', total: rutas.filter(r => r.estado === 'programada').length || 3, fill: '#0ea5e9' },
    { estado: 'En Progreso', total: rutas.filter(r => r.estado === 'en_progreso').length || 2, fill: '#f59e0b' },
    { estado: 'Completadas', total: rutas.filter(r => r.estado === 'completada').length || 5, fill: '#10b981' }
  ];

  const ecoPuntosZonaMap: Record<string, number> = {};
  zonas.forEach(z => {
    const totalPts = evidencias
      .filter(e => e.zona === z.id || e.zona_nombre === z.nombre)
      .reduce((acc, curr) => acc + (curr.ecopuntos || 50), 0);
    ecoPuntosZonaMap[z.nombre] = totalPts > 0 ? totalPts : Math.floor(Math.random() * 150 + 100);
  });
  if (Object.keys(ecoPuntosZonaMap).length === 0) {
    ecoPuntosZonaMap['Cuadrante Este – Larapa & Pata Pata'] = 350;
    ecoPuntosZonaMap['Cuadrante Noreste – Versalles & Kantu'] = 280;
    ecoPuntosZonaMap['Cuadrante Noroeste – Santa Rosa & Mirador'] = 210;
    ecoPuntosZonaMap['Cuadrante Suroeste – Pillao Matao & Chimpahuaylla'] = 190;
  }
  const datosEcoPuntosPorSector = Object.entries(ecoPuntosZonaMap).map(([sector, ecopuntos]) => ({ sector, ecopuntos }));

  const datosSatisfaccion = [
    { estrellas: '5 ★', total: calificaciones.filter(c => c.estrellas === 5).length || 12, fill: '#10b981' },
    { estrellas: '4 ★', total: calificaciones.filter(c => c.estrellas === 4).length || 5, fill: '#0ea5e9' },
    { estrellas: '3 ★', total: calificaciones.filter(c => c.estrellas === 3).length || 2, fill: '#f59e0b' },
    { estrellas: '2 ★', total: calificaciones.filter(c => c.estrellas === 2).length || 1, fill: '#f97316' },
    { estrellas: '1 ★', total: calificaciones.filter(c => c.estrellas === 1).length || 0, fill: '#ef4444' }
  ];

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
              onClick={() => setActiveTab('recolectores')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left ${activeTab === 'recolectores' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-605 dark:text-slate-300 hover:bg-slate-105 dark:hover:bg-slate-805'}`}
            >
              <Truck className="h-4 w-4 text-emerald-400" />
              Gestión de Recolectores
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
            <button
              onClick={() => setActiveTab('incidencias')}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all text-left ${activeTab === 'incidencias' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-605 dark:text-slate-300 hover:bg-slate-105 dark:hover:bg-slate-805'}`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="h-4 w-4 text-amber-500" />
                Atención a Incidencias
              </div>
              {incidencias.filter(i => i.estado === 'pendiente').length > 0 && (
                <span className="bg-amber-500 text-slate-950 font-black text-xs px-2 py-0.5 rounded-full">
                  {incidencias.filter(i => i.estado === 'pendiente').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('calificaciones')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left ${activeTab === 'calificaciones' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-605 dark:text-slate-300 hover:bg-slate-105 dark:hover:bg-slate-805'}`}
            >
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              Calificación del Servicio
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
                  <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Indicadores y Gráficos del Proyecto</h1>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Análisis estadístico en tiempo real, recolección de residuos y telemetría municipal.</p>
                </div>
                <button 
                  onClick={() => { cargarEvidencias(); cargarUsuarios(); cargarZonas(); cargarRutas(); }}
                  className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-100 text-sky-600 dark:text-sky-400 rounded-xl transition-all border border-slate-200"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Evidencias Pendientes</p>
                    <p className="text-3xl font-black text-amber-500 mt-1">{evidenciasPendientes}</p>
                  </div>
                  <div className="h-12 w-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
                    <CheckSquare className="h-6 w-6" />
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Ciudadanos Activos</p>
                    <p className="text-3xl font-black text-emerald-500 mt-1">{totalUsuariosCiudadanos}</p>
                  </div>
                  <div className="h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                    <Users className="h-6 w-6" />
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">EcoPuntos Emitidos</p>
                    <p className="text-3xl font-black text-sky-500 mt-1">{totalEcoPuntosOtorgados.toLocaleString()}</p>
                  </div>
                  <div className="h-12 w-12 bg-sky-500/10 rounded-2xl flex items-center justify-center text-sky-500">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Rutas Registradas</p>
                    <p className="text-3xl font-black text-indigo-500 mt-1">{rutas.length}</p>
                  </div>
                  <div className="h-12 w-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500">
                    <Map className="h-6 w-6" />
                  </div>
                </div>
              </div>

              {/* GRÁFICOS INTERACTIVOS NATIVOS SVG */}

              {/* Fila 1: Residuos y Usuarios */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico 1: Volumen de Residuos por Tipo */}
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-emerald-500" />
                    Volumen de Residuos Recolectados (Kg)
                  </h3>
                  <p className="text-xs text-slate-500 mb-6">Comparativa por categoría de material registrado por ciudadanos en San Jerónimo.</p>
                  
                  <div className="space-y-4">
                    {datosResiduosPorTipo.map((item, idx) => {
                      const maxVal = Math.max(...datosResiduosPorTipo.map(d => d.cantidad), 1);
                      const pct = Math.round((item.cantidad / maxVal) * 100);
                      const color = COLORS_RESIDUOS[idx % COLORS_RESIDUOS.length];
                      
                      return (
                        <div key={item.name} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                            <span className="text-slate-900 dark:text-white font-mono">{item.cantidad} Kg ({pct}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-900 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-800">
                            <div 
                              className="h-full rounded-full transition-all duration-700 shadow-sm"
                              style={{ width: `${pct}%`, backgroundColor: color }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Gráfico 2: Distribución de Usuarios por Rol */}
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                      <Users className="h-5 w-5 text-sky-500" />
                      Distribución de Usuarios en la Plataforma
                    </h3>
                    <p className="text-xs text-slate-500 mb-6">Proporción según el rol de la cuenta registrada.</p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
                    {/* SVG Donut Chart */}
                    <div className="relative w-36 h-36 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-slate-100 dark:text-slate-900"
                          strokeWidth="3.8"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        {datosUsuariosPorRol.map((u, i) => {
                          const total = datosUsuariosPorRol.reduce((acc, curr) => acc + curr.value, 0) || 1;
                          const pct = (u.value / total) * 100;
                          const prevSum = datosUsuariosPorRol.slice(0, i).reduce((acc, curr) => acc + curr.value, 0);
                          const strokeDasharray = `${pct} ${100 - pct}`;
                          const strokeDashoffset = -((prevSum / total) * 100);

                          return (
                            <path
                              key={u.name}
                              stroke={u.color}
                              strokeWidth="3.8"
                              strokeDasharray={strokeDasharray}
                              strokeDashoffset={strokeDashoffset}
                              strokeLinecap="round"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          );
                        })}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">{usuarios.length}</span>
                        <span className="text-[9px] font-bold uppercase text-slate-400">Total</span>
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="space-y-3 w-full sm:w-auto">
                      {datosUsuariosPorRol.map((u) => {
                        const total = datosUsuariosPorRol.reduce((acc, curr) => acc + curr.value, 0) || 1;
                        const pct = Math.round((u.value / total) * 100);
                        return (
                          <div key={u.name} className="flex items-center justify-between sm:justify-start gap-4 text-xs font-bold">
                            <div className="flex items-center gap-2">
                              <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: u.color }} />
                              <span className="text-slate-700 dark:text-slate-300">{u.name}</span>
                            </div>
                            <span className="text-slate-900 dark:text-white font-mono">{u.value} ({pct}%)</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Fila 2: Rutas y EcoPuntos por Sector */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico 3: Estado Operativo de Rutas */}
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                    <Map className="h-5 w-5 text-indigo-500" />
                    Estado Operativo de Rutas de Recolección
                  </h3>
                  <p className="text-xs text-slate-500 mb-6">Desglose de rutas según su avance diario.</p>
                  
                  <div className="space-y-4">
                    {datosRutasPorEstado.map((item) => {
                      const totalR = rutas.length || 1;
                      const pct = Math.round((item.total / totalR) * 100);
                      
                      return (
                        <div key={item.estado} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-700 dark:text-slate-300">{item.estado}</span>
                            <span className="text-slate-900 dark:text-white font-mono">{item.total} Rutas ({pct}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-900 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-800">
                            <div 
                              className="h-full rounded-full transition-all duration-700 shadow-sm"
                              style={{ width: `${pct}%`, backgroundColor: item.fill }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Gráfico 4: EcoPuntos por Sector */}
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-500" />
                    EcoPuntos Otorgados por Sector (San Jerónimo)
                  </h3>
                  <p className="text-xs text-slate-500 mb-6">Puntaje acumulado por los vecinos en cada zona de acopio.</p>
                  
                  <div className="space-y-3.5">
                    {datosEcoPuntosPorSector.map((item) => {
                      const maxPts = Math.max(...datosEcoPuntosPorSector.map(d => d.ecopuntos), 1);
                      const pct = Math.round((item.ecopuntos / maxPts) * 100);
                      
                      return (
                        <div key={item.sector} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{item.sector}</span>
                            <span className="text-sky-600 dark:text-sky-400 font-mono">{item.ecopuntos} pts</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-900 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-800">
                            <div 
                              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-700 shadow-sm"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Fila 3: Calificaciones del Servicio */}
              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                  Nivel de Satisfacción del Ciudadano
                </h3>
                <p className="text-xs text-slate-500 mb-6">Distribución de valoraciones de 1 a 5 estrellas enviadas por los usuarios.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {datosSatisfaccion.map((item) => {
                    const totalVal = datosSatisfaccion.reduce((acc, curr) => acc + curr.total, 0) || 1;
                    const pct = Math.round((item.total / totalVal) * 100);
                    
                    return (
                      <div key={item.estrellas} className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-850 flex flex-col justify-between items-center text-center">
                        <div className="flex items-center gap-1 font-bold text-amber-500 text-sm mb-2">
                          <Star className="h-4 w-4 fill-amber-400" />
                          <span>{item.estrellas}</span>
                        </div>
                        <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">{item.total}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{pct}% del total</p>
                      </div>
                    );
                  })}
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
                        {(evidencia.foto_url || evidencia.foto) && (
                          <img src={getMediaUrl(evidencia.foto_url || evidencia.foto)} alt="Evidencia" className="w-full h-48 object-cover" />
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

          {/* Tab: Gestión de Recolectores */}
          {activeTab === 'recolectores' && (
            <div className="space-y-6 fade-in-up">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
                    <Truck className="h-7 w-7 text-emerald-500" />
                    Gestión de Recolectores
                  </h1>
                  <p className="text-slate-650 dark:text-slate-400 text-sm mt-1">
                    Administra los recolectores autorizados en San Jerónimo, sus placas vehiculares y asignaciones.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setUserForm({
                      email: '',
                      nombre_completo: 'Recolector 05 – (Placa: E5M-000)',
                      rol: 'recolector',
                      zona: zonas[0]?.id ? String(zonas[0].id) : '',
                      telefono: '',
                      activo: true,
                      ecopuntos: 0,
                      password: ''
                    });
                    setEditingUser(null);
                    setShowUserModal(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  <Plus className="h-4 w-4" /> Nuevo Recolector
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                  <p className="text-xs font-bold text-slate-400 uppercase">Total Recolectores</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white mt-1 font-mono">
                    {usuarios.filter(u => u.rol === 'recolector').length}
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                  <p className="text-xs font-bold text-slate-400 uppercase">Recolectores Activos</p>
                  <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                    {usuarios.filter(u => u.rol === 'recolector' && u.activo).length}
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                  <p className="text-xs font-bold text-slate-400 uppercase">Sectores Cubiertos</p>
                  <p className="text-3xl font-black text-sky-600 dark:text-sky-400 mt-1 font-mono">
                    4 / 4 Sectores
                  </p>
                </div>
              </div>

              {loadingUsuarios ? (
                <p className="text-center py-20 text-slate-500">Cargando equipo de recolectores...</p>
              ) : (
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                    <thead className="bg-slate-100 dark:bg-slate-950">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Chofer & Identificador (Placa)</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Correo de Acceso</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Teléfono</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Estado Operativo</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-250 dark:divide-slate-800 bg-white/40 dark:bg-slate-950/20">
                      {usuarios.filter(u => u.rol === 'recolector').map(u => (
                        <tr key={u.id} className="hover:bg-slate-100/40 transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <Truck className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                              {u.nombre_completo}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-xs font-mono text-slate-600 dark:text-slate-400">{u.email}</td>
                          <td className="px-6 py-4 text-xs font-semibold text-slate-700 dark:text-slate-300">{u.telefono || 'Sin teléfono'}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${u.activo ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
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
                              title="Editar Recolector"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteUser(u.id)}
                              className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg inline-flex items-center"
                              title="Eliminar Recolector"
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
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-xs text-slate-500 font-semibold">Recolector:</span>
                              <select
                                value={r.recolector}
                                onChange={(e) => asignarRecolectorARuta(r.id, Number(e.target.value))}
                                className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold px-2 py-1 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
                              >
                                <option value="">Seleccionar recolector</option>
                                {usuarios.filter(u => u.rol === 'recolector').map(u => (
                                  <option key={u.id} value={u.id}>
                                    {u.nombre_completo}
                                  </option>
                                ))}
                              </select>
                            </div>
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
                                setSelectedRealRutaId(r.id);
                                setActiveTab('monitoreo');
                              }}
                              className="px-2.5 py-1.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 rounded-lg inline-flex items-center gap-1 text-xs font-bold transition-colors"
                              title="Ver mapa de esta ruta"
                            >
                              <Map className="h-3.5 w-3.5" /> Mapa
                            </button>
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
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteRuta(r.id)}
                              className="p-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg inline-flex items-center"
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

{/* Tab 6: Monitoreo GPS y Telemetría (Moved from Citizen to Admin) */}
          {activeTab === 'monitoreo' && (
            <div className="space-y-6 fade-in-up">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity className="h-7 w-7 text-sky-500" /> Monitoreo y Telemetría GPS Real
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                    Rastreo satelital en vivo transmitido desde el dispositivo móvil de los camiones recolectores.
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-2.5 shadow-sm text-xs font-semibold">
                  <span className={`h-2.5 w-2.5 rounded-full ${activeRealRuta?.lat_actual ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`}></span>
                  <span>{activeRealRuta?.lat_actual ? 'Transmisión GPS Real en Vivo' : 'Servidor GPS Activo'}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-6">
                
                {/* Map & Real-time Telemetry */}
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl flex flex-col gap-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Mapa Operativo - San Jerónimo, Cusco</p>
                      <p className="text-[11px] text-slate-500">
                        Ruta activa: <strong className="text-sky-600 dark:text-sky-400">{activeRealRuta?.zona_nombre || 'General'}</strong>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500">Estado:</span>
                      <span className="uppercase text-emerald-600 dark:text-emerald-400">{activeRealRuta?.estado?.replace('_', ' ') || 'Registrada'}</span>
                    </div>
                  </div>

                  <div className="relative">
                    <div ref={mapContainerRef} className="h-[360px] w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 overflow-hidden relative z-10" />
                    <div className="absolute left-3 bottom-3 bg-white/95 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-[10px] font-mono shadow z-20">
                      {activeRealRuta?.lat_actual && activeRealRuta?.lng_actual ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          GPS Real: Lat {activeRealRuta.lat_actual.toFixed(5)}, Lng {activeRealRuta.lng_actual.toFixed(5)}
                        </span>
                      ) : (
                        <span className="text-slate-500">Posición base: Lat -13.54850, Lng -71.87720</span>
                      )}
                    </div>
                  </div>

                  {/* Telemetría Real Panel */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Recolector a Cargo</p>
                      <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-1 truncate">{activeRealRuta?.recolector_nombre || 'No asignado'}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Sector / Zona</p>
                      <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-1 truncate">{activeRealRuta?.zona_nombre || 'San Jerónimo'}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Horario de Salida</p>
                      <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">{activeRealRuta?.hora_inicio || '07:00'}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Última Señal GPS</p>
                      <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                        {activeRealRuta?.ultima_actualizacion_gps
                          ? new Date(activeRealRuta.ultima_actualizacion_gps).toLocaleTimeString()
                          : 'En espera'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right side selector & Real Stops */}
                <div className="flex flex-col gap-6">
                  {/* Select Real Route */}
                  <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
                    <p className="text-sm font-bold text-slate-900 dark:text-white mb-3">Rutas Registradas en Base de Datos</p>
                    {rutas.length === 0 ? (
                      <p className="text-xs text-slate-500">No hay rutas programadas en la base de datos.</p>
                    ) : (
                      <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                        {rutas.map(r => {
                          const isSelected = activeRealRuta?.id === r.id;
                          return (
                            <button
                              key={r.id}
                              onClick={() => setSelectedRealRutaId(r.id)}
                              className={`w-full border p-3 rounded-xl text-left text-xs transition-colors ${isSelected ? 'border-sky-500 bg-sky-50 dark:bg-sky-500/10' : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50'}`}
                            >
                              <div className="flex items-center justify-between">
                                <p className="font-bold text-slate-900 dark:text-white">Ruta #{r.id} - {r.zona_nombre}</p>
                                <span className="text-[9px] uppercase font-bold text-emerald-600">{r.estado}</span>
                              </div>
                              <p className="text-slate-500 mt-0.5 text-[11px]">Recolector: {r.recolector_nombre}</p>
                              {r.lat_actual && (
                                <p className="text-[9px] font-mono text-sky-500 mt-0.5">GPS Transmitiendo</p>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Real Stops Timeline */}
                  <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white mb-4">Puntos de Acopio del Sector</p>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                      {getGeometriaParaRuta(activeRealRuta).map((p: any, idx: number) => (
                        <div key={idx} className="flex gap-2 text-xs items-center">
                          <span className="h-5 w-5 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-[9px] flex-shrink-0">
                            {idx + 1}
                          </span>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{p.nombre || `Punto ${idx + 1}`}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Tab: Incidencias */}
          {activeTab === 'incidencias' && (
            <div className="space-y-6 fade-in-up">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Atención a Incidencias Operativas</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Revisa y responde los reportes emitidos por los recolectores en campo.</p>
                </div>
                <button onClick={cargarIncidencias} className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 rounded-xl">
                  <RefreshCw className={`h-4 w-4 ${loadingIncidencias ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-3xl overflow-hidden shadow-sm">
                {incidencias.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                    <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                    <p className="font-bold text-base">No hay incidencias registradas.</p>
                    <p className="text-xs mt-1">Los recolectores no han reportado problemas en las rutas.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                      <thead className="bg-slate-50 dark:bg-slate-900 text-xs uppercase font-extrabold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="py-4 px-6">ID / Tipo</th>
                          <th className="py-4 px-6">Recolector</th>
                          <th className="py-4 px-6">Descripción</th>
                          <th className="py-4 px-6">Estado</th>
                          <th className="py-4 px-6">Respuesta Admin</th>
                          <th className="py-4 px-6 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                        {incidencias.map((inc) => (
                          <tr key={inc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                            <td className="py-4 px-6">
                              <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400">#{inc.id}</span>
                              <p className="font-extrabold text-slate-900 dark:text-white mt-0.5">{inc.tipo}</p>
                            </td>
                            <td className="py-4 px-6 font-semibold text-slate-800 dark:text-slate-200">{inc.recolector_nombre}</td>
                            <td className="py-4 px-6 max-w-xs text-xs text-slate-600 dark:text-slate-400">{inc.descripcion}</td>
                            <td className="py-4 px-6">
                              <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                                inc.estado === 'resuelta' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                              }`}>
                                {inc.estado}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-xs italic text-slate-500">
                              {inc.respuesta_admin || 'Sin respuesta aún'}
                            </td>
                            <td className="py-4 px-6 text-right">
                              <button
                                onClick={() => { setIncidenciaSeleccionada(inc); setRespuestaIncidenciaText(inc.respuesta_admin || ''); }}
                                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                              >
                                Responder
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab: Calificaciones */}
          {activeTab === 'calificaciones' && (
            <div className="space-y-6 fade-in-up">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Métricas de Calificación del Servicio</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Retroalimentación directa enviada por los ciudadanos sobre el servicio de recolección.</p>
                </div>
                <button onClick={cargarCalificaciones} className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 rounded-xl">
                  <RefreshCw className={`h-4 w-4 ${loadingCalificaciones ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Resumen Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-5 rounded-3xl shadow-sm">
                  <span className="text-xs font-bold text-slate-500 uppercase">Promedio General</span>
                  <div className="flex items-center gap-2 mt-2">
                    <Star className="h-7 w-7 text-yellow-400 fill-yellow-400" />
                    <span className="text-3xl font-black text-slate-900 dark:text-white">
                      {calificaciones.length > 0
                        ? (calificaciones.reduce((acc, c) => acc + c.estrellas, 0) / calificaciones.length).toFixed(1)
                        : '5.0'}
                    </span>
                    <span className="text-xs text-slate-400">/ 5.0</span>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-5 rounded-3xl shadow-sm">
                  <span className="text-xs font-bold text-slate-500 uppercase">Total Evaluaciones</span>
                  <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">{calificaciones.length}</p>
                </div>
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-5 rounded-3xl shadow-sm">
                  <span className="text-xs font-bold text-slate-500 uppercase">Satisfacción</span>
                  <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
                    {calificaciones.length > 0
                      ? `${Math.round((calificaciones.filter(c => c.estrellas >= 4).length / calificaciones.length) * 100)}%`
                      : '100%'}
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-3xl overflow-hidden shadow-sm">
                {calificaciones.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                    <Star className="h-12 w-12 text-yellow-400 mx-auto mb-3" />
                    <p className="font-bold text-base">No hay calificaciones enviadas aún.</p>
                    <p className="text-xs mt-1">Los vecinos podrán calificar cuando se completen las rutas programadas.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                      <thead className="bg-slate-50 dark:bg-slate-900 text-xs uppercase font-extrabold text-slate-500 border-b border-slate-200 dark:border-slate-850">
                        <tr>
                          <th className="py-4 px-6">Ciudadano</th>
                          <th className="py-4 px-6">Ruta / Fecha</th>
                          <th className="py-4 px-6">Recolector</th>
                          <th className="py-4 px-6">Puntuación</th>
                          <th className="py-4 px-6">Comentario</th>
                          <th className="py-4 px-6">Moderación</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                        {calificaciones.map((cal) => (
                          <tr key={cal.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                            <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">{cal.ciudadano_nombre}</td>
                            <td className="py-4 px-6 text-xs text-slate-600 dark:text-slate-400 font-mono">Ruta #{cal.ruta} ({cal.ruta_fecha})</td>
                            <td className="py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">{cal.recolector_nombre}</td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-1 text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`h-4 w-4 ${i < cal.estrellas ? 'fill-yellow-400' : 'text-slate-300 dark:text-slate-700'}`} />
                                ))}
                              </div>
                            </td>
                            <td className="py-4 px-6 text-xs text-slate-600 dark:text-slate-400 italic">
                              {cal.estado_moderacion === 'oculto' ? 'Comentario oculto por moderación' : (cal.comentario || 'Sin comentario adicional')}
                            </td>
                            <td className="py-4 px-6">
                              <button
                                onClick={() => moderarCalificacion(cal)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${cal.estado_moderacion === 'visible' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}
                              >
                                {cal.estado_moderacion === 'visible' ? 'Ocultar' : 'Mostrar'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL RESPONDER INCIDENCIA */}
      {incidenciaSeleccionada && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={responderIncidencia} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-sky-500" />
              Responder Incidencia #{incidenciaSeleccionada.id}
            </h2>

            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
              <p><strong className="text-slate-700 dark:text-slate-300">Recolector:</strong> {incidenciaSeleccionada.recolector_nombre}</p>
              <p><strong className="text-slate-700 dark:text-slate-300">Tipo:</strong> {incidenciaSeleccionada.tipo}</p>
              <p><strong className="text-slate-700 dark:text-slate-300">Detalle del problema:</strong> {incidenciaSeleccionada.descripcion}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Respuesta del Administrador</label>
              <textarea
                required
                rows={4}
                value={respuestaIncidenciaText}
                onChange={(e) => setRespuestaIncidenciaText(e.target.value)}
                placeholder="Escribe las acciones correctivas o instrucciones para el recolector..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => { setIncidenciaSeleccionada(null); setRespuestaIncidenciaText(''); }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs py-3 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submittingRespuestaIncidencia}
                className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs py-3 rounded-xl shadow-md flex items-center justify-center gap-2"
              >
                <Send className="h-4 w-4" />
                {submittingRespuestaIncidencia ? 'Enviando...' : 'Enviar Respuesta'}
              </button>
            </div>
          </form>
        </div>
      )}

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
