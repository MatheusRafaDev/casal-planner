import axios from 'axios';

const baseURL =
  process.env.REACT_APP_API_URL || 'http://localhost:5286/api';

const api = axios.create({
  baseURL,
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
