import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, CalendarDays, Recycle, Trash2, Leaf, Sun, Moon } from 'lucide-react';
import { authedFetch } from '../api';

interface Zona {
  id: number;
  nombre: string;
}

interface Horario {
  id: number;
  zona: number;
  dia: string;
  hora_inicio: string;
  hora_fin: string;
  tipos_residuo: string[];
}

const Horarios = () => {
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [zonaSeleccionada, setZonaSeleccionada] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError('');

        const resZonas = await authedFetch('/api/zonas/');
        if (!resZonas.ok) throw new Error('Error al cargar zonas');
        const dataZonas = await resZonas.json();
        setZonas(Array.isArray(dataZonas) ? dataZonas : dataZonas.results || []);

        const resHorarios = await authedFetch('/api/horarios/');
        if (!resHorarios.ok) throw new Error('Error al cargar horarios');
        const dataHorarios = await resHorarios.json();
        setHorarios(Array.isArray(dataHorarios) ? dataHorarios : dataHorarios.results || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const horariosFiltrados = zonaSeleccionada
    ? horarios.filter(h => h.zona === Number(zonaSeleccionada))
    : horarios;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
      <div className="max-w-5xl mx-auto fade-in-up">

        {/* Navigation */}
        <div className="flex justify-between items-center mb-8">
          <Link to="/dashboard" className="inline-flex items-center text-emerald-650 hover:text-emerald-750 dark:text-emerald-400 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-2 rounded-full transition-colors border border-emerald-500/10 dark:border-emerald-500/20">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Panel
          </Link>
          
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 dark:text-slate-300 hover:text-amber-500 transition-colors bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm"
            title={theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5 text-amber-400" />}
          </button>
        </div>

        <div className="glass-panel rounded-3xl p-8 sm:p-10">

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Cargando horarios...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Content */}
          {!loading && !error && (
            <>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                <div className="flex items-center">
                  <div className="h-14 w-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mr-5 shadow-sm">
                    <Clock className="h-7 w-7" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      Horarios de Recolección
                    </h2>
                    <p className="text-slate-505 dark:text-gray-400 font-medium mt-1">Conoce los días habilitados para sacar tu basura.</p>
                  </div>
                </div>

                <div className="w-full md:w-72 relative">
                  <label htmlFor="zona" className="sr-only">Selecciona tu Zona</label>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-emerald-500" />
                  </div>
                  <select
                    id="zona"
                    className="block w-full pl-10 pr-10 py-3 text-base border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 rounded-xl font-medium text-gray-700 dark:text-slate-200 transition-all appearance-none cursor-pointer"
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

              <div className="bg-white dark:bg-slate-950/80 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-800 transition-colors duration-300">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100 dark:divide-slate-800">
                    <thead className="bg-gray-50 dark:bg-slate-900/60">
                      <tr>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          <div className="flex items-center"><CalendarDays className="h-4 w-4 mr-2" /> Día de la semana</div>
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          <div className="flex items-center"><Clock className="h-4 w-4 mr-2" /> Rango Horario</div>
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          <div className="flex items-center"><Recycle className="h-4 w-4 mr-2" /> Tipo de Residuo</div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-950/20 divide-y divide-gray-50 dark:divide-slate-800">
                      {horariosFiltrados.map((horario) => (
                        <tr key={horario.id} className="hover:bg-gray-55/60 dark:hover:bg-slate-900/40 transition-colors">
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{horario.dia}</span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-350 bg-gray-100 dark:bg-slate-900 px-3 py-1 rounded-full">{horario.hora_inicio} - {horario.hora_fin}</span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center gap-2 flex-wrap">
                              {horario.tipos_residuo && horario.tipos_residuo.map((tipo, tidx) => {
                                const tipoLower = tipo.toLowerCase();
                                const isOrganico = tipoLower.includes('orgánico') || tipoLower.includes('organico');
                                const isReciclable = tipoLower.includes('reciclable') && !tipoLower.includes('no reciclable');
                                const isNoReciclable = tipoLower.includes('no reciclable');

                                return (
                                  <span key={tidx} className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full gap-1.5 items-center
                                    ${isOrganico ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                      isReciclable ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                      isNoReciclable ? 'bg-gray-100 text-gray-800 border border-gray-200' :
                                      'bg-gray-100 text-gray-800 border border-gray-200'}`}>
                                    {isOrganico && <Leaf className="h-4 w-4" />}
                                    {isReciclable && <Recycle className="h-4 w-4" />}
                                    {isNoReciclable && <Trash2 className="h-4 w-4" />}
                                    {tipo}
                                  </span>
                                );
                              })}
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
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default Horarios;