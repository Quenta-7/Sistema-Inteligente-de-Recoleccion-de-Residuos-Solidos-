import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Leaf, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Sun, Moon, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import CuscoImagen from '../assets/Cusco_imagen.png';

const RestablecerContrasena = () => {
  const { uid, token } = useParams<{ uid?: string; token?: string }>();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [usuarioInfo, setUsuarioInfo] = useState<{ email?: string; nombre_completo?: string }>({});

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);

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

  // Validar token al cargar la página
  useEffect(() => {
    const verificarToken = async () => {
      if (!uid || !token) {
        setValidatingToken(false);
        setTokenValid(false);
        setError('El enlace de recuperación es incompleto o inválido.');
        return;
      }

      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
        const response = await fetch(`${apiBaseUrl}/api/auth/validar-token-recuperacion/${uid}/${token}/`);
        const data = await response.json();

        if (response.ok && data.valid) {
          setTokenValid(true);
          setUsuarioInfo({
            email: data.email,
            nombre_completo: data.nombre_completo,
          });
        } else {
          setTokenValid(false);
          setError(data.message || 'El enlace de recuperación es inválido o ha expirado.');
        }
      } catch (err) {
        setTokenValid(false);
        setError('No se pudo conectar con el servidor para validar el enlace.');
      } finally {
        setValidatingToken(false);
      }
    };

    verificarToken();
  }, [uid, token]);

  const passwordReqs = {
    length: password.length >= 8,
    hasMatch: password.length > 0 && password === confirmPassword,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setCargando(true);

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${apiBaseUrl}/api/auth/restablecer-contrasena/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid,
          token,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setExito(true);
      } else {
        setError(data.message || 'Ocurrió un error al restablecer la contraseña.');
      }
    } catch (err) {
      setError('Error de conexión. Intenta nuevamente.');
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
        backgroundAttachment: 'fixed',
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
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 shadow-lg mb-6 transform transition hover:scale-110">
            <Leaf className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Restablecer contraseña
          </h2>
          {usuarioInfo.nombre_completo && (
            <p className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 py-1.5 px-3 rounded-full inline-block">
              Cuenta: {usuarioInfo.nombre_completo}
            </p>
          )}
        </div>

        {validatingToken ? (
          <div className="py-12 text-center space-y-4">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto" />
            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
              Verificando enlace de seguridad...
            </p>
          </div>
        ) : !tokenValid ? (
          <div className="space-y-6 text-center">
            <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/55 rounded-2xl text-left flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-800 dark:text-red-300">Enlace no válido</p>
                <p className="text-xs text-red-700 dark:text-red-400 mt-1">{error}</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300">
              Es posible que el enlace haya expirado o ya se haya utilizado. Puedes solicitar un nuevo enlace de recuperación.
            </p>

            <Link
              to="/recuperar-contrasena"
              className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md transition-all"
            >
              Solicitar nuevo enlace
            </Link>
          </div>
        ) : exito ? (
          <div className="space-y-6 text-center">
            <div className="p-6 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/55 rounded-2xl space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-300">
                ¡Contraseña actualizada!
              </h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Tu clave ha sido restablecida exitosamente. Ya puedes acceder con tu nueva contraseña.
              </p>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md transition-all hover:-translate-y-0.5"
            >
              Ir a Iniciar Sesión <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/55 rounded-xl flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            {/* Campo Nueva Contraseña */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Nueva Contraseña
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={cargando}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-200 dark:border-slate-700 rounded-xl leading-5 bg-white dark:bg-slate-900/80 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm disabled:opacity-60"
                  placeholder="Mínimo 8 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Campo Confirmar Contraseña */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Confirmar Nueva Contraseña
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  disabled={cargando}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-200 dark:border-slate-700 rounded-xl leading-5 bg-white dark:bg-slate-900/80 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm disabled:opacity-60"
                  placeholder="Repite tu nueva contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Requisitos de Contraseña */}
            <div className="p-3 bg-gray-50 dark:bg-slate-900/60 rounded-xl space-y-1 text-xs">
              <div className={`flex items-center gap-1.5 ${passwordReqs.length ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                <CheckCircle2 className={`w-3.5 h-3.5 ${passwordReqs.length ? 'opacity-100' : 'opacity-40'}`} />
                <span>Al menos 8 caracteres</span>
              </div>
              <div className={`flex items-center gap-1.5 ${passwordReqs.hasMatch ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                <CheckCircle2 className={`w-3.5 h-3.5 ${passwordReqs.hasMatch ? 'opacity-100' : 'opacity-40'}`} />
                <span>Las contraseñas coinciden</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando || !passwordReqs.length || !passwordReqs.hasMatch}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-md transform transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cargando ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Guardando...
                </>
              ) : (
                <>
                  Guardar nueva contraseña <ArrowRight className="ml-2 h-5 w-5 opacity-80" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default RestablecerContrasena;
