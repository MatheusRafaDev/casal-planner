import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'casal_planner_token';
const PESSOA_KEY = 'casal_planner_pessoa';

// No Expo, as variáveis de ambiente devem começar com EXPO_PUBLIC_
const EXPO_API_URL = process.env.EXPO_PUBLIC_API_URL;
if (!EXPO_API_URL) {
  throw new Error('EXPO_PUBLIC_API_URL não está configurada. Defina no arquivo .env antes de buildar.');
}
const BASE_URL = EXPO_API_URL.endsWith('/api') ? EXPO_API_URL : `${EXPO_API_URL}/api`;

console.log('🌐 API URL:', BASE_URL);

const API_TIMEOUT = 30000; // 30s (reduzido de 60s para alinhamento com frontend)

// Helper para abstrair SecureStore vs localStorage
const storage = {
  getItem: async (key: string) => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  deleteItem: async (key: string) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  }
};

// ─── Helpers de token (Seguro para Mobile) ──────────────────
export const tokenStorage = {
  get:    async ()      => await storage.getItem(TOKEN_KEY),
  set:    async (token: string) => await storage.setItem(TOKEN_KEY, token),
  remove: async ()      => { 
    await storage.deleteItem(TOKEN_KEY); 
    await storage.deleteItem(PESSOA_KEY); 
  },
  exists: async ()      => !!(await storage.getItem(TOKEN_KEY)),
};

export const pessoaStorage = {
  get:    async ()        => (await storage.getItem(PESSOA_KEY)) || null,
  set:    async (pessoa: string | null) => pessoa
    ? await storage.setItem(PESSOA_KEY, pessoa)
    : await storage.deleteItem(PESSOA_KEY),
  remove: async ()        => await storage.deleteItem(PESSOA_KEY),
};

// ─── Instância Axios ───────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  timeout: API_TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
});

// ─── REQUEST: injeta Bearer token em toda requisição ───────
api.interceptors.request.use(
  async (config) => {
    const token = await tokenStorage.get();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── RESPONSE: tratamento de erro 401 + retry em 5xx ─────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Token inválido/expirado — limpa storage
    if (error.response?.status === 401) {
      await tokenStorage.remove();
      // Em um app real, aqui dispararíamos uma navegação para o Login
      return Promise.reject(error);
    }

    // Retry automático em erro de rede ou 5xx (máx 2 tentativas)
    if (!config || config._retryCount >= 2) return Promise.reject(error);
    if (error.response && error.response.status < 500) return Promise.reject(error);

    config._retryCount = (config._retryCount || 0) + 1;
    const delay = 800 * Math.pow(2, config._retryCount - 1);
    await new Promise((r) => setTimeout(r, delay));

    if (__DEV__) {
      console.warn(`🔄 Retry ${config._retryCount} em ${config.url}`);
    }

    return api(config);
  }
);

export default api;
