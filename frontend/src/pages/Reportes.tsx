import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Camera, UploadCloud, CheckCircle2, Recycle } from 'lucide-react';

const Reportes = () => {
  const [descripcion, setDescripcion] = useState('');
  const [tipoResiduo, setTipoResiduo] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEnviado(true);
    setTimeout(() => {
      setEnviado(false);
      setDescripcion('');
      setTipoResiduo('');
      setCantidad('');
      setFileName('');
    }, 4000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto fade-in-up">
        
        <Link to="/dashboard" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium bg-emerald-50 px-4 py-2 rounded-full transition-colors mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al Panel
        </Link>
        
        <div className="glass-panel rounded-3xl p-8 sm:p-10 relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 opacity-5 rounded-full blur-2xl transform translate-x-1/3 -translate-y-1/3"></div>

          <div className="flex items-center mb-8 relative z-10">
            <div className="h-14 w-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mr-5 shadow-sm">
              <Recycle className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Evidencias de Reciclaje
              </h2>
              <p className="text-gray-500 font-medium mt-1">Registra tu reciclaje y suma EcoPuntos con cada evidencia.</p>
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

          <form onSubmit={handleSubmit} className="relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="tipo-residuo" className="block text-sm font-bold text-gray-700 mb-2">
                  Tipo de residuo
                </label>
                <select
                  id="tipo-residuo"
                  required
                  className="block w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white/80 transition-all"
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
                <label htmlFor="cantidad" className="block text-sm font-bold text-gray-700 mb-2">
                  Cantidad aproximada (kg)
                </label>
                <input
                  id="cantidad"
                  type="number"
                  min="0"
                  step="0.1"
                  required
                  className="block w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white/80 transition-all"
                  placeholder="Ej. 2.5"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                />
              </div>
            </div>
            <div className="mb-6">
              <label htmlFor="descripcion" className="block text-sm font-bold text-gray-700 mb-2">
                Descripción del reciclaje
              </label>
              <textarea
                id="descripcion"
                rows={5}
                required
                className="block w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white/80 transition-all resize-none"
                placeholder="Ej. Entregué botellas y cartón en el punto de acopio del barrio..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>

            <div className="mb-8">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Evidencia fotográfica <span className="text-gray-400 font-normal">(Obligatoria para sumar puntos)</span>
              </label>
              <div className={`mt-1 flex justify-center px-6 pt-10 pb-10 border-2 border-dashed rounded-2xl transition-colors
                  ${fileName ? 'border-emerald-400 bg-emerald-50' : 'border-gray-300 hover:border-emerald-400 hover:bg-gray-50/50 bg-white/50'}`}>
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
                disabled={enviado}
                className={`inline-flex justify-center items-center py-3 px-8 border border-transparent shadow-sm text-sm font-bold rounded-xl text-white transition-all transform
                  ${enviado ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500'}`}
              >
                {enviado ? 'Enviando...' : 'Enviar evidencia'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Reportes;
