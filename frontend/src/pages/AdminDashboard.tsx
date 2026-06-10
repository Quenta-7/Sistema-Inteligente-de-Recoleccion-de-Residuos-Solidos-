import { useEffect, useState } from 'react';
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
  Moon
} from 'lucide-react';
import { authedFetch } from '../api';

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
};

type Zona = {
  id: number;
  nombre: string;
  codigo: string;
  descripcion: string | null;
  activa: boolean;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminName, setAdminName] = useState('Administrador');
  const [activeTab, setActiveTab] = useState<'stats' | 'evidencias' | 'usuarios' | 'zonas'>('stats');
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

  // Datos
  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [zonas, setZonas] = useState<Zona[]>([]);

  // Estados de carga e info
  const [loadingEvidencias, setLoadingEvidencias] = useState(false);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [loadingZonas, setLoadingZonas] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Filtros
  const [filtroUsuario, setFiltroUsuario] = useState('');
  const [filtroEstadoEvidencia, setFiltroEstadoEvidencia] = useState('todos');

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
        setAdminName(userData.nombre || 'Administrador');
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

  const handleLogout = () => {
    localStorage.removeItem('user_data');
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('user_data');
    sessionStorage.removeItem('auth_token');
    navigate('/login');
  };

  const showFeedback = (text: string, type: 'success' | 'error') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 4500);
  };

  // Validar evidencia (Aprobar / Rechazar)
  const cambiarEstadoEvidencia = async (id: number, nuevoEstado: 'resuelto' | 'en_revision') => {
    try {
      const res = await authedFetch(`/api/evidencias/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ estado: nuevoEstado })
      });
      if (res.ok) {
        showFeedback(
          nuevoEstado === 'resuelto' 
            ? 'Evidencia aprobada correctamente. EcoPuntos otorgados.' 
            : 'Evidencia marcada en revisión / observada.', 
          'success'
        );
        cargarEvidencias();
        // Recargar usuarios para ver los ecopuntos actualizados
        cargarUsuarios();
      } else {
        showFeedback('Error al actualizar el estado de la evidencia.', 'error');
      }
    } catch (err) {
      showFeedback('Error de comunicación con el servidor.', 'error');
    }
  };

  // Cambiar rol de usuario
  const cambiarRolUsuario = async (userId: number, nuevoRol: string) => {
    try {
      const res = await authedFetch(`/api/usuarios/${userId}/`, {
        method: 'PATCH',
        body: JSON.stringify({ rol: nuevoRol })
      });
      if (res.ok) {
        showFeedback('Rol de usuario actualizado con éxito.', 'success');
        cargarUsuarios();
      } else {
        showFeedback('No se pudo cambiar el rol del usuario.', 'error');
      }
    } catch (e) {
      showFeedback('Error al actualizar el rol.', 'error');
    }
  };

  // Habilitar / Deshabilitar Zona
  const toggleZona = async (zonaId: number, estadoActual: boolean) => {
    try {
      const res = await authedFetch(`/api/zonas/${zonaId}/`, {
        method: 'PATCH',
        body: JSON.stringify({ activa: !estadoActual })
      });
      if (res.ok) {
        showFeedback('Estado de la zona actualizado con éxito.', 'success');
        cargarZonas();
      } else {
        showFeedback('No se pudo cambiar el estado de la zona.', 'error');
      }
    } catch (e) {
      showFeedback('Error al actualizar la zona.', 'error');
    }
  };

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
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-900 dark:text-white text-center font-sans transition-colors duration-300">
        <div className="max-w-md glass-panel p-8 rounded-3xl border border-red-500/30">
          <ShieldAlert className="h-20 w-20 text-red-500 mx-auto mb-6 animate-pulse" />
          <h1 className="text-3xl font-black mb-3">Acceso Denegado</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
            Esta área está reservada exclusivamente para los administradores municipales y del sistema. Tu cuenta no cuenta con los privilegios necesarios.
          </p>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-md transition-all transform hover:-translate-y-0.5"
          >
            Volver al Panel Ciudadano
          </button>
        </div>
      </div>
    );
  }

  // Métricas
  const totalEcoPuntosOtorgados = usuarios.reduce((sum, u) => sum + u.ecopuntos, 0);
  const evidenciasPendientes = evidencias.filter(e => e.estado === 'nuevo').length;
  const totalUsuariosCiudadanos = usuarios.filter(u => u.rol === 'ciudadano').length;

  // Filtrado de evidencias
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
            <div className="h-10 w-10 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-slate-900 dark:text-white text-xl font-extrabold tracking-tight">
                Control <span className="text-sky-650 dark:text-sky-400">Municipal</span> Cusco
              </span>
              <p className="text-[10px] text-slate-500 dark:text-gray-400 font-bold uppercase tracking-wider">Te Quiero Verde - Gestión Administrativa</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-350 hover:text-amber-500 transition-colors bg-slate-100 dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800"
              title={theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5 text-amber-400" />}
            </button>
            <div className="hidden md:block text-right">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{adminName}</p>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-sky-100 dark:bg-sky-400/10 text-sky-700 dark:text-sky-400">
                Rol: Administrador
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800"></div>
            <button 
              onClick={handleLogout}
              className="p-2.5 text-slate-500 hover:text-red-650 dark:text-gray-400 dark:hover:text-red-450 transition-colors bg-slate-100 dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800"
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
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left ${activeTab === 'stats' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
            >
              <BarChart3 className="h-4 w-4" />
              Resumen e Indicadores
            </button>
            <button
              onClick={() => setActiveTab('evidencias')}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all text-left ${activeTab === 'evidencias' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
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
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left ${activeTab === 'usuarios' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
            >
              <Users className="h-4 w-4" />
              Gestión de Usuarios
            </button>
            <button
              onClick={() => setActiveTab('zonas')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left ${activeTab === 'zonas' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
            >
              <MapPin className="h-4 w-4" />
              Zonas de Cusco
            </button>
          </div>
        </aside>

        {/* Main Panel Content */}
        <main className="flex-1 min-w-0">
          
          {/* Notification Alert */}
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

          {/* Tab 1: Stats / Resumen */}
          {activeTab === 'stats' && (
            <div className="space-y-8 fade-in-up">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Indicadores del Proyecto Semestral</h1>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Atributo del Graduado AG-C01.2: Impacto ético, legal y social.</p>
                </div>
                <button 
                  onClick={() => { cargarEvidencias(); cargarUsuarios(); cargarZonas(); }}
                  className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-105 dark:hover:bg-slate-700 text-sky-600 dark:text-sky-400 rounded-xl transition-all border border-slate-200 dark:border-slate-700"
                  title="Sincronizar"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>

              {/* KPI Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/60 p-6 rounded-2xl shadow-sm transition-colors duration-300">
                  <p className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Evidencias Pendientes</p>
                  <div className="mt-2 flex items-baseline justify-between">
                    <p className="text-3xl font-black text-amber-500 dark:text-amber-400">{evidenciasPendientes}</p>
                    <span className="text-[10px] text-amber-600 dark:text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full">Revisión requerida</span>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/60 p-6 rounded-2xl shadow-sm transition-colors duration-300">
                  <p className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Ciudadanos Activos</p>
                  <div className="mt-2 flex items-baseline justify-between">
                    <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{totalUsuariosCiudadanos}</p>
                    <span className="text-[10px] text-emerald-650 dark:text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">En Cusco</span>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/60 p-6 rounded-2xl shadow-sm transition-colors duration-300">
                  <p className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">EcoPuntos Emitidos</p>
                  <div className="mt-2 flex items-baseline justify-between">
                    <p className="text-3xl font-black text-sky-600 dark:text-sky-400">{totalEcoPuntosOtorgados.toLocaleString()}</p>
                    <span className="text-[10px] text-sky-655 dark:text-sky-500 font-bold bg-sky-500/10 px-2 py-0.5 rounded-full">Puntaje global</span>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/60 p-6 rounded-2xl shadow-sm transition-colors duration-300">
                  <p className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Zonas Registradas</p>
                  <div className="mt-2 flex items-baseline justify-between">
                    <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{zonas.length}</p>
                    <span className="text-[10px] text-indigo-655 dark:text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-full">
                      {zonas.filter(z => z.activa).length} Activas
                    </span>
                  </div>
                </div>
              </div>

              {/* Criterios Rúbrica UNSAAC */}
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <FileCheck2 className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                  Estatus de Cumplimiento Ético-Legal (AG-C01.2)
                </h2>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                  Bajo la directiva de la UNSAAC, la plataforma evalúa el cumplimiento legal e informático de la solución. A continuación se reporta la auditoría del sistema:
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                    <div className="h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs flex-shrink-0">✓</div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Ley N° 29733 (Datos Personales)</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Checkboxes de consentimiento activo en el registro y páginas detalladas de Políticas de Privacidad y Términos y Condiciones incorporadas.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                    <div className="h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs flex-shrink-0">✓</div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Auditoría en Base de Datos</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">El modelo Usuario de Django ahora almacena de forma inalterable campos booleanos de consentimiento y la marca de tiempo de aceptación.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                    <div className="h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs flex-shrink-0">✓</div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Mitigación de Fraude en Ecopuntos</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">El sistema ha dejado de sumar puntos en la carga automática del ciudadano. Ahora los puntos son otorgados estrictamente cuando el Administrador valida visualmente la imagen.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Validar Evidencias */}
          {activeTab === 'evidencias' && (
            <div className="space-y-6 fade-in-up">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Validación de Reciclaje</h1>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Revisa las fotos subidas por los ciudadanos de Cusco y valida su reciclaje para otorgarles EcoPuntos.</p>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Filtrar por ciudadano o residuo..."
                    value={filtroUsuario}
                    onChange={(e) => setFiltroUsuario(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors duration-300"
                  />
                </div>
                <div>
                  <select
                    value={filtroEstadoEvidencia}
                    onChange={(e) => setFiltroEstadoEvidencia(e.target.value)}
                    className="w-full sm:w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors duration-300"
                  >
                    <option value="todos">Todos los Estados</option>
                    <option value="nuevo">Pendientes (Nuevos)</option>
                    <option value="en_revision">En revisión / Observados</option>
                    <option value="resuelto">Aprobados (Resueltos)</option>
                  </select>
                </div>
              </div>

              {loadingEvidencias ? (
                <div className="text-center py-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-400 mx-auto mb-3"></div>
                  <p className="text-gray-400">Cargando evidencias de reciclaje...</p>
                </div>
              ) : evidenciasFiltradas.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-950/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
                  <p className="text-gray-500">No se encontraron evidencias registradas.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {evidenciasFiltradas.map((evidencia) => (
                    <div key={evidencia.id} className="bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-slate-350 dark:hover:border-slate-700 shadow-sm transition-all duration-300">
                      <div>
                        {evidencia.foto_url ? (
                           <img 
                             src={evidencia.foto_url} 
                             alt="Evidencia del reciclaje" 
                             className="w-full h-48 object-cover bg-slate-100 dark:bg-slate-900" 
                           />
                        ) : (
                          <div className="w-full h-48 bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 gap-2">
                            <Trophy className="h-10 w-10 opacity-30" />
                            <span className="text-xs">Sin fotografía adjunta</span>
                          </div>
                        )}
                        <div className="p-5">
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest bg-sky-100 dark:bg-sky-400/10 px-2 py-0.5 rounded">
                              {evidencia.tipo_residuo}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              evidencia.estado === 'nuevo' ? 'bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-400 border border-amber-200 dark:border-amber-400/20' :
                              evidencia.estado === 'en_revision' ? 'bg-red-105 text-red-700 dark:bg-red-400/10 dark:text-red-400 border border-red-200 dark:border-red-400/20' :
                              'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-400/20'
                            }`}>
                              {evidencia.estado === 'nuevo' ? 'Pendiente' : 
                               evidencia.estado === 'en_revision' ? 'Observado' : 
                               'Aprobado'}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">{evidencia.usuario_nombre}</p>
                          <p className="text-xs text-slate-500 dark:text-gray-400 mb-4">{evidencia.zona_nombre || `Zona ID: ${evidencia.zona}`}</p>
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50/60 dark:bg-slate-900/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800 mb-4 h-16 overflow-y-auto">
                            {evidencia.descripcion}
                          </p>
                          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-gray-400">
                            <span>Cantidad: <strong className="text-slate-850 dark:text-white">{evidencia.cantidad} kg</strong></span>
                            <span>Valoración: <strong className="text-emerald-600 dark:text-emerald-400">+{evidencia.ecopuntos} pts</strong></span>
                          </div>
                        </div>
                      </div>

                      {evidencia.estado === 'nuevo' && (
                        <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-900/60 mt-4 flex gap-3">
                          <button
                            onClick={() => cambiarEstadoEvidencia(evidencia.id, 'resuelto')}
                            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
                          >
                            <CheckCircle className="h-4 w-4" /> Aprobar
                          </button>
                          <button
                            onClick={() => cambiarEstadoEvidencia(evidencia.id, 'en_revision')}
                            className="flex-1 py-2 bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-955/65 text-slate-700 hover:text-red-600 dark:text-slate-300 dark:hover:text-red-400 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-900/40 transition-all active:scale-95"
                          >
                            <XCircle className="h-4 w-4" /> Observar
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Gestión de Usuarios */}
          {activeTab === 'usuarios' && (
            <div className="space-y-6 fade-in-up">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Gestión de Usuarios</h1>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Visualiza los usuarios registrados en el sistema, promueve roles y verifica la aceptación legal.</p>
              </div>

              {loadingUsuarios ? (
                <div className="text-center py-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-400 mx-auto mb-3"></div>
                  <p className="text-gray-400">Cargando base de datos de usuarios...</p>
                </div>
              ) : (
                <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                      <thead className="bg-slate-100 dark:bg-slate-950">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Usuario</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Rol</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">EcoPuntos</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Consentimiento Legal</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white/40 dark:bg-slate-950/20">
                        {usuarios.map((usuario) => (
                          <tr key={usuario.id} className="hover:bg-slate-100/40 dark:hover:bg-slate-900/30 transition-colors duration-200">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div>
                                  <p className="text-sm font-bold text-slate-900 dark:text-white">{usuario.nombre_completo}</p>
                                  <p className="text-xs text-slate-550 dark:text-gray-500 font-mono">{usuario.email}</p>
                                  {usuario.telefono && <p className="text-[10px] text-slate-500 dark:text-gray-500">{usuario.telefono}</p>}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                value={usuario.rol}
                                onChange={(e) => cambiarRolUsuario(usuario.id, e.target.value)}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 font-bold transition-colors duration-300"
                              >
                                <option value="ciudadano">Ciudadano</option>
                                <option value="admin">Administrador</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-1.5 text-sm font-extrabold text-emerald-400">
                                <Trophy className="h-4 w-4" />
                                {usuario.ecopuntos} pts
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                {usuario.acepta_terminos ? (
                                  <div className="flex flex-col">
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                                      <CheckCircle className="h-3.5 w-3.5" /> Aceptó Términos
                                    </span>
                                    {usuario.fecha_aceptacion_terminos && (
                                      <span className="text-[10px] text-gray-500 font-medium">
                                        {new Date(usuario.fecha_aceptacion_terminos).toLocaleString('es-PE')}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-xs font-bold text-red-400">
                                    <XCircle className="h-3.5 w-3.5" /> No registrado
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs">
                              <span className={`px-2.5 py-1 rounded-full font-bold ${usuario.activo ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                {usuario.activo ? 'Activo' : 'Inactivo'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Zonas */}
          {activeTab === 'zonas' && (
            <div className="space-y-6 fade-in-up">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Zonas de Recolección</h1>
                <p className="text-slate-650 dark:text-slate-400 text-sm mt-1">Activa o desactiva las zonas de servicio en el Cusco según disponibilidad municipal.</p>
              </div>

              {loadingZonas ? (
                <div className="text-center py-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-450 mx-auto mb-3"></div>
                  <p className="text-gray-500">Cargando catálogo de zonas...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {zonas.map((zona) => (
                    <div key={zona.id} className="bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-350 dark:hover:border-slate-700 shadow-sm transition-all duration-300">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{zona.nombre}</h3>
                          <span className="text-[10px] font-bold font-mono text-slate-500 dark:text-gray-400 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded transition-colors duration-300">
                            {zona.codigo}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-gray-450 leading-relaxed min-h-[40px] mb-4">
                          {zona.descripcion || 'Sin descripción detallada registrada para esta zona.'}
                        </p>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-900 pt-4 mt-2">
                        <span className={`text-xs font-bold ${zona.activa ? 'text-emerald-400' : 'text-red-400'}`}>
                          {zona.activa ? 'Servicio Activo' : 'Servicio Deshabilitado'}
                        </span>
                        <button
                          onClick={() => toggleZona(zona.id, zona.activa)}
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            zona.activa 
                              ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                              : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          }`}
                        >
                          {zona.activa ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-850 py-8 mt-auto transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-gray-400 font-medium">
          <p>© 2026 Plataforma Te Quiero Verde Cusco - Municipalidad Provincial del Cusco. Gestión Administrativa.</p>
          <div className="flex gap-4 font-bold">
            <a href="/terminos-condiciones" target="_blank" className="hover:text-emerald-600 dark:hover:text-sky-400 transition-colors underline">
              Términos y Condiciones
            </a>
            <span>•</span>
            <a href="/politica-privacidad" target="_blank" className="hover:text-emerald-600 dark:hover:text-sky-400 transition-colors underline">
              Política de Privacidad
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;
