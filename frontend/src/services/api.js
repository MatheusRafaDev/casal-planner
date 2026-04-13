// ============================================================
// api.js — Instância Axios otimizada com retry e cache de GETs
// ============================================================
import axios from 'axios';

// Cache em memória para requisições GET (TTL de 30s)
const _cache = new Map();
const CACHE_TTL = 30_000;

const getCached = (key) => {
  const entry = _cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) { _cache.delete(key); return null; }
  return entry.data;
};
const setCached = (key, data) => _cache.set(key, { data, ts: Date.now() });
export const invalidateCache = (pattern) => {
  for (const key of _cache.keys()) {
    if (!pattern || key.includes(pattern)) _cache.delete(key);
  }
};

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  // Timeout reduzido para mobile — fallback mais rápido
  timeout: 15000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Interceptor de REQUEST ────────────────────────────────
api.interceptors.request.use(
  (config) => {
    // Cache de leitura para GETs — evita round-trips desnecessários
    if (config.method === 'get' && config.useCache !== false) {
      const cacheKey = (config.baseURL || '') + (config.url || '') + JSON.stringify(config.params || {});
      const cached = getCached(cacheKey);
      if (cached) {
        config.adapter = () =>
          Promise.resolve({
            data: cached,
            status: 200,
            statusText: 'OK (cache)',
            headers: {},
            config,
          });
      }
    }
    if (process.env.NODE_ENV === 'development') {
      console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Interceptor de RESPONSE com retry automático ─────────
api.interceptors.response.use(
  (response) => {
    if (
      response.config.method === 'get' &&
      response.config.useCache !== false &&
      response.status === 200
    ) {
      const cacheKey =
        (response.config.baseURL || '') +
        (response.config.url || '') +
        JSON.stringify(response.config.params || {});
      setCached(cacheKey, response.data);
    }
    // Invalida cache em mutações
    if (['post', 'put', 'patch', 'delete'].includes(response.config.method)) {
      invalidateCache();
    }
    return response;
  },
  async (error) => {
    const config = error.config;

    // Retry em erro de rede ou 5xx (máx 2 tentativas, sem retry em 4xx)
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
