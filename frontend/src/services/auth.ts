import { api } from "@/lib/api";
import type { LoginResponse, Usuario } from "./types";

export const authService = {
  login: (email: string, senha: string) =>
    api<LoginResponse>("/api/auth/login", {
      method: "POST",
      auth: false,
      body: { email, senha },
    }),
  loginComGoogle: (token: string) =>
    api<LoginResponse>("/api/auth/google", {
      method: "POST",
      auth: false,
      body: { token },
    }),
  logout: () => api("/api/auth/logout", { method: "POST" }),
  me: () => api<Usuario>("/api/auth/me"),
};
