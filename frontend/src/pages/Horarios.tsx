import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver al Panel
        </Link>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Clock className="h-6 w-6 mr-2 text-emerald-500" />
            Horarios de Recolección
          </h2>

          <div className="mb-6">
            <label htmlFor="zona" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <MapPin className="h-4 w-4 mr-1" /> Selecciona tu Zona
            </label>
            <select
              id="zona"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md border"
              value={zonaSeleccionada}
              onChange={(e) => setZonaSeleccionada(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">Todas las Zonas</option>
              {zonas.map(z => (
                <option key={z.id} value={z.id}>{z.nombre}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Día</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo de Residuo</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {horariosFiltrados.map((horario) => (
                  <tr key={horario.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{horario.dia}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{horario.inicio} - {horario.fin}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${horario.tipo === 'Orgánico' ? 'bg-green-100 text-green-800' : 
                          horario.tipo === 'Reciclable' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                        {horario.tipo}
                      </span>
                    </td>
                  </tr>
                ))}
                {horariosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                      No hay horarios registrados para esta zona.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Horarios;
