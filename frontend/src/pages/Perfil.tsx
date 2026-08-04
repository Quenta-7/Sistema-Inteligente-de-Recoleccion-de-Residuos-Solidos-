import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Trophy,
  ArrowLeft,
  Edit2,
  CheckCircle,
  X,
  Sun,
  Moon,
  CreditCard,
  Leaf,
  Camera,
} from 'lucide-react';
import { authedFetch } from '../api';

// ─── Types ───────────────────────────────────────────────────────────────────

interface UserProfile {
  id: number;
  email: string;
  nombre_completo: string;
  dni: string;
  telefono: string;
  zona: number;
  rol: string;
  ecopuntos: number;
  date_joined: string;
  foto_perfil_url?: string | null;
}

interface Zona {
  id: number;
  nombre: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ECOPUNTOS_META = 500;

const ROL_LABELS: Record<string, string> = {
  ciudadano: 'Ciudadano',
  admin: 'Administrador',
  recolector: 'Recolector',
};

// ─── Helper ───────────────────────────────────────────────────────────────────

function formatDate(isoString: string): string {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ─── Read-only badge ─────────────────────────────────────────────────────────

function ReadOnlyBadge() {
  return (
    <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 select-none">
      <Shield className="h-2.5 w-2.5" />
      Solo lectura
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

const Perfil = () => {
  const navigate = useNavigate();

  // Theme
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('color-theme') as 'light' | 'dark') || 'light';
  });

  // Data
  const [perfil, setPerfil] = useState<UserProfile | null>(null);
  const [nombreZona, setNombreZona] = useState<string>('—');
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit phone
  const [editandoTelefono, setEditandoTelefono] = useState(false);
  const [telefonoEditable, setTelefonoEditable] = useState('');

  // Edit zone
  const [editandoZona, setEditandoZona] = useState(false);
  const [zonaEditable, setZonaEditable] = useState<number | ''>('');

  const [guardando, setGuardando] = useState(false);
  const [guardadoExito, setGuardadoExito] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null);

