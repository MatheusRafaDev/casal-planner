import axios from 'axios';

const baseURL =
  process.env.REACT_APP_API_URL || 'http://localhost:5286/api';

const api = axios.create({
  baseURL,
  timeout: 30000, // Aumentar timeout para 30 segundos
  withCredentials: true, // ✅ Já está correto
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para LOG (debug)
api.interceptors.request.use(
  (config) => {
    // Verificar se o cookie está sendo enviado
    const hasCookie = document.cookie.includes('auth_token');
    console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
    console.log(`🍪 Cookie auth_token presente: ${hasCookie ? 'Sim ✅' : 'Não ❌'}`);
    
    // Opcional: Se quiser enviar também no header Authorization
    const tokenMatch = document.cookie.match(/auth_token=([^;]+)/);
    if (tokenMatch && tokenMatch[1]) {
      config.headers.Authorization = `Bearer ${tokenMatch[1]}`;
      console.log(`🔑 Token adicionado ao header Authorization`);
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para respostas
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.error(`🔒 Erro 401 em: ${error.config?.url}`);
      
      // Se não estiver na página de login, redirecionar
      if (!window.location.pathname.includes('/login')) {
        console.log('🔄 Redirecionando para login...');
        // window.location.href = '/login';
      }
    } else if (error.code === 'ECONNABORTED') {
      console.error('⏰ Timeout na requisição');
    } else if (!error.response) {
      console.error('🌐 Erro de rede - API pode estar offline');
    }
    
    return Promise.reject(error);
  }
);

export default api;