export const API_BASE =
  import.meta.env?.VITE_API_URL ||
  (typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000'
    : 'https://neffto-solution-backend.vercel.app');

export const WEBSITE_BASE =
  import.meta.env?.VITE_PUBLIC_WEBSITE_URL ||
  (typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5173'
    : 'https://nefftosolution.com');

export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('neffto_admin_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
};
