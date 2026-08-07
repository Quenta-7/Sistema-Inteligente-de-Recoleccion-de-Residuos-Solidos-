/**
 * Helper para realizar peticiones autenticadas
 * Agrega automáticamente el token a la cabecera Authorization
 */
import { clearAuthSession, getAuthToken, isTokenExpired } from './utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const authedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAuthToken();
  if (token && isTokenExpired(token)) {
    clearAuthSession();
    window.location.href = '/login';
    return new Response(JSON.stringify({ detail: 'Token expirado.' }), { status: 401 });
  }
  
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Token ${token}`);
  }
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  
  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  // Manejo centralizado de tokens expirados o no autorizados (401)
  if (response.status === 401) {
    const currentPath = window.location.pathname;
    const isPublicPage = ['/login', '/registro', '/recuperar-contrasena', '/restablecer-contrasena', '/politica-privacidad', '/terminos-condiciones'].some(page => currentPath.startsWith(page));
    
    if (!isPublicPage) {
      clearAuthSession();
      window.location.href = '/login';
    }
  }

  return response;
};
