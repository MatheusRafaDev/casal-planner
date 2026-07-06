import axios from 'axios';
import { storageService } from './storageService';

const TOKEN_KEY = 'token';
const PESSOA_KEY = 'pessoa';

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  console.error(
    '❌ VITE_API_URL não está definida. Configure a variável de ambiente.'
  );
} else {
  console.log('✅ VITE_API_URL:', API_URL);
}

// ─── Helpers de token ──────────────────────────────────────
export const tokenStorage = {
  get: () => storageService.getItem(TOKEN_KEY),
  set: (token) => storageService.setItem(TOKEN_KEY, token),
  remove: () => {
    storageService.removeItem(TOKEN_KEY);
    storageService.removeItem(PESSOA_KEY);
  },
  exists: () => !!storageService.getItem(TOKEN_KEY),
};

// Persiste qual pessoa do casal está logada
export const pessoaStorage = {
  get: () => storageService.getItem(PESSOA_KEY) || null,
  set: (pessoa) =>
    pessoa
      ? storageService.setItem(PESSOA_KEY, pessoa)
      : storageService.removeItem(PESSOA_KEY),
  remove: () => storageService.removeItem(PESSOA_KEY),
};

// ─── Instância Axios ───────────────────────────────────────
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── REQUEST ───────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = tokenStorage.get();

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (import.meta.env.DEV) {
      console.log(
        `📤 ${config.method?.toUpperCase()} ${config.url}`
      );
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ─── RESPONSE ──────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Token inválido
    if (error.response?.status === 401) {
      tokenStorage.remove();

      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }

      return Promise.reject(error);
    }

    // Sem API configurada
    if (!API_URL) {
      return Promise.reject(error);
    }

    // Retry automático
    if (!config || config._retryCount >= 2) {
      return Promise.reject(error);
    }

    if (
      error.response &&
      error.response.status < 500
    ) {
      return Promise.reject(error);
    }

    config._retryCount =
      (config._retryCount || 0) + 1;

    const delay =
      800 * Math.pow(2, config._retryCount - 1);

    await new Promise((r) => setTimeout(r, delay));

    return api(config);
  }
);

export default api;