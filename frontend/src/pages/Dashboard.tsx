import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, AlertTriangle, LogOut, Map } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-emerald-600 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-white text-xl font-bold">EcoCusco</span>
            </div>
            <div className="flex items-center">
              <button 
                onClick={handleLogout}
                className="flex items-center text-emerald-50 hover:text-white"
              >
                <LogOut className="h-5 w-5 mr-1" />
                Salir
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Bienvenido, Ciudadano</h1>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link to="/horarios" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Consultar</dt>
                    <dd className="text-lg font-medium text-gray-900">Horarios de Recolección</dd>
                  </dl>
                </div>
              </div>
            </div>
          </Link>

          <Link to="/reportes" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-amber-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Registrar</dt>
                    <dd className="text-lg font-medium text-gray-900">Reportar Incidencia</dd>
                  </dl>
                </div>
              </div>
            </div>
          </Link>

          <div className="bg-white overflow-hidden shadow rounded-lg opacity-60">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Map className="h-6 w-6 text-blue-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Próximamente</dt>
                    <dd className="text-lg font-medium text-gray-900">Mapa en Vivo</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
