import { api } from "@/lib/api";
import type { LoginResponse, Usuario } from "./types";

export const authService = {
  login: (email: string, senha: string) =>
    api<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: { email, senha },
    }),
  loginComGoogle: (token: string) =>
    api<LoginResponse>("/api/auth/google", {
      method: "POST",
      body: { token },
    }),
  logout: () => api("/api/auth/logout", { method: "POST" }),
  me: () => api<Usuario>("/api/auth/me"),
};
