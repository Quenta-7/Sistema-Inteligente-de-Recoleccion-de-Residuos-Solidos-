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
  
  return fetch(fullUrl, {
    ...options,
    headers,
  });
};
