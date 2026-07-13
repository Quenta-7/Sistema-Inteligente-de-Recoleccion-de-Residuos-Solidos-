import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, CalendarDays, Truck, Sun, Moon, Info } from 'lucide-react';
import { authedFetch } from '../api';

interface Zona {
  id: number;
  nombre: string;
}

interface Horario {
  id: number;
  zona: number;
  zona_nombre?: string;
  dia: string;
  hora_inicio: string;
  hora_fin: string;
  tipos_residuo: string[];
}

const Horarios = () => {
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [zonaUsuario, setZonaUsuario] = useState<number | null>(null);
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

        // Identificar zona del ciudadano para auto-filtrado (HU-010)
        try {
          const resPerfil = await authedFetch('/api/perfil/');
          if (resPerfil.ok) {
            const dataPerfil = await resPerfil.json();
            if (dataPerfil.user && dataPerfil.user.zona) {
              setZonaUsuario(Number(dataPerfil.user.zona));
            }
          }
        } catch (perfilErr) {
          console.error('Error al identificar zona del ciudadano:', perfilErr);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const horariosConZona = horarios.map(h => ({
    ...h,
    zona_nombre: zonas.find(z => z.id === h.zona)?.nombre || `Sector ${h.zona}`
  }));

  const diasOrden = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo'];
  const horariosOrdenados = [...horariosConZona].sort((a, b) => diasOrden.indexOf(a.dia) - diasOrden.indexOf(b.dia));

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
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Cargando horarios...</p>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="flex items-center mb-6">
                <div className="h-14 w-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mr-5 shadow-sm">
                  <Clock className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Horarios de Recolección
                  </h2>
                  <p className="text-slate-500 dark:text-gray-400 font-medium mt-1">Distrito de San Jerónimo, Cusco – Cronograma semanal del camión recolector.</p>
                </div>
              </div>

              {/* Aviso informativo */}
              <div className="mb-8 p-5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-700/30 rounded-2xl flex gap-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
                    <Truck className="h-5 w-5" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Un camión recolector cubre todo San Jerónimo</p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1 font-medium leading-relaxed">
                    El servicio de recolección opera con <strong>un camión general</strong> que recorre todos los sectores del distrito durante la semana. La recolección es de <strong>residuos generales</strong>. Saca tu basura el día y horario asignado a tu sector.
                  </p>
                </div>
              </div>

              {/* Nota sobre zona del usuario */}
              {zonaUsuario && (
                <div className="mb-6 p-4 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-700/30 rounded-xl flex gap-3">
                  <Info className="h-5 w-5 text-sky-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-sky-700 dark:text-sky-300 font-medium">
                    Tu sector está resaltado en la tabla. Recuerda sacar tu basura en el horario indicado.
                  </p>
                </div>
              )}

              <div className="bg-white dark:bg-slate-950/80 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-800 transition-colors duration-300">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100 dark:divide-slate-800">
                    <thead className="bg-gray-50 dark:bg-slate-900/60">
                      <tr>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          <div className="flex items-center"><CalendarDays className="h-4 w-4 mr-2" /> Día</div>
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          <div className="flex items-center"><Clock className="h-4 w-4 mr-2" /> Horario</div>
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          <div className="flex items-center"><MapPin className="h-4 w-4 mr-2" /> Sector</div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-950/20 divide-y divide-gray-50 dark:divide-slate-800">
                      {horariosOrdenados.map((horario) => {
                        const esMiZona = zonaUsuario === horario.zona;
                        return (
                          <tr key={horario.id} className={`transition-colors ${
                            esMiZona
                              ? 'bg-emerald-50/60 dark:bg-emerald-950/20'
                              : 'hover:bg-gray-55/60 dark:hover:bg-slate-900/40'
                          }`}>
                            <td className="px-6 py-5 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-900 dark:text-white capitalize">{horario.dia}</span>
                                {esMiZona && (
                                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">Tu día</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap">
                              <span className="text-sm font-medium text-slate-600 dark:text-slate-350 bg-gray-100 dark:bg-slate-900 px-3 py-1 rounded-full">
                                {horario.hora_inicio.substring(0,5)} – {horario.hora_fin.substring(0,5)}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                                <span className={`text-sm font-semibold ${
                                  esMiZona ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'
                                }`}>
                                  {horario.zona_nombre}
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {horariosOrdenados.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-6 py-12 text-center text-gray-500 font-medium">
                            <div className="flex flex-col items-center justify-center">
                              <MapPin className="h-10 w-10 text-gray-300 mb-3" />
                              No hay horarios registrados en el sistema.
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