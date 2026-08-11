/**
 * Helper para realizar peticiones autenticadas
 * Agrega automáticamente el token a la cabecera Authorization
 */
import { clearAuthSession, getAuthToken, isTokenExpired } from './utils/auth';

export const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  const isLocalhost = typeof window !== 'undefined' && Boolean(
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '[::1]'
  );
  return isLocalhost ? 'http://127.0.0.1:8000' : 'https://jose07q.pythonanywhere.com';
};

const API_BASE_URL = getApiBaseUrl();

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

export const getMediaUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;

  const rawBase = import.meta.env.VITE_API_BASE_URL || '';
  const apiBase = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;

  // Relative path starting with / (e.g. /media/evidencias/foo.jpg)
  if (url.startsWith('/')) {
    return apiBase ? `${apiBase}${url}` : url;
  }

  // If local domain returned in deployment response, replace host with API base
  if (apiBase && (url.includes('localhost') || url.includes('127.0.0.1') || url.includes('0.0.0.0'))) {
    try {
      const parsed = new URL(url);
      return `${apiBase}${parsed.pathname}`;
    } catch (e) {
      return url;
    }
  }

  // Fix mixed content if page is served over HTTPS
  if (window.location.protocol === 'https:' && url.startsWith('http://') && !url.includes('localhost')) {
    return url.replace('http://', 'https://');
  }

  return url;
};
