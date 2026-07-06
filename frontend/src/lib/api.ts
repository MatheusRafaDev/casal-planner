import axios from "axios";

const TOKEN_KEY = "cp_token";
const PESSOA_KEY = "cp_pessoa";

const API_URL = import.meta.env.VITE_API_URL ?? "https://casalplanner-api.onrender.com";

export const tokenStorage = {
  get: () => (typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY)),
  set: (token: string) => {
    if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, token);
  },
  remove: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PESSOA_KEY);
  },
  exists: () => (typeof window === "undefined" ? false : !!localStorage.getItem(TOKEN_KEY)),
};

export const pessoaStorage = {
  get: () => (typeof window === "undefined" ? null : localStorage.getItem(PESSOA_KEY)),
  set: (pessoa: string | null) => {
    if (typeof window === "undefined") return;
    if (pessoa) localStorage.setItem(PESSOA_KEY, pessoa);
    else localStorage.removeItem(PESSOA_KEY);
  },
};

const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    if (error.response?.status === 401) {
      tokenStorage.remove();
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    if (!config || config._retryCount >= 2) return Promise.reject(error);
    if (error.response && error.response.status < 500) return Promise.reject(error);

    config._retryCount = (config._retryCount || 0) + 1;
    const delay = 800 * Math.pow(2, config._retryCount - 1);
    await new Promise((r) => setTimeout(r, delay));
    return api(config);
  },
);

export function extractApiError(error: unknown, fallback: string): string {
  const err = error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
  const data = err?.response?.data;
  if (!data) return fallback;
  if (data.message) return data.message;
  if (data.errors) {
    const first = Object.values(data.errors)[0];
    if (Array.isArray(first) && first.length > 0) return first[0];
  }
  return fallback;
}

export default api;
