// ============================================================
// api.js — Instância Axios configurada para Vercel → Render
// ============================================================
import axios from 'axios';
 
// ⚠️ No Vercel, configure a variável de ambiente:
// REACT_APP_API_URL = https://casalplanner-api.onrender.com/api
//
// O /api no final é obrigatório pois suas rotas são /api/auth/login etc.
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 30000,
  withCredentials: true, // ✅ envia cookies HttpOnly automaticamente em cross-site
  headers: {
    'Content-Type': 'application/json',
  },
});
 
// ─── Interceptor de REQUEST ────────────────────────────────
api.interceptors.request.use(
  (config) => {
    // ✅ Log de debug simples
    // ⚠️ NÃO tentamos ler document.cookie pois auth_token é HttpOnly
    // (cookies HttpOnly são invisíveis para JS por design de segurança)
    // O browser envia o cookie automaticamente graças ao withCredentials: true
    if (process.env.NODE_ENV === 'development') {
      console.log(`📤 ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    }
 
    return config;
  },
  (error) => Promise.reject(error)
);
 
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
 
    } else if (error.code === 'ECONNABORTED') {
      console.error('⏰ Timeout na requisição — API pode estar iniciando (Render free tier)');
    } else if (!error.response) {
      console.error('🌐 Erro de rede — API pode estar offline');
    }
 
    return Promise.reject(error);
  }
);

export default api;