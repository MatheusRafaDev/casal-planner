import api, { extractApiError } from "@/lib/api";

const BASE = "/RecuperarSenha";

export interface ServiceResult<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  code?: string;
}

export const recuperarSenhaService = {
  async solicitarCodigo(email: string): Promise<ServiceResult> {
    try {
      const response = await api.post(`${BASE}/esqueci-senha`, { email: email.trim().toLowerCase() });
      return { success: true, message: response.data?.message ?? "Código enviado", data: response.data };
    } catch (error) {
      return { success: false, message: extractApiError(error, "Não foi possível enviar o código") };
    }
  },

  async validarCodigo(email: string, codigo: string): Promise<ServiceResult<{ token?: string }>> {
    try {
      const response = await api.post(`${BASE}/validar-codigo`, { email, codigo });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: extractApiError(error, "Código inválido") };
    }
  },

  async redefinirSenha(email: string, token: string, novaSenha: string): Promise<ServiceResult> {
    try {
      const response = await api.post(`${BASE}/redefinir-senha`, { email, token, novaSenha });
      return { success: true, message: response.data?.message ?? "Senha redefinida", data: response.data };
    } catch (error) {
      return { success: false, message: extractApiError(error, "Não foi possível redefinir a senha") };
    }
  },
};