  // ── Theme effect ──────────────────────────────────────────────────────────
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setThemeState(next);
    localStorage.setItem('color-theme', next);
  };

  // ── Load data ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const token =
      localStorage.getItem('auth_token') ?? sessionStorage.getItem('auth_token');
    if (!token) {
      navigate('/login');
      return;
    }

    const cargar = async () => {
      setCargando(true);
      setError(null);
      try {
        const [perfilRes, zonasRes] = await Promise.all([
          authedFetch('/api/perfil/'),
          authedFetch('/api/zonas/'),
        ]);

        if (!perfilRes.ok) {
          throw new Error('No se pudo cargar el perfil.');
        }

        const perfilData = await perfilRes.json();
        const usuario: UserProfile = perfilData.user;
        setPerfil(usuario);
        setTelefonoEditable(usuario.telefono || '');
        setZonaEditable(usuario.zona || '');

        if (zonasRes.ok) {
          const zonasData = await zonasRes.json();
          const list: Zona[] = Array.isArray(zonasData) ? zonasData : zonasData.results || [];
          setZonas(list);
          const zona = list.find((z) => z.id === usuario.zona);
          if (zona) setNombreZona(zona.nombre);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error inesperado.');
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, [navigate]);

  // ── Save phone ────────────────────────────────────────────────────────────
  const guardarTelefono = async () => {
    if (!perfil) return;
    setGuardando(true);
    setErrorGuardado(null);
    try {
      const res = await authedFetch(`/api/perfil/`, {
        method: 'PATCH',
        body: JSON.stringify({ telefono: telefonoEditable }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const msg =
          errData?.telefono?.[0] ||
          errData?.detail ||
          'No se pudo guardar el teléfono.';
        throw new Error(msg);
      }

      const data = await res.json();
      setPerfil(data.user);
      
      const isLocal = localStorage.getItem('auth_token') !== null;
      const storage = isLocal ? localStorage : sessionStorage;
      storage.setItem('user_data', JSON.stringify(data.user));

      setEditandoTelefono(false);
      setGuardadoExito(true);
      setTimeout(() => setGuardadoExito(false), 3000);
    } catch (err: unknown) {
      setErrorGuardado(
        err instanceof Error ? err.message : 'Error inesperado.'
      );
    } finally {
      setGuardando(false);
    }
  };

  const cancelarEdicion = () => {
    setEditandoTelefono(false);
    setTelefonoEditable(perfil?.telefono || '');
    setErrorGuardado(null);
  };

  // ── Save zone ─────────────────────────────────────────────────────────────
  const guardarZona = async () => {
    if (!perfil) return;
    setGuardando(true);
    setErrorGuardado(null);
    try {
      const res = await authedFetch(`/api/perfil/`, {
        method: 'PATCH',
        body: JSON.stringify({ zona: zonaEditable ? Number(zonaEditable) : null }),
      });

      if (!res.ok) {
        throw new Error('No se pudo guardar la zona.');
      }

      const data = await res.json();
      setPerfil(data.user);

      const isLocal = localStorage.getItem('auth_token') !== null;
      const storage = isLocal ? localStorage : sessionStorage;
      storage.setItem('user_data', JSON.stringify(data.user));

      const zonaObj = zonas.find((z) => z.id === Number(zonaEditable));
      setNombreZona(zonaObj ? zonaObj.nombre : '—');

      setEditandoZona(false);
      setGuardadoExito(true);
      setTimeout(() => setGuardadoExito(false), 3000);
    } catch (err: unknown) {
      setErrorGuardado(
        err instanceof Error ? err.message : 'Error inesperado.'
      );
    } finally {
      setGuardando(false);
    }
  };

  // ── Save profile picture ──────────────────────────────────────────────────
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!perfil || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('foto_perfil', file);

    setGuardando(true);
    setErrorGuardado(null);
    try {
      const res = await authedFetch(`/api/perfil/`, {
        method: 'PATCH',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Error al subir la fotografía de perfil.');
      }

      const data = await res.json();
      setPerfil(data.user);

      const isLocal = localStorage.getItem('auth_token') !== null;
      const storage = isLocal ? localStorage : sessionStorage;
      storage.setItem('user_data', JSON.stringify(data.user));

      setGuardadoExito(true);
      setTimeout(() => setGuardadoExito(false), 3000);
    } catch (err: unknown) {
      setErrorGuardado(
        err instanceof Error ? err.message : 'Error inesperado.'
      );
    } finally {
      setGuardando(false);
    }
  };

  // ── EcoPuntos progress ────────────────────────────────────────────────────
  const ecopuntos = perfil?.ecopuntos ?? 0;
  const progresoPct = Math.min((ecopuntos / ECOPUNTOS_META) * 100, 100);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-slate-50 to-amber-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">

      {/* ── Navbar ── */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Left: back + brand */}
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="p-2 rounded-xl text-gray-500 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                title="Volver al Panel"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="h-9 w-9 bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md shadow-emerald-500/20">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <span className="text-gray-900 dark:text-white text-xl font-extrabold tracking-tight">
                Te Quiero{' '}
                <span className="text-emerald-600">Verde</span>{' '}
                <span className="text-sky-600">Cusco</span>
              </span>
            </div>

            {/* Right: theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 dark:text-slate-400 hover:text-amber-500 transition-colors bg-gray-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700 rounded-full"
              title={theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5 text-amber-400" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Main ── */}
      <main className="flex-1 w-full max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">

        {/* Page title */}
        <div className="mb-8 fade-in-up">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <User className="h-7 w-7 text-emerald-500" />
            Mi Perfil
          </h1>
          <p className="mt-1 text-gray-500 dark:text-slate-400 font-medium text-sm">
            Gestiona tu información personal, sube tu foto de perfil y actualiza tu zona.
          </p>
        </div>

        {/* ── Loading ── */}
        {cargando && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="h-12 w-12 rounded-full border-4 border-emerald-200 border-t-emerald-500 animate-spin" />
            <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
              Cargando perfil…
            </p>
          </div>
        )}

        {/* ── Error ── */}
        {!cargando && error && (
          <div className="glass-panel rounded-2xl p-8 text-center fade-in-up">
            <div className="h-14 w-14 bg-red-100 dark:bg-red-950 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="h-7 w-7 text-red-500" />
            </div>
            <p className="text-red-600 dark:text-red-400 font-bold">{error}</p>
            <Link
              to="/dashboard"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al Dashboard
            </Link>
          </div>
        )}

        {/* ── Profile content ── */}
        {!cargando && !error && perfil && (
          <div className="space-y-6">

            {/* ── Profile Header Card ── */}
            <div className="glass-panel rounded-3xl overflow-hidden fade-in-up">
              {/* Gradient banner */}
              <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-700 px-8 pt-10 pb-16">
                <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4 pointer-events-none">
                  <Leaf className="h-48 w-48" />
                </div>
                {/* Avatar with photo upload capability */}
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-end gap-5">
                  <div className="relative h-20 w-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30 shadow-lg flex-shrink-0 group">
                    {perfil.foto_perfil_url ? (
                      <img src={perfil.foto_perfil_url} alt="Foto de perfil" className="h-full w-full object-cover rounded-xl" />
                    ) : (
                      <User className="h-10 w-10 text-white" />
                    )}
                    <label className="absolute -bottom-2 -right-2 h-7 w-7 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center cursor-pointer shadow hover:scale-110 transition-transform">
                      <input type="file" onChange={handlePhotoChange} className="hidden" accept="image/*" />
                      <Camera className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    </label>
                  </div>
                  <div className="text-white">
                    <h2 className="text-2xl font-black tracking-tight leading-tight">
                      {perfil.nombre_completo}
                    </h2>
                    <p className="text-emerald-100 text-sm font-medium mt-0.5">
                      {perfil.email}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {/* Status badge */}
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold text-white border border-white/20">
                        <CheckCircle className="h-3 w-3 text-emerald-200" />
                        Activo
                      </span>
                      {/* Role badge */}
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold text-white border border-white/20">
                        <Shield className="h-3 w-3 text-sky-200" />
                        {ROL_LABELS[perfil.rol] ?? perfil.rol}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* EcoPuntos strip (overlaps banner) */}
              <div className="relative -mt-6 mx-6 mb-0">
                <div className="bg-white dark:bg-slate-900 border border-amber-100 dark:border-slate-800 rounded-2xl shadow-md px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="h-12 w-12 bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center shadow-inner flex-shrink-0">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1.5">
                      <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
                        {ecopuntos.toLocaleString()}
                      </span>
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                        EcoPuntos
                      </span>
                      <span className="ml-auto text-xs text-gray-400 dark:text-slate-500 font-medium whitespace-nowrap">
                        Meta: {ECOPUNTOS_META.toLocaleString()} pts
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-2.5 bg-amber-100 dark:bg-amber-950/40 rounded-full overflow-hidden">
                      <div
                        className="h-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-400 rounded-full transition-all duration-700"
                        style={{ width: `${progresoPct}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-1.5 font-medium">
                      {progresoPct >= 100
                        ? '¡Meta alcanzada! 🎉 Canjea tus puntos en la Tienda.'
                        : `Faltan ${(ECOPUNTOS_META - ecopuntos).toLocaleString()} puntos para alcanzar tu meta.`}
                    </p>
                  </div>
                  <Link
                    to="/tienda-ecopuntos"
                    className="flex-shrink-0 px-4 py-2 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors border border-amber-200 dark:border-amber-900"
                  >
                    Ir a tienda →
                  </Link>
                </div>
              </div>

              {/* Spacer below the strip */}
              <div className="h-6" />
            </div>

            {/* ── Personal Info Card ── */}
            <div className="glass-panel rounded-3xl p-8 fade-in-up delay-100">
              <h3 className="text-base font-bold text-gray-700 dark:text-slate-200 mb-6 flex items-center gap-2">
                <User className="h-4 w-4 text-emerald-500" />
                Información Personal
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                {/* Nombre */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-1.5 flex items-center">
                    Nombre Completo
                    <ReadOnlyBadge />
                  </label>
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3">
                    <User className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <span className="text-sm font-semibold text-gray-800 dark:text-slate-200">
                      {perfil.nombre_completo}
                    </span>
                  </div>
                </div>

                {/* DNI */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-1.5 flex items-center">
                    DNI
                    <ReadOnlyBadge />
                  </label>
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3">
                    <CreditCard className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <span className="text-sm font-semibold text-gray-800 dark:text-slate-200 tracking-widest">
                      {perfil.dni || 'Sin registrar'}
                    </span>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-1.5 flex items-center">
                    Correo Electrónico
                    <ReadOnlyBadge />
                  </label>
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3">
                    <Mail className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <span className="text-sm font-semibold text-gray-800 dark:text-slate-200 truncate">
                      {perfil.email}
                    </span>
                  </div>
                </div>

                {/* Telefono — editable */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-1.5">
                    Teléfono
                  </label>

                  {editandoTelefono ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 flex items-center gap-3 bg-white dark:bg-slate-900 border-2 border-emerald-400 dark:border-emerald-600 rounded-xl px-4 py-3 shadow-sm">
                          <Phone className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                          <input
                            type="tel"
                            value={telefonoEditable}
                            onChange={(e) => setTelefonoEditable(e.target.value)}
                            placeholder="+51 987 654 321"
                            className="flex-1 bg-transparent text-sm font-semibold text-gray-800 dark:text-slate-200 outline-none placeholder:text-slate-350"
                            autoFocus
                          />
                        </div>
                        <button
                          onClick={guardarTelefono}
                          disabled={guardando}
                          className="p-3 bg-emerald-500 hover:bg-emerald-650 disabled:opacity-50 text-white rounded-xl transition-colors shadow-sm"
                          title="Guardar"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={cancelarEdicion}
                          disabled={guardando}
                          className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 rounded-xl transition-colors"
                          title="Cancelar"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      {errorGuardado && (
                        <p className="text-xs text-red-500 font-medium px-1">
                          {errorGuardado}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3">
                        <Phone className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        <span className="text-sm font-semibold text-gray-800 dark:text-slate-200">
                          {perfil.telefono || (
                            <span className="text-slate-400 italic">Sin registrar</span>
                          )}
                        </span>
                      </div>
                      <button
                        onClick={() => setEditandoTelefono(true)}
                        className="p-3 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-xl transition-colors border border-emerald-200"
                        title="Editar teléfono"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Zona (Sector) — editable */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-1.5">
                    Sector / Zona (Recorrido asociado)
                  </label>

                  {editandoZona ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 flex items-center gap-3 bg-white dark:bg-slate-900 border-2 border-emerald-400 dark:border-emerald-600 rounded-xl px-4 py-3 shadow-sm">
                          <MapPin className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                          <select
                            value={zonaEditable}
                            onChange={(e) => setZonaEditable(e.target.value ? Number(e.target.value) : '')}
                            className="flex-1 bg-transparent text-sm font-semibold text-gray-800 dark:text-slate-200 outline-none"
                          >
                            <option value="">Selecciona tu sector</option>
                            {zonas.map((z) => (
                              <option key={z.id} value={z.id}>
                                {z.nombre}
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          onClick={guardarZona}
                          disabled={guardando}
                          className="p-3 bg-emerald-500 hover:bg-emerald-650 disabled:opacity-50 text-white rounded-xl transition-colors shadow-sm"
                          title="Guardar"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditandoZona(false)}
                          disabled={guardando}
                          className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 rounded-xl transition-colors"
                          title="Cancelar"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      {errorGuardado && (
                        <p className="text-xs text-red-500 font-medium px-1">
                          {errorGuardado}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3">
                        <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        <span className="text-sm font-semibold text-gray-800 dark:text-slate-200">
                          {nombreZona}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setZonaEditable(perfil.zona || '');
                          setEditandoZona(true);
                        }}
                        className="p-3 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-xl transition-colors border border-emerald-200"
                        title="Editar sector"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* ── Account Info Card ── */}
            <div className="glass-panel rounded-3xl p-8 fade-in-up delay-200">
              <h3 className="text-base font-bold text-gray-700 dark:text-slate-200 mb-6 flex items-center gap-2">
                <Shield className="h-4 w-4 text-sky-500" />
                Información de Cuenta
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

                {/* Rol */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-1.5 flex items-center">
                    Rol
                    <ReadOnlyBadge />
                  </label>
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3">
                    <Shield className="h-4 w-4 text-sky-400 flex-shrink-0" />
                    <span className="text-sm font-semibold text-gray-800 dark:text-slate-200 capitalize">
                      {ROL_LABELS[perfil.rol] ?? perfil.rol}
                    </span>
                  </div>
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-1.5">
                    Estado
                  </label>
                  <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 rounded-xl px-4 py-3">
                    <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                      Activo
                    </span>
                  </div>
                </div>

                {/* Fecha de registro */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-1.5 flex items-center">
                    Miembro desde
                    <ReadOnlyBadge />
                  </label>
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3">
                    <span className="text-sm font-semibold text-gray-800 dark:text-slate-200">
                      {formatDate(perfil.date_joined)}
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* ── Success toast ── */}
            {guardadoExito && (
              <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-emerald-500 text-white px-5 py-3.5 rounded-2xl shadow-xl shadow-emerald-500/25 fade-in-up">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-bold">Información de perfil actualizada con éxito.</span>
              </div>
            )}

            {/* ── Back link ── */}
            <div className="flex justify-start pb-4 fade-in-up delay-300">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al Panel de Control
              </Link>
            </div>

          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="bg-white dark:bg-slate-950 border-t border-gray-200 dark:border-slate-800 mt-auto py-8 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-gray-500 dark:text-slate-400">
          <p className="font-medium">
            © 2026 Plataforma Te Quiero Verde Cusco — Municipalidad Provincial del Cusco.
          </p>
          <div className="flex gap-4 font-bold">
            <Link
              to="/terminos-condiciones"
              target="_blank"
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors underline"
            >
              Términos y Condiciones
            </Link>
            <span>•</span>
            <Link
              to="/politica-privacidad"
              target="_blank"
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors underline"
            >
              Política de Privacidad
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Perfil;
