import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  AlertTriangle,
  FileText,
  Filter,
  CheckCircle,
  Clock,
  MapPin,
  Tag,
  Search,
  Check,
  RefreshCw,
  Copy,
  Sun,
  Moon
} from 'lucide-react';
import { authedFetch } from '../api';

interface Zona {
  id: number;
  nombre: string;
  codigo: string;
}

interface Reporte {
  id: number;
  tipo_reporte: string;
  direccion: string;
  descripcion: string;
  estado: 'nuevo' | 'en_revision' | 'resuelto' | 'rechazado';
  codigo_seguimiento: string;
  comentario_admin?: string;
  created_at: string;
}

export default function ReportesCiudadanos() {
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [tipoReporte, setTipoReporte] = useState('Acumulacion de basura');
  const [direccion, setDireccion] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [selectedZona, setSelectedZona] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successReport, setSuccessReport] = useState<Reporte | null>(null);
  const [copied, setCopied] = useState(false);

  // Filters & sorting
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'recientes' | 'antiguos'>('recientes');

  // Theme support
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

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch zones
      const zRes = await authedFetch('/api/zonas/');
      if (zRes.ok) {
        const zData = await zRes.json();
        setZonas(zData);
        if (zData.length > 0) {
          setSelectedZona(zData[0].id.toString());
        }
      }

      // Fetch user's reports
      const rRes = await authedFetch('/api/reportes/');
      if (rRes.ok) {
        const rData = await rRes.json();
        setReportes(rData);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (descripcion.length < 10) return;

    setSubmitting(true);
    setSuccessReport(null);
    try {
      const res = await authedFetch('/api/reportes/', {
        method: 'POST',
        body: JSON.stringify({
          tipo_reporte: tipoReporte,
          direccion: direccion,
          descripcion: descripcion,
          zona: selectedZona ? parseInt(selectedZona) : null
        })
      });

      if (res.ok) {
        const newReport = await res.json();
        setReportes((prev) => [newReport, ...prev]);
        setSuccessReport(newReport);
        setDireccion('');
        setDescripcion('');
      } else {
        const errors = await res.json();
        console.error('Failed to create report:', errors);
      }
    } catch (err) {
      console.error('Error submitting report:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter and sort logic
  const filteredReportes = reportes
    .filter((r) => {
      const matchesStatus = statusFilter === 'todos' || r.estado === statusFilter;
      const matchesSearch = 
        r.codigo_seguimiento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.direccion.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortBy === 'recientes' ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100 font-sans flex flex-col justify-between transition-colors duration-300">
      
      {/* Header */}
      <header className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 py-6 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center text-sm font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 transition-all"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Panel
            </Link>

            <button
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 transition-all self-start sm:self-auto"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="h-4 w-4 text-slate-600" />
                  <span>Modo Oscuro</span>
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4 text-amber-400" />
                  <span>Modo Claro</span>
                </>
              )}
            </button>
          </div>

          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">Reportes Ciudadanos</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mt-1">
              Informa problemas con la recolección o contenedores de basura en tu zona. El administrador asignará recolectores y podrás hacer seguimiento con tu código único.
            </p>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto py-8 px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Submit form */}
        <section className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-6 rounded-3xl shadow-sm transition-colors duration-300">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-500" />
              Nuevo Reporte de Incidencia
            </h2>

            {successReport && (
              <div className="bg-emerald-500/10 border border-emerald-500/25 p-4 rounded-2xl mb-6 text-xs text-emerald-700 dark:text-emerald-400 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <span className="font-extrabold">¡Reporte Enviado Exitosamente!</span>
                </div>
                <p>Tu reporte ha sido registrado en el sistema. Puedes realizar el seguimiento usando el siguiente código único:</p>
                <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-emerald-500/20 font-mono text-sm font-bold text-slate-850 dark:text-white mt-1">
                  <span>{successReport.codigo_seguimiento}</span>
                  <button
                    onClick={() => handleCopyCode(successReport.codigo_seguimiento)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 dark:text-slate-400"
                    title="Copiar código"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Zona</label>
                <select
                  value={selectedZona}
                  onChange={(e) => setSelectedZona(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500"
                >
                  {zonas.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.nombre} ({z.codigo})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo de Incidente</label>
                <select
                  value={tipoReporte}
                  onChange={(e) => setTipoReporte(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500"
                >
                  <option value="Acumulacion de basura">Acumulación de basura en vía pública</option>
                  <option value="Contenedor roto">Contenedor roto o dañado</option>
                  <option value="Horario incumplido">El camión recolector no pasó a la hora</option>
                  <option value="Quema de residuos">Quema no autorizada de basura</option>
                  <option value="Otro">Otro problema de recolección</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dirección Exacta</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Ej: Av. Sol 450 (Frente al Coricancha)"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 pl-10 pr-4 py-3 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descripción / Detalles</label>
                <textarea
                  required
                  rows={4}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Por favor describe detalladamente la situación (mínimo 10 caracteres)..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-500"
                />
                {descripcion.length > 0 && descripcion.length < 10 && (
                  <p className="text-red-500 text-[10px] mt-1 font-bold">La descripción debe tener al menos 10 caracteres. Faltan {10 - descripcion.length}.</p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting || descripcion.length < 10}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs py-3.5 rounded-xl transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2"
              >
                <Send className="h-4 w-4" />
                {submitting ? 'Enviando Reporte...' : 'Enviar Reporte Ciudadano'}
              </button>
            </form>
          </div>
        </section>

        {/* Right Column: History List with Filters */}
        <section className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-6 rounded-3xl shadow-sm transition-colors duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-sky-500" />
                Historial de Mis Reportes
              </h2>

              <button
                onClick={fetchData}
                className="self-start sm:self-auto p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 flex items-center gap-1 text-xs font-bold"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Actualizar
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar reporte..."
                  className="w-full bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 pl-8 pr-3 py-2 rounded-xl text-xs focus:outline-none"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 p-2 rounded-xl text-xs focus:outline-none"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="nuevo">Nuevo</option>
                  <option value="en_revision">En Revisión</option>
                  <option value="resuelto">Resuelto</option>
                  <option value="rechazado">Rechazado</option>
                </select>
              </div>

              {/* Sorting */}
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 p-2 rounded-xl text-xs focus:outline-none"
              >
                <option value="recientes">Más recientes primero</option>
                <option value="antiguos">Más antiguos primero</option>
              </select>
            </div>

            {/* List */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-500">
                <RefreshCw className="h-8 w-8 animate-spin text-emerald-500" />
                <span className="text-xs font-semibold">Cargando reportes...</span>
              </div>
            ) : filteredReportes.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <AlertTriangle className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-500">No se encontraron reportes que coincidan con los filtros.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReportes.map((reporte) => (
                  <div 
                    key={reporte.id}
                    className="border border-slate-200 dark:border-slate-850 p-4 rounded-2xl hover:border-slate-350 dark:hover:border-slate-750 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div>
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-md">
                          Cod: {reporte.codigo_seguimiento}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold ml-2">
                          {new Date(reporte.created_at).toLocaleDateString()} {new Date(reporte.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full self-start sm:self-auto ${
                        reporte.estado === 'nuevo'
                          ? 'bg-sky-100 text-sky-850 dark:bg-sky-500/10 dark:text-sky-400'
                          : reporte.estado === 'en_revision'
                            ? 'bg-amber-100 text-amber-850 dark:bg-amber-400/10 dark:text-amber-400'
                            : reporte.estado === 'resuelto'
                              ? 'bg-emerald-100 text-emerald-850 dark:bg-emerald-400/10 dark:text-emerald-400'
                              : 'bg-red-100 text-red-850 dark:bg-red-400/10 dark:text-red-400'
                      }`}>
                        {reporte.estado.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-xs font-extrabold text-slate-800 dark:text-white">
                        <Tag className="h-3.5 w-3.5 text-slate-400" />
                        <span>{reporte.tipo_reporte}</span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-350">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span>{reporte.direccion}</span>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850/50">
                        {reporte.descripcion}
                      </p>

                      {reporte.comentario_admin && (
                        <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl text-[11px] text-emerald-600 dark:text-emerald-400">
                          <strong>Respuesta del Administrador:</strong>
                          <p className="mt-0.5 opacity-90">{reporte.comentario_admin}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
