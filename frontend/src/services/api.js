
import axios from 'axios';
 

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 30000,
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
});
 
// ─── Interceptor de REQUEST ────────────────────────────────
api.interceptors.request.use(
  (config) => {
 
    return config;
  },
  (error) => Promise.reject(error)
);
 
// ─── Interceptor de RESPONSE ───────────────────────────────
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${response.config.url} - Status: ${response.status}`);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.error(`🔒 Erro 401 em: ${error.config?.url}`);
 
      if (!window.location.pathname.includes('/login')) {
        console.log('🔄 Redirecionando para login...');
        window.location.href = '/login';
      }
    } else if (error.code === 'ECONNABORTED') {
      console.error('Timeout na requisição — API pode estar iniciando (Render free tier)');
    } else if (!error.response) {
      console.error('Erro de rede — API pode estar offline');
    }
 
    return Promise.reject(error);
  }
);

export default api;