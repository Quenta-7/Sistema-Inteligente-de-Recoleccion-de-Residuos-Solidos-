import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Mail, Lock, ArrowRight, AlertCircle, Loader } from 'lucide-react';
import CuscoImagen from '../assets/Cusco_imagen.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Llamar a la API del backend
      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Guardar datos del usuario en localStorage
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        localStorage.setItem('token', data.usuario.id.toString());
        
        // Redirigir al dashboard
        navigate('/dashboard');
      } else {
        // Mostrar error del servidor
        setError(data.errors?.email?.[0] || data.errors?.password?.[0] || data.errors?.non_field_errors?.[0] || 'Credenciales inválidas');
      }
    } catch (err) {
      setError('Error de conexión. Verifica que el servidor esté ejecutándose en http://localhost:8000');
    } finally {
      setLoading(false);
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
      
      {/* Decorative Circles */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white opacity-10 rounded-full mix-blend-overlay filter blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-300 opacity-20 rounded-full mix-blend-overlay filter blur-3xl transform translate-x-1/3 translate-y-1/3"></div>

      <div className="max-w-md w-full glass-panel p-10 rounded-3xl z-10 fade-in-up">
        <div className="text-center mb-10">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 shadow-lg mb-6 transform transition hover:scale-110">
            <Leaf className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Te Quiero Verde Cusco
          </h2>
          <p className="mt-3 text-sm text-gray-600 font-medium">
            Sistema Inteligente de Recolección de Residuos
          </p>
        </div>
        
        {/* Mostrar mensaje de error si existe */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        
        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                disabled={loading}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white bg-opacity-80 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm disabled:opacity-60"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                disabled={loading}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white bg-opacity-80 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm disabled:opacity-60"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox" disabled={loading} className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded cursor-pointer disabled:opacity-60" />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                Recordarme
              </label>
            </div>
            <div className="text-sm">
              <Link to="/recuperar-contrasena" className="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-md transform transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  Iniciar Sesión
                  <ArrowRight className="ml-2 h-5 w-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </>
              )}
            </button>
          </div>
          
          <p className="text-center text-sm text-gray-600 mt-4">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors">
              Regístrate aquí
            </Link>
          </p>
        </form>

        {/* Credenciales de prueba */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2 font-semibold">Credenciales de prueba:</p>
          <div className="space-y-1 text-xs text-gray-600">
            <p><span className="font-mono bg-gray-100 px-2 py-1 rounded">ciudadano1@residuos.com</span></p>
            <p><span className="font-mono bg-gray-100 px-2 py-1 rounded">pass123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
