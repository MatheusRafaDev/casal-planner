// ============================================================
// api.js — Axios com localStorage + Authorization Bearer
// ============================================================
import axios from 'axios';

const TOKEN_KEY = 'casal_planner_token';

if (!process.env.REACT_APP_API_URL) {
  console.error('❌ REACT_APP_API_URL não está definida. Configure a variável de ambiente.');
}

// ─── Helpers de token ──────────────────────────────────────
export const tokenStorage = {
  get:    ()        => localStorage.getItem(TOKEN_KEY),
  set:    (token)   => localStorage.setItem(TOKEN_KEY, token),
  remove: ()        => localStorage.removeItem(TOKEN_KEY),
  exists: ()        => !!localStorage.getItem(TOKEN_KEY),
};

// ─── Instância Axios ───────────────────────────────────────
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── REQUEST: injeta Bearer token em toda requisição ───────
api.interceptors.request.use(
  (config) => {
    const token = tokenStorage.get();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── RESPONSE: retry em 5xx + limpa token em 401 ──────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Token inválido/expirado — limpa e redireciona
    if (error.response?.status === 401) {
      tokenStorage.remove();
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // Sem baseURL configurada — falha imediata, sem retry
    if (!process.env.REACT_APP_API_URL) return Promise.reject(error);

    // Retry automático em erro de rede ou 5xx (máx 2 tentativas)
    if (!config || config._retryCount >= 2) return Promise.reject(error);
    if (error.response && error.response.status < 500) return Promise.reject(error);

    config._retryCount = (config._retryCount || 0) + 1;
    const delay = 800 * Math.pow(2, config._retryCount - 1);
    await new Promise((r) => setTimeout(r, delay));

    if (process.env.NODE_ENV === 'development') {
      console.warn(`🔄 Retry ${config._retryCount} em ${config.url}`);
    }

    return api(config);
  }
);

export default api;
