import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, CalendarDays, Recycle, Trash2, Leaf } from 'lucide-react';

const zonas = [
  { id: 1, nombre: 'Centro Histórico' },
  { id: 2, nombre: 'Wanchaq' },
  { id: 3, nombre: 'San Sebastián' },
];

const horarios = [
  { id: 1, zonaId: 1, dia: 'Lunes', inicio: '18:00', fin: '20:00', tipo: 'Orgánico' },
  { id: 2, zonaId: 1, dia: 'Martes', inicio: '18:00', fin: '20:00', tipo: 'Reciclable' },
  { id: 3, zonaId: 2, dia: 'Lunes', inicio: '06:00', fin: '08:00', tipo: 'No Reciclable' },
];

const Horarios = () => {
  const [zonaSeleccionada, setZonaSeleccionada] = useState<number | ''>('');

  const horariosFiltrados = zonaSeleccionada 
    ? horarios.filter(h => h.zonaId === Number(zonaSeleccionada))
    : horarios;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto fade-in-up">
        
        {/* Navigation */}
        <Link to="/dashboard" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium bg-emerald-50 px-4 py-2 rounded-full transition-colors mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al Panel
        </Link>
        
        <div className="glass-panel rounded-3xl p-8 sm:p-10">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
            <div className="flex items-center">
              <div className="h-14 w-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mr-5 shadow-sm">
                <Clock className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  Horarios de Recolección
                </h2>
                <p className="text-gray-500 font-medium mt-1">Conoce los días habilitados para sacar tu basura.</p>
              </div>
            </div>

            <div className="w-full md:w-72 relative">
              <label htmlFor="zona" className="sr-only">Selecciona tu Zona</label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-emerald-500" />
              </div>
              <select
                id="zona"
                className="block w-full pl-10 pr-10 py-3 text-base border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 rounded-xl font-medium text-gray-700 transition-all appearance-none cursor-pointer"
                value={zonaSeleccionada}
                onChange={(e) => setZonaSeleccionada(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">Todas las Zonas</option>
                {zonas.map(z => (
                  <option key={z.id} value={z.id}>{z.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center"><CalendarDays className="h-4 w-4 mr-2" /> Día de la semana</div>
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center"><Clock className="h-4 w-4 mr-2" /> Rango Horario</div>
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center"><Recycle className="h-4 w-4 mr-2" /> Tipo de Residuo</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                  {horariosFiltrados.map((horario, idx) => (
                    <tr key={horario.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="text-sm font-bold text-gray-900">{horario.dia}</span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">{horario.inicio} - {horario.fin}</span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          {horario.tipo === 'Orgánico' && <Leaf className="h-4 w-4 text-emerald-500 mr-2" />}
                          {horario.tipo === 'Reciclable' && <Recycle className="h-4 w-4 text-blue-500 mr-2" />}
                          {horario.tipo === 'No Reciclable' && <Trash2 className="h-4 w-4 text-gray-500 mr-2" />}
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full 
                            ${horario.tipo === 'Orgánico' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 
                              horario.tipo === 'Reciclable' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 
                              'bg-gray-100 text-gray-800 border border-gray-200'}`}>
                            {horario.tipo}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {horariosFiltrados.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-gray-500 font-medium">
                        <div className="flex flex-col items-center justify-center">
                          <MapPin className="h-10 w-10 text-gray-300 mb-3" />
                          No hay horarios registrados para esta zona.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Horarios;
