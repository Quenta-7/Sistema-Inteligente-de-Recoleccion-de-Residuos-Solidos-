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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tienda-ecopuntos" element={<TiendaEcoPuntos />} />
        <Route path="/mapa-en-vivo" element={<MapaEnVivo />} />
        <Route path="/horarios" element={<Horarios />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route path="/terminos-condiciones" element={<TerminosCondiciones />} />
        <Route path="/politica-privacidad" element={<PoliticaPrivacidad />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
