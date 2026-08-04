import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  CalendarDays, 
  Truck, 
  Sun, 
  Moon, 
  Info,
  Calendar,
  List,
  Search,
  CheckCircle2,
  Sparkles,
  Sunrise,
  Sunset
} from 'lucide-react';
import { authedFetch } from '../api';

interface Zona {
  id: number;
  nombre: string;
  codigo?: string;
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

const DIAS_SEMANA = [
  { key: 'lunes', label: 'Lunes', short: 'Lun' },
  { key: 'martes', label: 'Martes', short: 'Mar' },
  { key: 'miercoles', label: 'Miércoles', short: 'Mié' },
  { key: 'jueves', label: 'Jueves', short: 'Jue' },
  { key: 'viernes', label: 'Viernes', short: 'Vie' },
  { key: 'sabado', label: 'Sábado', short: 'Sáb' },
  { key: 'domingo', label: 'Domingo', short: 'Dom' }
];

const Horarios = () => {
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [zonaUsuario, setZonaUsuario] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('calendar');
  const [searchSector, setSearchSector] = useState('');
  const [diaSeleccionado, setDiaSeleccionado] = useState<string>('todos');

  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('color-theme') as 'light' | 'dark') || 'light';
  });

  // Obtener el día actual en español
  const getDiaActualKey = (): string => {
    const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    return dias[new Date().getDay()];
  };

  const diaActualKey = getDiaActualKey();

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

  // Filtrado por sector
  const horariosFiltrados = horariosConZona.filter(h => {
    const coincideSector = searchSector === '' || h.zona_nombre?.toLowerCase().includes(searchSector.toLowerCase());
    const coincideDia = diaSeleccionado === 'todos' || h.dia.toLowerCase() === diaSeleccionado.toLowerCase();
    return coincideSector && coincideDia;
  });

  const diasOrden = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
  const horariosOrdenados = [...horariosFiltrados].sort((a, b) => diasOrden.indexOf(a.dia) - diasOrden.indexOf(b.dia));

  // Es turno mañana o tarde
  const esTurnoManana = (horaInicio: string) => {
    const hora = parseInt(horaInicio.substring(0, 2), 10);
    return hora < 12;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-6 fade-in-up">

        {/* Header superior */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Link to="/dashboard" className="inline-flex items-center text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 bg-emerald-100/60 dark:bg-emerald-950/50 px-4 py-2 rounded-full transition-colors border border-emerald-500/20 text-sm font-semibold">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Panel
          </Link>
          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* View Switcher */}
            <div className="bg-white dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-1">
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'calendar'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Calendar className="h-4 w-4" /> Calendario
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'table'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <List className="h-4 w-4" /> Lista
              </button>
            </div>

            <button
              onClick={toggleTheme}
              className="p-2.5 text-slate-500 dark:text-slate-300 hover:text-amber-500 transition-colors bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"
              title={theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5 text-amber-400" />}
            </button>
          </div>
        </div>

        {/* Título de la página */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="h-14 w-14 bg-gradient-to-br from-emerald-500 to-teal-700 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
                <CalendarDays className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Cronograma de Recolección
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">
                  San Jerónimo, Cusco — Horarios semanales por sectores de acopio.
                </p>
              </div>
            </div>

            {/* Barra de Búsqueda y Filtro */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por sector..."
                  value={searchSector}
                  onChange={(e) => setSearchSector(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <select
                value={diaSeleccionado}
                onChange={(e) => setDiaSeleccionado(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 capitalize"
              >
                <option value="todos">Todos los días</option>
                {DIAS_SEMANA.map((d) => (
                  <option key={d.key} value={d.key}>{d.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Banner Informativo */}
          <div className="mt-6 p-4 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/40 rounded-2xl flex items-start gap-4">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex-shrink-0 mt-0.5">
              <Truck className="h-5 w-5" />
            </div>
            <div className="text-xs space-y-1">
              <p className="font-bold text-emerald-900 dark:text-emerald-200">
                🚛 Recorrido Semanal del Camión Municipal
              </p>
              <p className="text-emerald-700 dark:text-emerald-400 leading-relaxed font-medium">
                Un camión general cubre los sectores asignados según el turno. Saca tus bolsas de residuos generales en el día y rango horario correspondiente a tu zona.
              </p>
            </div>
          </div>

          {zonaUsuario && (
            <div className="mt-3 p-3 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/40 rounded-xl flex items-center gap-2.5">
              <Sparkles className="h-4 w-4 text-sky-500 flex-shrink-0" />
              <p className="text-xs text-sky-800 dark:text-sky-300 font-semibold">
                Tu sector registrado está destacado con la etiqueta <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-md font-bold text-[10px]">📍 Tu Sector</span>.
              </p>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500 mx-auto mb-3"></div>
              <p className="text-slate-500 font-medium text-sm">Cargando cronograma de recolección...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl">
            <p className="text-sm text-red-700 dark:text-red-400 font-bold">{error}</p>
          </div>
        )}

        {/* VISTA 1: CALENDARIO SEMANAL GRID */}
        {!loading && !error && viewMode === 'calendar' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
            {DIAS_SEMANA.map((dia) => {
              const horariosDelDia = horariosOrdenados.filter(h => h.dia.toLowerCase() === dia.key);
              const esHoy = diaActualKey === dia.key;

              return (
                <div 
                  key={dia.key} 
                  className={`bg-white dark:bg-slate-950 border rounded-3xl p-4 flex flex-col justify-start transition-all shadow-sm ${
                    esHoy 
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md' 
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Encabezado de día */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white capitalize flex items-center gap-1.5">
                        {dia.label}
                      </h3>
                    </div>
                    {esHoy && (
                      <span className="text-[10px] font-extrabold bg-emerald-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                        Hoy
                      </span>
                    )}
                  </div>

                  {/* Tarjetas de Turnos */}
                  <div className="space-y-3 flex-1">
                    {horariosDelDia.map((h) => {
                      const esMiZona = zonaUsuario === h.zona;
                      const manana = esTurnoManana(h.hora_inicio);

                      return (
                        <div
                          key={h.id}
                          className={`p-3.5 rounded-2xl border transition-all duration-200 relative ${
                            esMiZona
                              ? 'bg-gradient-to-br from-emerald-500/10 to-teal-500/15 border-emerald-500 dark:border-emerald-500/60 shadow-sm'
                              : 'bg-slate-50/80 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/40'
                          }`}
                        >
                          {/* Badge de Turno */}
                          <div className="flex items-center justify-between mb-2">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                              manana 
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/40' 
                                : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-300/40'
                            }`}>
                              {manana ? <Sunrise className="h-3 w-3" /> : <Sunset className="h-3 w-3" />}
                              {manana ? 'Mañana' : 'Tarde'}
                            </span>

                            {esMiZona && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-black bg-emerald-600 text-white px-1.5 py-0.5 rounded-md">
                                📍 Tu Sector
                              </span>
                            )}
                          </div>

                          {/* Horario */}
                          <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800 dark:text-slate-100 mb-2">
                            <Clock className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                            <span>{h.hora_inicio.substring(0,5)} – {h.hora_fin.substring(0,5)}</span>
                          </div>

                          {/* Sector */}
                          <div className="flex items-start gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                            <MapPin className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
                            <span className={esMiZona ? 'font-bold text-emerald-700 dark:text-emerald-300' : ''}>
                              {h.zona_nombre}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {horariosDelDia.length === 0 && (
                      <div className="py-6 text-center text-slate-400 dark:text-slate-600 text-xs font-medium border border-dashed border-slate-200 dark:border-slate-850 rounded-2xl">
                        Sin recolección
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VISTA 2: TABLA LISTA MEJORADA */}
        {!loading && !error && viewMode === 'table' && (
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                <thead className="bg-slate-100/70 dark:bg-slate-900">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-emerald-500" /> Día</div>
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-emerald-500" /> Horario y Turno</div>
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-emerald-500" /> Sector Asignado</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-slate-850 bg-white dark:bg-slate-950/20">
                  {horariosOrdenados.map((horario) => {
                    const esMiZona = zonaUsuario === horario.zona;
                    const esHoy = diaActualKey === horario.dia.toLowerCase();
                    const manana = esTurnoManana(horario.hora_inicio);

                    return (
                      <tr key={horario.id} className={`transition-colors ${
                        esMiZona
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/25'
                          : 'hover:bg-slate-50/60 dark:hover:bg-slate-900/40'
                      }`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900 dark:text-white capitalize">{horario.dia}</span>
                            {esHoy && (
                              <span className="text-[10px] bg-emerald-500 text-white font-extrabold px-2 py-0.5 rounded-full">HOY</span>
                            )}
                            {esMiZona && (
                              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-md">Tu Sector</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800">
                              {horario.hora_inicio.substring(0,5)} – {horario.hora_fin.substring(0,5)}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              manana 
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' 
                                : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                            }`}>
                              {manana ? 'Mañana' : 'Tarde'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <MapPin className={`h-4 w-4 flex-shrink-0 ${esMiZona ? 'text-emerald-500' : 'text-slate-400'}`} />
                            <span className={`text-sm ${esMiZona ? 'font-extrabold text-emerald-700 dark:text-emerald-300' : 'font-semibold text-slate-700 dark:text-slate-300'}`}>
                              {horario.zona_nombre}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {horariosOrdenados.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-slate-500 font-medium">
                        No se encontraron horarios para los filtros seleccionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Horarios;