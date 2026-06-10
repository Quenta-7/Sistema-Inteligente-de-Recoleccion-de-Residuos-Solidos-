import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, FileText, CheckSquare, Trash2, Heart } from 'lucide-react';
import CuscoImagen from '../assets/Cusco_imagen.png';

const TerminosCondiciones = () => {
  return (
    <div 
      className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden flex items-center justify-center"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(15, 23, 42, 0.75) 0%, rgba(30, 41, 59, 0.75) 100%), url(${CuscoImagen})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute top-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500 opacity-10 rounded-full blur-3xl transform translate-x-1/3 translate-y-1/3"></div>

      <div className="max-w-3xl w-full glass-panel p-8 sm:p-12 rounded-3xl z-10 fade-in-up shadow-2xl relative">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Términos y Condiciones</h1>
              <p className="text-xs text-gray-500 font-medium">Última actualización: Junio 2026</p>
            </div>
          </div>
          <Link to="/registro" className="inline-flex items-center text-sm font-semibold text-emerald-600 hover:text-emerald-700">
            <ArrowLeft className="h-4 w-4 mr-1" /> Volver al Registro
          </Link>
        </div>

        <div className="space-y-6 text-gray-700 overflow-y-auto max-h-[500px] pr-2 scrollbar-thin">
          <section>
            <h2 className="text-lg font-bold text-gray-950 flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-emerald-600" />
              1. Aceptación del Servicio
            </h2>
            <p className="text-sm leading-relaxed">
              Al registrarse en la plataforma <strong>Te Quiero Verde Cusco</strong>, usted acepta cumplir y estar sujeto a los presentes Términos y Condiciones de Uso. Esta plataforma es provista para promover la segregación, reciclaje y control inteligente de residuos sólidos en la ciudad del Cusco, en coordinación con las autoridades municipales competentes y bajo los estándares ético-legales vigentes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-950 flex items-center gap-2 mb-2">
              <CheckSquare className="h-4 w-4 text-emerald-600" />
              2. Registro de Evidencias de Reciclaje y Ecopuntos
            </h2>
            <p className="text-sm leading-relaxed">
              El sistema otorga EcoPuntos a los ciudadanos que registren de manera verídica evidencias fotográficas y cuantitativas (kg) de segregación de residuos (reciclables, orgánicos). 
              <br />
              <strong>Compromiso Ético:</strong> El usuario se compromete a no subir material fraudulento, fotos descargadas de internet, imágenes duplicadas o contenido inapropiado. Cualquier intento de fraude resultará en la cancelación automática de la cuenta y la pérdida de los EcoPuntos acumulados.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-950 flex items-center gap-2 mb-2">
              <Trash2 className="h-4 w-4 text-emerald-600" />
              3. Reporte de Incidencias de Residuos
            </h2>
            <p className="text-sm leading-relaxed">
              El módulo de reportes permite a los ciudadanos alertar sobre acumulación inapropiada de residuos o retrasos en la recolección. Toda información enviada debe ser veraz y referirse a ubicaciones geográficas precisas dentro de las zonas activas en el Cusco (como Wanchaq, San Sebastián, San Jerónimo, etc.). No se tolerará el uso de este canal para realizar denuncias falsas o maliciosas.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-950 flex items-center gap-2 mb-2">
              <Heart className="h-4 w-4 text-emerald-600" />
              4. Responsabilidad Municipal y Disponibilidad
            </h2>
            <p className="text-sm leading-relaxed">
              La plataforma tiene como finalidad optimizar la comunicación y la gestión urbana. Si bien se realizan esfuerzos constantes para mantener la precisión del Mapa en Vivo del recorrido de los camiones recolectores, factores externos (como cortes de tráfico, fallas de conectividad GPS o contingencias climáticas) pueden alterar los tiempos estimados. La Municipalidad y los administradores no se responsabilizan por retrasos inevitables en el servicio físico.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-950 flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-emerald-600" />
              5. Modificaciones y Suspensión del Servicio
            </h2>
            <p className="text-sm leading-relaxed">
              Nos reservamos el derecho de modificar o retirar el servicio en cualquier momento para aplicar actualizaciones técnicas, mejoras de seguridad o por adaptaciones en las ordenanzas municipales de gestión ambiental del Cusco.
            </p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500 font-medium">
            Al registrarte confirmas estar de acuerdo con estos términos.
          </p>
          <Link 
            to="/registro" 
            className="w-full sm:w-auto text-center py-2 px-6 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md transition-all"
          >
            Entendido y Aceptar
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TerminosCondiciones;
