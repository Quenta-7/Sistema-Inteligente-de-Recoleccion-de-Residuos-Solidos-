import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, MapPin, CheckCircle2, AlertCircle, Sun, Moon, Leaf, Eye, EyeOff, ArrowRight } from 'lucide-react';


import { getApiBaseUrl } from '../api';
import CuscoImagen from '../assets/Cusco_imagen.png';

type Zona = {
  id: number;
  nombre: string;
  codigo: string;
};

const Registro = () => {
  const [nombre, setNombre] = useState('');
  const [dni, setDni] = useState('');
  const [nombreReadOnly, setNombreReadOnly] = useState(false);
  const [buscandoDni, setBuscandoDni] = useState(false);
  const [email, setEmail] = useState('');
  const [zona, setZona] = useState('');
  const [password, setPassword] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [cargando, setCargando] = useState(false);
  const [cargandoZonas, setCargandoZonas] = useState(false);
  const [errorZonas, setErrorZonas] = useState('');
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

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

  useEffect(() => {
    const cargarZonas = async () => {
      setCargandoZonas(true);
      setErrorZonas('');

      try {
        const apiBaseUrl = getApiBaseUrl();
        const response = await fetch(`${apiBaseUrl}/api/zonas/`);
        const data = await response.json();

        if (response.ok) {
          const list = Array.isArray(data) ? data : data.results || [];
          const filtradas = list.filter((z: any) =>
            !['ZC001', 'ZN001', 'ZS001', 'ZE001'].includes(z.codigo) &&
            !['zona centro', 'zona norte', 'zona sur', 'zona este'].includes(z.nombre?.toLowerCase())
          );
          setZonas(filtradas);
        } else {
          setErrorZonas('No se pudieron cargar las zonas.');
        }
      } catch (err) {
        setErrorZonas('Error de conexion con el servidor.');
      } finally {
        setCargandoZonas(false);
      }
    };

    cargarZonas();
  }, []);

  const handleDniChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').substring(0, 8);
    setDni(val);
    setError('');

    if (val.length === 8) {
      setBuscandoDni(true);
      try {
        const apiBaseUrl = getApiBaseUrl();
        const response = await fetch(`${apiBaseUrl}/api/consultar-dni/${val}/`);
        const data = await response.json();

        if (response.ok && data.success) {
          setNombre(data.nombre_completo);
          setNombreReadOnly(true);
        } else {
          setNombre('');
          setNombreReadOnly(false);
          setError(data.message || 'No se encontraron datos para el DNI ingresado. Por favor, digitelo manualmente.');
        }
      } catch (err) {
        setError('Error al consultar DNI. Digite su nombre manualmente.');
        setNombreReadOnly(false);
      } finally {
        setBuscandoDni(false);
      }
    } else {
      setNombre('');
      setNombreReadOnly(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEnviado(false);

    if (dni.length !== 8) {
      setError('El DNI debe tener 8 digitos.');
      return;
    }

    if (password !== confirmacion) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    // Validar contraseña fuerte
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{8,}$/;
    if (!strongPasswordRegex.test(password)) {
      setError('La contraseña debe cumplir con todos los criterios de seguridad (mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial).');
      return;
    }

    if (!aceptaTerminos) {
      setError('Debe aceptar los Términos y Condiciones y la Política de Privacidad.');
      return;
    }

    setCargando(true);

    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/api/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          dni,
          nombre_completo: nombre,
          password,
          zona: zona ? Number(zona) : null,
          acepta_terminos: aceptaTerminos,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setEnviado(true);
        setNombre('');
        setDni('');
        setNombreReadOnly(false);
        setEmail('');
        setZona('');
        setPassword('');
        setConfirmacion('');
        setAceptaTerminos(false);
      } else {
        setError(
          data.errors?.dni?.[0] ||
            data.errors?.email?.[0] ||
            data.errors?.nombre_completo?.[0] ||
            data.errors?.password?.[0] ||
            'No se pudo registrar el usuario'
        );
      }
    } catch (err) {
      setError('Error de conexion. Verifica que el servidor este activo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.5) 0%, rgba(30, 30, 30, 0.45) 50%, rgba(20, 20, 20, 0.5) 100%), url(${CuscoImagen})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      
      {/* Botón de tema flotante */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => {
            const nextTheme = theme === 'light' ? 'dark' : 'light';
            setThemeState(nextTheme);
            localStorage.setItem('color-theme', nextTheme);
          }}
          className="p-2 text-slate-500 dark:text-slate-350 hover:text-amber-500 transition-colors bg-white/90 dark:bg-slate-800/90 rounded-full border border-slate-200 dark:border-slate-700 shadow-md backdrop-blur-sm"
          title={theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5 text-amber-400" />}
        </button>
      </div>

      <div className="absolute top-0 left-0 w-96 h-96 bg-white opacity-10 rounded-full mix-blend-overlay filter blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-300 opacity-20 rounded-full mix-blend-overlay filter blur-3xl transform translate-x-1/3 translate-y-1/3"></div>

      <div className="max-w-md w-full glass-panel p-10 rounded-3xl z-10 fade-in-up">
        <div className="text-center mb-10">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 shadow-lg mb-6 transform transition hover:scale-110">
            <Leaf className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Registro</h2>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 font-medium">
            Crea tu cuenta y empieza a sumar EcoPuntos
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/55 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {enviado && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/55 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              Registro exitoso. Ya puedes iniciar sesion.
            </p>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            
            {/* Campo DNI */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400 font-bold text-xs group-focus-within:text-emerald-500 transition-colors">DNI</span>
              </div>
              <input
                id="dni"
                name="dni"
                type="text"
                required
                disabled={cargando || buscandoDni}
                className="block w-full pl-12 pr-10 py-3 border border-gray-200 dark:border-slate-700 rounded-xl leading-5 bg-white dark:bg-slate-900/80 bg-opacity-80 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
                placeholder="Número de DNI (8 dígitos)"
                value={dni}
                onChange={handleDniChange}
              />
              {buscandoDni && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500"></div>
                </div>
              )}
            </div>

            {/* Campo Nombre Completo */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input
                id="nombre"
                name="nombre"
                type="text"
                required
                readOnly={nombreReadOnly}
                disabled={cargando || buscandoDni}
                className={`block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-slate-700 rounded-xl leading-5 bg-white dark:bg-slate-900/80 bg-opacity-80 text-gray-900 dark:text-white placeholder-gray-450 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm ${
                  nombreReadOnly ? 'bg-gray-50 dark:bg-slate-800/90 text-gray-500 dark:text-gray-400 cursor-not-allowed font-medium' : ''
                }`}
                placeholder="Nombre completo"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                disabled={cargando}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-slate-700 rounded-xl leading-5 bg-white dark:bg-slate-900/80 bg-opacity-80 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
                placeholder="Correo electronico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <select
                id="zona"
                name="zona"
                required
                disabled={cargando || cargandoZonas}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-slate-700 rounded-xl leading-5 bg-white dark:bg-slate-900/80 bg-opacity-80 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
                value={zona}
                onChange={(e) => setZona(e.target.value)}
              >
                <option value="" className="text-gray-900 dark:text-white dark:bg-slate-900">Selecciona tu sector en San Jerónimo</option>
                {zonas.map((zonaItem) => (
                  <option key={zonaItem.id} value={zonaItem.id} className="text-gray-900 dark:text-white dark:bg-slate-900">
                    {zonaItem.nombre}
                  </option>
                ))}
              </select>
              {cargandoZonas && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Cargando zonas...</p>
              )}
              {errorZonas && (
                <p className="text-xs text-red-650 mt-2">{errorZonas}</p>
              )}
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input
                id="password"
                name="password"
                type={mostrarPassword ? 'text' : 'password'}
                required
                disabled={cargando}
                className="block w-full pl-10 pr-10 py-3 border border-gray-200 dark:border-slate-700 rounded-xl leading-5 bg-white dark:bg-slate-900/80 bg-opacity-80 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400 focus:outline-none transition-colors"
                tabIndex={-1}
                title={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {mostrarPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {password && (
              <div className="p-3.5 bg-white dark:bg-slate-900 bg-opacity-70 dark:bg-opacity-75 border border-gray-150 dark:border-slate-800 rounded-xl text-[11px] space-y-1.5 shadow-sm">
                <p className="font-bold text-gray-700 dark:text-gray-300">La contraseña debe tener:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 text-gray-650 dark:text-gray-400 font-medium">
                  <p className={password.length >= 8 ? "text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold" : "text-gray-500 dark:text-gray-500 flex items-center gap-1"}>
                    <span className="text-xs">{password.length >= 8 ? "✓" : "○"}</span> Mínimo 8 caracteres
                  </p>
                  <p className={/[A-Z]/.test(password) ? "text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold" : "text-gray-500 dark:text-gray-500 flex items-center gap-1"}>
                    <span className="text-xs">{/[A-Z]/.test(password) ? "✓" : "○"}</span> Una letra mayúscula
                  </p>
                  <p className={/[a-z]/.test(password) ? "text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold" : "text-gray-500 dark:text-gray-500 flex items-center gap-1"}>
                    <span className="text-xs">{/[a-z]/.test(password) ? "✓" : "○"}</span> Una letra minúscula
                  </p>
                  <p className={/[0-9]/.test(password) ? "text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold" : "text-gray-500 dark:text-gray-500 flex items-center gap-1"}>
                    <span className="text-xs">{/[0-9]/.test(password) ? "✓" : "○"}</span> Un número
                  </p>
                  <p className={/[^A-Za-z0-9]/.test(password) ? "text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold" : "text-gray-500 dark:text-gray-500 flex items-center gap-1"}>
                    <span className="text-xs">{/[^A-Za-z0-9]/.test(password) ? "✓" : "○"}</span> Carácter especial
                  </p>
                </div>
              </div>
            )}

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input
                id="confirmacion"
                name="confirmacion"
                type={mostrarConfirmacion ? 'text' : 'password'}
                required
                disabled={cargando}
                className="block w-full pl-10 pr-10 py-3 border border-gray-200 dark:border-slate-700 rounded-xl leading-5 bg-white dark:bg-slate-900/80 bg-opacity-80 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
                placeholder="Confirmar contraseña"
                value={confirmacion}
                onChange={(e) => setConfirmacion(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setMostrarConfirmacion(!mostrarConfirmacion)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400 focus:outline-none transition-colors"
                tabIndex={-1}
                title={mostrarConfirmacion ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {mostrarConfirmacion ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="acepta-terminos"
                name="acepta-terminos"
                type="checkbox"
                required
                disabled={cargando}
                checked={aceptaTerminos}
                onChange={(e) => setAceptaTerminos(e.target.checked)}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded cursor-pointer disabled:opacity-60"
              />
            </div>
            <div className="ml-3 text-xs">
              <label htmlFor="acepta-terminos" className="font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                Acepto los{' '}
                <Link to="/terminos-condiciones" target="_blank" className="font-semibold text-emerald-600 dark:text-emerald-450 hover:text-emerald-500 dark:hover:text-emerald-350 underline">
                  Términos y Condiciones
                </Link>{' '}
                y la{' '}
                <Link to="/politica-privacidad" target="_blank" className="font-semibold text-emerald-600 dark:text-emerald-450 hover:text-emerald-500 dark:hover:text-emerald-350 underline">
                  Política de Privacidad
                </Link>{' '}
                bajo la Ley N° 29733 de Protección de Datos Personales del Perú.
              </label>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={cargando}
              className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-md transform transition-all hover:-translate-y-0.5"
            >
              {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
              <ArrowRight className="ml-2 h-5 w-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </button>
          </div>

          <p className="text-center text-sm text-gray-650 dark:text-gray-400 mt-4">
            Ya tienes cuenta?{' '}
            <Link to="/login" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-350 transition-colors">
              Inicia sesion
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Registro;
