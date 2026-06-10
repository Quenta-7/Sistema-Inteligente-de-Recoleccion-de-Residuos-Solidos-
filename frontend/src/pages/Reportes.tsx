import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Camera, UploadCloud, CheckCircle2, Recycle, AlertCircle, Loader, Sun, Moon } from 'lucide-react';
import { authedFetch } from '../api';

const Reportes = () => {
  const [descripcion, setDescripcion] = useState('');
  const [tipoResiduo, setTipoResiduo] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [fileName, setFileName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [evidencias, setEvidencias] = useState<any[]>([]);
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
  const [loadingEvidencias, setLoadingEvidencias] = useState(false);

  // Cargar evidencias al montar
  useEffect(() => {
    cargarEvidencias();
  }, []);

  const cargarEvidencias = async () => {
    try {
      setLoadingEvidencias(true);
      const response = await authedFetch('/api/evidencias/');
      if (response.ok) {
        const data = await response.json();
        setEvidencias(Array.isArray(data) ? data : data.results || []);
      }
    } catch (err) {
      console.error('Error cargando evidencias:', err);
    } finally {
      setLoadingEvidencias(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('tipo_residuo', tipoResiduo);
      formData.append('descripcion', descripcion);
      formData.append('cantidad', cantidad);
      
      // Obtener zona del usuario del sessionStorage
      const userData = sessionStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        if (user.zona) {
          formData.append('zona', user.zona);
        }
      }

      if (file) {
        formData.append('foto', file);
      }

      const response = await authedFetch('/api/evidencias/', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setEnviado(true);
        setDescripcion('');
        setTipoResiduo('');
        setCantidad('');
        setFileName('');
        setFile(null);
        
        // Recargar evidencias
        await cargarEvidencias();
        
        // Actualizar perfil del usuario (para sincronizar ecopuntos)
        try {
          const perfilResponse = await authedFetch('/api/perfil/');
          if (perfilResponse.ok) {
            const perfilData = await perfilResponse.json();
            const updatedUser = perfilData.user;
            
            // Actualizar sessionStorage con nuevos datos del perfil
            sessionStorage.setItem('user_data', JSON.stringify(updatedUser));
            
            // También actualizar localStorage si existe
            const localUserData = localStorage.getItem('user_data');
            if (localUserData) {
              localStorage.setItem('user_data', JSON.stringify(updatedUser));
            }
          }
        } catch (err) {
          console.error('Error actualizando perfil:', err);
        }
        
        // Resetear mensaje de éxito después de 3 segundos
        setTimeout(() => {
          setEnviado(false);
        }, 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Error al enviar la evidencia');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar la evidencia');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFileName(selectedFile.name);
      setFile(selectedFile);
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'nuevo':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'en_revision':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'resuelto':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
      <div className="max-w-3xl mx-auto fade-in-up">
        
        <div className="flex justify-between items-center mb-8">
          <Link to="/dashboard" className="inline-flex items-center text-emerald-650 hover:text-emerald-750 dark:text-emerald-400 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-2 rounded-full transition-colors border border-emerald-500/10 dark:border-emerald-500/20">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Panel
          </Link>
          
          <button
            onClick={toggleTheme}
            type="button"
            className="p-2 text-slate-500 dark:text-slate-350 hover:text-amber-500 transition-colors bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm"
            title={theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5 text-amber-400" />}
          </button>
        </div>
        
        <div className="glass-panel rounded-3xl p-8 sm:p-10 relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 opacity-5 rounded-full blur-2xl transform translate-x-1/3 -translate-y-1/3"></div>

          <div className="flex items-center mb-8 relative z-10">
            <div className="h-14 w-14 bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mr-5 shadow-sm">
              <Recycle className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Evidencias de Reciclaje
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Registra tu reciclaje y suma EcoPuntos con cada evidencia.</p>
            </div>
          </div>

          {enviado && (
            <div className="mb-8 p-5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start fade-in-up">
              <CheckCircle2 className="h-6 w-6 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-emerald-800">¡Evidencia registrada con éxito!</h3>
                <p className="text-sm text-emerald-600 mt-1">Sumaste 50 EcoPuntos. Seguimos mejorando la recolección contigo.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-8 p-5 bg-red-50 border border-red-200 rounded-xl flex items-start fade-in-up">
              <AlertCircle className="h-6 w-6 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-red-800">Error al enviar</h3>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="tipo-residuo" className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
                  Tipo de residuo
                </label>
                <select
                  id="tipo-residuo"
                  required
                  className="block w-full border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white/80 dark:bg-slate-900/80 text-slate-800 dark:text-white transition-all"
                  value={tipoResiduo}
                  onChange={(e) => setTipoResiduo(e.target.value)}
                >
                  <option value="">Selecciona una opción</option>
                  <option value="organico">Orgánico</option>
                  <option value="reciclable">Reciclable</option>
                  <option value="no-reciclable">No reciclable</option>
                </select>
              </div>
              <div>
                <label htmlFor="cantidad" className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
                  Cantidad aproximada (kg)
                </label>
                <input
                  id="cantidad"
                  type="number"
                  min="0"
                  step="0.1"
                  required
                  className="block w-full border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white/80 dark:bg-slate-900/80 text-slate-800 dark:text-white transition-all"
                  placeholder="Ej. 2.5"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                />
              </div>
            </div>
            <div className="mb-6">
              <label htmlFor="descripcion" className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
                Descripción del reciclaje
              </label>
              <textarea
                id="descripcion"
                rows={5}
                required
                className="block w-full border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white/80 dark:bg-slate-900/80 text-slate-800 dark:text-white transition-all resize-none"
                placeholder="Ej. Entregué botellas y cartón en el punto de acopio del barrio..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>

            <div className="mb-8">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
                Evidencia fotográfica <span className="text-slate-400 dark:text-slate-500 font-normal">(Obligatoria para sumar puntos)</span>
              </label>
              <div className={`mt-1 flex justify-center px-6 pt-10 pb-10 border-2 border-dashed rounded-2xl transition-colors
                  ${fileName 
                    ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20' 
                    : 'border-gray-300 dark:border-slate-800 hover:border-emerald-400 hover:bg-gray-55/50 dark:hover:bg-slate-850/50 bg-white/50 dark:bg-slate-900/50'}`}>
                <div className="space-y-2 text-center">
                  {fileName ? (
                    <Camera className="mx-auto h-12 w-12 text-emerald-500 mb-4" />
                  ) : (
                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  )}
                  
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-bold text-emerald-600 hover:text-emerald-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-emerald-500 transition-colors">
                      <span>{fileName ? 'Cambiar archivo' : 'Subir un archivo'}</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                    </label>
                    {!fileName && <p className="pl-1">o arrastrar y soltar</p>}
                  </div>
                  {fileName ? (
                    <p className="text-sm font-medium text-gray-900 mt-2">{fileName}</p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-2 font-medium">PNG, JPG, HEIC hasta 5MB</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={loading}
                className={`inline-flex justify-center items-center py-3 px-8 border border-transparent shadow-sm text-sm font-bold rounded-xl text-white transition-all transform
                  ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500'}`}
              >
                {loading ? (
                  <>
                    <Loader className="h-5 w-5 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar evidencia'
                )}
              </button>
            </div>
          </form>

          {/* Mis evidencias */}
          <div className="mt-16 pt-10 border-t border-gray-200">
            <h3 className="text-2xl font-extrabold text-gray-900 mb-8">Mis Evidencias</h3>
            
            {loadingEvidencias ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500 mx-auto mb-3"></div>
                  <p className="text-gray-600 font-medium">Cargando evidencias...</p>
                </div>
              </div>
            ) : evidencias.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl">
                <Recycle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Aún no has registrado ninguna evidencia</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {evidencias.map((evidencia) => (
                  <div key={evidencia.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                    {evidencia.foto_url && (
                      <img 
                        src={evidencia.foto_url} 
                        alt="Evidencia" 
                        className="w-full h-40 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-500 uppercase">
                          {evidencia.tipo_residuo}
                        </span>
                        <span className={`px-2 py-1 text-xs leading-5 font-bold rounded-full ${getEstadoBadge(evidencia.estado)}`}>
                          {evidencia.estado === 'nuevo' ? 'Nuevo' :
                           evidencia.estado === 'en_revision' ? 'En revisión' :
                           'Resuelto'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 font-medium mb-2">{evidencia.descripcion.substring(0, 80)}...</p>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>{evidencia.cantidad} kg</span>
                        <span className="font-bold text-emerald-600">+{evidencia.ecopuntos} pts</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(evidencia.created_at).toLocaleDateString('es-PE')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reportes;
