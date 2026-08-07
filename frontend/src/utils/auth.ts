export const clearAuthSession = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');
  sessionStorage.removeItem('auth_token');
  sessionStorage.removeItem('user_data');
};

export const getAuthToken = () =>
  sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');

export const getOrCreateDeviceId = () => {
  const key = 'device_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = globalThis.crypto?.randomUUID?.() || `android-web-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(key, id);
  }
  return id;
};

export const getTokenExpiration = (token: string): number | null => {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(payload));
    return typeof decoded.exp === 'number' ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
};

export const isTokenExpired = (token: string) => {
  const expiration = getTokenExpiration(token);
  return expiration !== null && expiration <= Date.now();
};
