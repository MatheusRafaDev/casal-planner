import { api } from "@/lib/api";

export const recuperarSenhaService = {
  esqueciSenha: (email: string) =>
    api("/api/recuperarsenha/esqueci-senha", {
      method: "POST",
      body: { email },
    }),
  validarCodigo: (email: string, codigo: string) =>
    api<{ token: string }>("/api/recuperarsenha/validar-codigo", {
      method: "POST",
      body: { email, codigo },
    }),
  redefinirSenha: (email: string, token: string, novaSenha: string) =>
    api("/api/recuperarsenha/redefinir-senha", {
      method: "POST",
      body: { email, token, novaSenha },
    }),
};
