import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const token = localStorage.getItem('auth_token') ?? sessionStorage.getItem('auth_token');
  const userDataRaw = localStorage.getItem('user_data') ?? sessionStorage.getItem('user_data');

  if (!token || !userDataRaw) {
    // No autenticado, redirigir a login
    return <Navigate to="/login" replace />;
  }

  try {
    const userData = JSON.parse(userDataRaw);
    if (adminOnly && userData.rol !== 'admin') {
      // Si requiere admin pero no lo es, redirigir al dashboard ciudadano con flag de denegación
      return <Navigate to="/dashboard?denied=true" replace />;
    }
  } catch (e) {
    // En caso de error de parseo (datos corruptos), limpiar y redirigir
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('user_data');
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
