import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Mail, Lock, User, MapPin, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import CuscoImagen from '../assets/Cusco_imagen.png';

type Zona = {
  id: number;
  nombre: string;
  codigo: string;
};

const Registro = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [zona, setZona] = useState('');
  const [password, setPassword] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [cargando, setCargando] = useState(false);
  const [cargandoZonas, setCargandoZonas] = useState(false);
  const [errorZonas, setErrorZonas] = useState('');

  useEffect(() => {
    const cargarZonas = async () => {
      setCargandoZonas(true);
      setErrorZonas('');

      try {
        const response = await fetch('http://localhost:8000/api/zonas/');
        const data = await response.json();

        if (response.ok) {
          setZonas(data);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEnviado(false);

    if (password !== confirmacion) {
      setError('Las contrasenas no coinciden');
      return;
    }

    setCargando(true);

    try {
      const response = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          nombre_completo: nombre,
          password,
          zona: zona ? Number(zona) : null,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setEnviado(true);
        setNombre('');
        setEmail('');
        setZona('');
        setPassword('');
        setConfirmacion('');
      } else {
        setError(
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
      <div className="absolute top-0 left-0 w-96 h-96 bg-white opacity-10 rounded-full mix-blend-overlay filter blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-300 opacity-20 rounded-full mix-blend-overlay filter blur-3xl transform translate-x-1/3 translate-y-1/3"></div>

      <div className="max-w-md w-full glass-panel p-10 rounded-3xl z-10 fade-in-up">
        <div className="text-center mb-10">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 shadow-lg mb-6 transform transition hover:scale-110">
            <Leaf className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Registro</h2>
          <p className="mt-3 text-sm text-gray-600 font-medium">
            Crea tu cuenta y empieza a sumar EcoPuntos
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {enviado && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-700">
              Registro exitoso. Ya puedes iniciar sesion.
            </p>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input
                id="nombre"
                name="nombre"
                type="text"
                required
                disabled={cargando}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white bg-opacity-80 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
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
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white bg-opacity-80 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
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
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white bg-opacity-80 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
                value={zona}
                onChange={(e) => setZona(e.target.value)}
              >
                <option value="">Zona de residencia</option>
                {zonas.map((zonaItem) => (
                  <option key={zonaItem.id} value={zonaItem.id}>
                    {zonaItem.nombre}
                  </option>
                ))}
              </select>
              {cargandoZonas && (
                <p className="text-xs text-gray-500 mt-2">Cargando zonas...</p>
              )}
              {errorZonas && (
                <p className="text-xs text-red-600 mt-2">{errorZonas}</p>
              )}
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
                disabled={cargando}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white bg-opacity-80 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
                placeholder="Contrasena"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input
                id="confirmacion"
                name="confirmacion"
                type="password"
                required
                disabled={cargando}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white bg-opacity-80 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
                placeholder="Confirmar contrasena"
                value={confirmacion}
                onChange={(e) => setConfirmacion(e.target.value)}
              />
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

          <p className="text-center text-sm text-gray-600 mt-4">
            Ya tienes cuenta?{' '}
            <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors">
              Inicia sesion
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Registro;
