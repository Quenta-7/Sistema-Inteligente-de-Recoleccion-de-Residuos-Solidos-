import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, AlertTriangle, LogOut, Map, Bell, User, ChevronRight, Leaf } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md mr-3">
                 <span className="text-white font-bold text-xl">E</span>
              </div>
              <span className="text-gray-900 text-2xl font-extrabold tracking-tight">Eco<span className="text-emerald-600">Cusco</span></span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-emerald-500 transition-colors bg-gray-100 hover:bg-emerald-50 rounded-full">
                <Bell className="h-5 w-5" />
              </button>
              <div className="h-8 w-px bg-gray-200"></div>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  <User className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-bold text-gray-900">Ciudadano Demo</p>
                  <p className="text-xs text-gray-500 font-medium">San Sebastián</p>
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
        <div className="flex items-center justify-between mb-10 fade-in-up">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Panel de Control</h1>
            <p className="mt-2 text-gray-600 font-medium">¿Qué deseas realizar hoy para mantener limpia tu ciudad?</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <Link to="/horarios" className="group glass-card rounded-2xl overflow-hidden fade-in-up delay-100 relative">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Calendar className="h-24 w-24 text-emerald-600" />
            </div>
            <div className="p-8 relative z-10">
              <div className="h-14 w-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                <Calendar className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Horarios de Recolección</h3>
              <p className="text-gray-500 text-sm mb-6 line-clamp-2">Consulta los días y horas exactas en los que pasará el camión recolector por tu zona de residencia.</p>
              <div className="flex items-center text-emerald-600 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                Consultar ahora <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </div>
          </Link>

          {/* Card 2 */}
          <Link to="/reportes" className="group glass-card rounded-2xl overflow-hidden fade-in-up delay-200 relative">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <AlertTriangle className="h-24 w-24 text-amber-500" />
            </div>
            <div className="p-8 relative z-10">
              <div className="h-14 w-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                <AlertTriangle className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Reportar Incidencia</h3>
              <p className="text-gray-500 text-sm mb-6 line-clamp-2">¿Ves basura acumulada en tu calle? Envía un reporte con foto a las autoridades locales.</p>
              <div className="flex items-center text-amber-600 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                Crear reporte <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </div>
          </Link>

          {/* Card 3 (Coming Soon) */}
          <div className="glass-card rounded-2xl overflow-hidden fade-in-up delay-300 relative border-dashed border-2 border-gray-300 bg-gray-50/50">
            <div className="p-8 relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="h-14 w-14 bg-gray-200 text-gray-400 rounded-2xl flex items-center justify-center mb-6">
                  <Map className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-400 mb-2">Mapa en Vivo</h3>
                <p className="text-gray-400 text-sm mb-6">Podrás ver por dónde va el camión recolector en tiempo real.</p>
              </div>
              <div className="inline-flex">
                <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs font-bold rounded-full uppercase tracking-wide">
                  Próximamente
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Dashboard Stats / Banner */}
        <div className="mt-12 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-8 shadow-xl text-white fade-in-up delay-300 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
             <Leaf className="h-64 w-64" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold mb-2">Cusco más limpio, juntos.</h2>
              <p className="text-emerald-100 max-w-lg">Has ahorrado aproximadamente 24kg de CO2 al reciclar tus residuos orgánicos este mes. ¡Sigue así!</p>
            </div>
            <div className="flex space-x-6">
              <div className="text-center bg-white/20 backdrop-blur-sm rounded-2xl p-4 min-w-[120px]">
                <p className="text-4xl font-black mb-1">12</p>
                <p className="text-sm text-emerald-100 font-medium">Reportes Resueltos</p>
              </div>
              <div className="text-center bg-white/20 backdrop-blur-sm rounded-2xl p-4 min-w-[120px]">
                <p className="text-4xl font-black mb-1">98%</p>
                <p className="text-sm text-emerald-100 font-medium">Precisión de zona</p>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;
