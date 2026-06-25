import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Horarios from './pages/Horarios';
import Reportes from './pages/Reportes';
import Registro from './pages/Registro';
import RecuperarContrasena from './pages/RecuperarContrasena';
import TiendaEcoPuntos from './pages/TiendaEcoPuntos';
import MapaEnVivo from './pages/MapaEnVivo';
import TerminosCondiciones from './pages/TerminosCondiciones';
import PoliticaPrivacidad from './pages/PoliticaPrivacidad';
import AdminDashboard from './pages/AdminDashboard';
import RecolectorDashboard from './pages/RecolectorDashboard';
import ReportesCiudadanos from './pages/ReportesCiudadanos';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
        
        {/* Rutas protegidas para ciudadanos */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['ciudadano', 'admin']}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/tienda-ecopuntos" element={
          <ProtectedRoute allowedRoles={['ciudadano', 'admin']}>
            <TiendaEcoPuntos />
          </ProtectedRoute>
        } />
        <Route path="/mapa-en-vivo" element={
          <ProtectedRoute allowedRoles={['ciudadano', 'admin']}>
            <MapaEnVivo />
          </ProtectedRoute>
        } />
        <Route path="/horarios" element={
          <ProtectedRoute allowedRoles={['ciudadano', 'admin']}>
            <Horarios />
          </ProtectedRoute>
        } />
        <Route path="/reportes" element={
          <ProtectedRoute allowedRoles={['ciudadano', 'admin']}>
            <Reportes />
          </ProtectedRoute>
        } />
        <Route path="/reportes-ciudadanos" element={
          <ProtectedRoute allowedRoles={['ciudadano', 'admin']}>
            <ReportesCiudadanos />
          </ProtectedRoute>
        } />
        
        {/* Rutas protegidas para recolectores */}
        <Route path="/recolector-dashboard" element={
          <ProtectedRoute allowedRoles={['recolector']}>
            <RecolectorDashboard />
          </ProtectedRoute>
        } />
        
        {/* Rutas públicas de soporte legal */}
        <Route path="/terminos-condiciones" element={<TerminosCondiciones />} />
        <Route path="/politica-privacidad" element={<PoliticaPrivacidad />} />
        
        {/* Rutas protegidas exclusivas de administrador */}
        <Route path="/admin-dashboard" element={
          <ProtectedRoute adminOnly={true}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
