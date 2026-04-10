import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  withCredentials: true,
});


api.interceptors.response.use(
  (response) => response,
  (error) => {

    if (error.response?.status === 401) {
      console.log('Erro 401:', error.config?.url);
    }
    return Promise.reject(error);
  }
);

export default api;