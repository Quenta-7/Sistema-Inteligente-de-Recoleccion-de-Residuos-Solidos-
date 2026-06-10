import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, LogOut, Map, Bell, User, ChevronRight, Leaf, Camera, Trophy, Sun, Moon } from 'lucide-react';
import { authedFetch } from '../api';

type UsuarioLocal = {
  nombre?: string;
  zona?: number | null;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [nombreUsuario, setNombreUsuario] = useState('Ciudadano');
  const [ecopuntos, setEcopuntos] = useState(0);
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

  const handleLogout = () => {
    localStorage.removeItem('user_data');
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('user_data');
    sessionStorage.removeItem('auth_token');
    navigate('/login');
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token') ?? sessionStorage.getItem('auth_token');
    const usuarioRaw = localStorage.getItem('user_data') ?? sessionStorage.getItem('user_data');
    
    if (!token || !usuarioRaw) {
      navigate('/login');
      return;
    }

    try {
      const usuario = JSON.parse(usuarioRaw) as UsuarioLocal;
      if (usuario?.nombre) {
        setNombreUsuario(usuario.nombre);
      }
    } catch (error) {
      console.error('No se pudo leer el usuario desde localStorage.', error);
    }

    // Cargar perfil del API para obtener ecopuntos actualizados
    const cargarPerfil = async () => {
      try {
        const response = await authedFetch('/api/perfil/');
        if (response.ok) {
          const data = await response.json();
          setEcopuntos(data.user.ecopuntos || 0);
        }
      } catch (error) {
        console.error('Error cargando perfil:', error);
      }
    };

    cargarPerfil();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-slate-50 to-amber-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      
      {/* Top Navbar */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md mr-3">
                 <span className="text-white font-bold text-xl">V</span>
              </div>
              <span className="text-gray-900 dark:text-white text-2xl font-extrabold tracking-tight">
                Te Quiero <span className="text-emerald-600">Verde</span>{' '}
                <span className="text-sky-600">Cusco</span>
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 dark:text-slate-350 hover:text-amber-500 transition-colors bg-gray-100 dark:bg-slate-800 hover:bg-amber-50 rounded-full"
                title={theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5 text-amber-400" />}
              </button>
              <button className="p-2 text-gray-400 hover:text-amber-500 transition-colors bg-gray-100 hover:bg-amber-50 rounded-full">
                <Bell className="h-5 w-5" />
              </button>
              <div className="h-8 w-px bg-gray-200 dark:bg-slate-700"></div>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-sky-100 dark:bg-sky-950 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-sm">
                  <User className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-bold text-gray-900 dark:text-white"><span>{nombreUsuario}</span></p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-medium"><span>San Sebastián</span></p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="ml-4 p-2 text-gray-400 hover:text-red-500 transition-colors hover:bg-red-50 rounded-full"
                title="Cerrar Sesión"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10 fade-in-up">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Panel de Control</h1>
            <p className="mt-2 text-gray-600 dark:text-slate-350 font-medium">¿Qué deseas realizar hoy para mantener limpia tu ciudad?</p>
          </div>
          <div className="w-full lg:w-auto">
            <div className="bg-white/90 dark:bg-slate-900/95 border border-amber-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4 transition-colors duration-300">
              <div className="h-12 w-12 bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-450 rounded-xl flex items-center justify-center shadow-inner">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-600 dark:text-amber-450 uppercase tracking-wide">EcoPuntos</p>
                <p className="text-2xl font-extrabold text-gray-900 dark:text-white"><span>{ecopuntos.toLocaleString()}</span></p>
                <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Bonificación por evidencia validada: +50</p>
              </div>
              <div className="sm:ml-6">
                <p className="text-xs text-gray-500 dark:text-slate-400 font-medium mb-2">Progreso a recompensa</p>
                <div className="w-full sm:w-48 h-2 bg-amber-100/80 dark:bg-amber-950/40 rounded-full">
                  <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-400 rounded-full w-[83%]"></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-2 font-medium">Siguiente meta: 1,500 puntos</p>
                <Link
                  to="/tienda-ecopuntos"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/60 px-3 py-1 rounded-full hover:bg-sky-100 dark:hover:bg-sky-900"
                >
                  Ir a tienda <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <Link to="/horarios" className="group glass-card rounded-2xl overflow-hidden fade-in-up delay-100 relative">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Calendar className="h-24 w-24 text-sky-600" />
            </div>
            <div className="p-8 relative z-10">
              <div className="h-14 w-14 bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                <Calendar className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Horarios de Recolección</h3>
              <p className="text-gray-500 dark:text-slate-400 text-sm mb-6 line-clamp-2">Consulta los días y horas exactas en los que pasará el camión recolector por tu zona de residencia.</p>
              <div className="flex items-center text-sky-600 dark:text-sky-400 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                Consultar ahora <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </div>
          </Link>

          {/* Card 2 */}
          <Link to="/reportes" className="group glass-card rounded-2xl overflow-hidden fade-in-up delay-200 relative">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Camera className="h-24 w-24 text-rose-600" />
            </div>
            <div className="p-8 relative z-10">
              <div className="h-14 w-14 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-450 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                <Camera className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Evidencias de Reciclaje</h3>
              <p className="text-gray-500 dark:text-slate-400 text-sm mb-6 line-clamp-2">Sube una foto y registra tu reciclaje para sumar EcoPuntos en tu cuenta.</p>
              <div className="flex items-center text-rose-600 dark:text-rose-400 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                Subir evidencia <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </div>
          </Link>

          {/* Card 3 */}
          <Link to="/mapa-en-vivo" className="group glass-card rounded-2xl overflow-hidden fade-in-up delay-300 relative">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Map className="h-24 w-24 text-amber-600" />
            </div>
            <div className="p-8 relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="h-14 w-14 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                  <Map className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Mapa en Vivo</h3>
                <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">Sigue la ruta del camion recolector y las paradas activas.</p>
              </div>
              <div className="inline-flex items-center text-amber-700 dark:text-amber-400 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                Ver mapa <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </div>
          </Link>

        </div>

        {/* Dashboard Stats / Banner */}
        <div className="mt-12 bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-700 rounded-3xl p-8 shadow-xl text-white fade-in-up delay-300 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
             <Leaf className="h-64 w-64" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold mb-2">Cusco más limpio, juntos.</h2>
              <p className="text-sky-100 max-w-lg">Tus evidencias de reciclaje ya están sumando EcoPuntos y mejoran la recolección en tu zona.</p>
            </div>
            <div className="flex space-x-6">
              <div className="text-center bg-white/20 backdrop-blur-sm rounded-2xl p-4 min-w-[120px]">
                <p className="text-4xl font-black mb-1">8</p>
                <p className="text-sm text-amber-100 font-medium">Evidencias registradas</p>
              </div>
              <div className="text-center bg-white/20 backdrop-blur-sm rounded-2xl p-4 min-w-[120px]">
                <p className="text-4xl font-black mb-1">32 kg</p>
                <p className="text-sm text-amber-100 font-medium">Reciclaje acumulado</p>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 border-t border-gray-200 dark:border-slate-800 mt-auto py-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-gray-500 dark:text-slate-400">
          <p className="font-medium">© 2026 Plataforma Te Quiero Verde Cusco - Municipalidad Provincial del Cusco.</p>
          <div className="flex gap-4 font-bold">
            <Link to="/terminos-condiciones" target="_blank" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors underline">
              Términos y Condiciones
            </Link>
            <span>•</span>
            <Link to="/politica-privacidad" target="_blank" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors underline">
              Política de Privacidad
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
