/**
 * Helper para realizar peticiones autenticadas
 * Agrega automáticamente el token a la cabecera Authorization
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export const authedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
  
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
    const isPublicPage = ['/login', '/registro', '/recuperar-contrasena', '/politica-privacidad', '/terminos-condiciones'].includes(currentPath);
    
    if (!isPublicPage) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('user_data');
      window.location.href = '/login';
    }
  }

  return response;
};
