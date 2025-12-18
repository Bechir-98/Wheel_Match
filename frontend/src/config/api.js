/**
 * API version prefix for this app (must match FastAPI `api_v1` in main.py).
 * VITE_API_URL: full base including version, e.g. http://127.0.0.1:8000/api/v1
 * Leave unset in dev to use same-origin `/api/v1` (Vite proxies `/api` → backend).
 */
const API_V1 = '/api/v1';

export function getApiRoot() {
  const raw = import.meta.env.VITE_API_URL;
  if (raw == null || String(raw).trim() === '') {
    return API_V1;
  }
  return String(raw).replace(/\/$/, '');
}

/** @deprecated use getApiRoot */
export function getApiBase() {
  return getApiRoot();
}

/**
 * @param {string} path - path under v1, e.g. "/auth/login" or "wheelchairs"
 */
export function apiUrl(path) {
  const root = getApiRoot();
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${root}${p}`;
}

export function authHeaders(extra = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    Accept: 'application/json',
    // ponytail: single locale source for backend strings, i18n owns the value
    'Accept-Language': localStorage.getItem('wm-lang') || 'en',
    ...extra,
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}
