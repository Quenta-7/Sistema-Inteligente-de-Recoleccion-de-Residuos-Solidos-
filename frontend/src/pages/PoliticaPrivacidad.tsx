import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, CheckCircle, Info, Lock, UserCheck } from 'lucide-react';
import CuscoImagen from '../assets/Cusco_imagen.png';

const PoliticaPrivacidad = () => {
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
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Política de Privacidad</h1>
              <p className="text-xs text-gray-500 font-medium">Cumplimiento Ley N° 29733 - Perú</p>
            </div>
          </div>
          <Link to="/registro" className="inline-flex items-center text-sm font-semibold text-emerald-600 hover:text-emerald-700">
            <ArrowLeft className="h-4 w-4 mr-1" /> Volver al Registro
          </Link>
        </div>

        <div className="space-y-6 text-gray-700 overflow-y-auto max-h-[500px] pr-2 scrollbar-thin">
          <section className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex gap-3">
            <Info className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-800 leading-relaxed font-medium">
              En cumplimiento con la <strong>Ley N° 29733 (Ley de Protección de Datos Personales de la República del Perú)</strong> y su Reglamento, le informamos de manera clara y transparente sobre el tratamiento de sus datos personales recolectados a través de la plataforma Te Quiero Verde Cusco.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-950 flex items-center gap-2 mb-2">
              <Lock className="h-4 w-4 text-emerald-600" />
              1. Identidad del Titular del Banco de Datos
            </h2>
            <p className="text-sm leading-relaxed">
              Los datos personales provistos serán almacenados en el banco de datos denominado "Usuarios de la Plataforma Te Quiero Verde Cusco", bajo titularidad y administración de la administración del sistema y en coordinación con la Gerencia de Gestión Ambiental de la Municipalidad Provincial del Cusco.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-950 flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              2. Datos Recopilados y Obligatoriedad
            </h2>
            <p className="text-sm leading-relaxed">
              Para su registro e interacción, recopilamos los siguientes datos de carácter obligatorio:
            </p>
            <ul className="list-disc pl-5 mt-2 text-xs space-y-1">
              <li>Nombre completo (identificación y control del ciudadano).</li>
              <li>Correo electrónico (acceso, recuperación de contraseña e información del servicio).</li>
              <li>Zona de residencia en Cusco (determinación del horario de recolección y métricas zonales).</li>
              <li>Contraseña cifrada (seguridad de la sesión).</li>
              <li>Fotografías de evidencias y reportes (validación física obligatoria para la acreditación de EcoPuntos).</li>
            </ul>
            <p className="text-xs text-gray-500 mt-2 font-medium">
              * Nota: La no entrega de estos datos imposibilitará el registro del ciudadano y la obtención de los beneficios de EcoPuntos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-950 flex items-center gap-2 mb-2">
              <UserCheck className="h-4 w-4 text-emerald-600" />
              3. Finalidad del Tratamiento de Datos
            </h2>
            <p className="text-sm leading-relaxed">
              Los datos provistos son utilizados estrictamente para:
            </p>
            <ul className="list-disc pl-5 mt-2 text-xs space-y-1">
              <li>Gestionar el registro e inicio de sesión seguro del usuario.</li>
              <li>Verificar la veracidad de las evidencias de reciclaje subidas por los ciudadanos.</li>
              <li>Otorgar, acumular e intercambiar los EcoPuntos del ciudadano.</li>
              <li>Enviar notificaciones y alertas en tiempo real sobre rutas o modificaciones de horarios en Cusco.</li>
              <li>Generar reportes estadísticos y mapas analíticos de recolección para la toma de decisiones ecológicas.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-950 flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-emerald-600" />
              4. Transferencia de Datos y Seguridad
            </h2>
            <p className="text-sm leading-relaxed">
              No se realiza transferencia de datos personales a terceros de manera nacional o internacional, salvo por mandato legal o requerimiento judicial. Implementamos medidas de seguridad de índole técnica, organizativa y legal para evitar la alteración, pérdida, tratamiento o acceso no autorizado a sus datos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-950 flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-emerald-600" />
              5. Ejercicio de los Derechos ARCO
            </h2>
            <p className="text-sm leading-relaxed">
              De acuerdo a la Ley N° 29733, usted puede ejercer en cualquier momento sus derechos de <strong>Acceso, Rectificación, Cancelación y Oposición (ARCO)</strong>. Para tal efecto, podrá enviar una solicitud dirigida a la administración del sistema o mediante correo electrónico a <em>arco@tequieroverdecusco.gob.pe</em> adjuntando una copia de su documento de identidad.
            </p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500 font-medium">
            Tus datos se procesan con total privacidad y seguridad.
          </p>
          <Link 
            to="/registro" 
            className="w-full sm:w-auto text-center py-2 px-6 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md transition-all"
          >
            Entendido
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PoliticaPrivacidad;
