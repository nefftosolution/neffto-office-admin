const getApiBase = () => {
  const envUrl = import.meta.env?.VITE_API_URL;
  if (envUrl && !envUrl.includes('your-backend') && !envUrl.includes('placeholder')) {
    return envUrl.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
  }
  return 'https://neffto-solution-backend.vercel.app';
};

const getWebsiteBase = () => {
  const envUrl = import.meta.env?.VITE_PUBLIC_WEBSITE_URL;
  if (envUrl && !envUrl.includes('your-') && !envUrl.includes('placeholder')) {
    return envUrl.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5173';
    }
  }
  return 'https://nefftosolution.com';
};

export const API_BASE = getApiBase();
export const WEBSITE_BASE = getWebsiteBase();

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
