/**
 * Cliente HTTP central que fala com a API .NET do Casal Planner.
 * Injeta JWT do localStorage, normaliza erros e devolve JSON tipado.
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;

export const TOKEN_STORAGE_KEY = "cp_token";

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  else window.localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export interface ApiOptions extends Omit<RequestInit, "body" | "headers"> {
  body?: unknown;
  headers?: Record<string, string>;
  auth?: boolean; // default true
  query?: Record<string, string | number | boolean | undefined>;
}

export async function api<T = unknown>(path: string, opts: ApiOptions = {}): Promise<T> {
  const { body, headers = {}, auth = true, query, ...rest } = opts;

  const url = new URL(path.startsWith("http") ? path : `${API_BASE_URL}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }

  const finalHeaders: Record<string, string> = { Accept: "application/json", ...headers };
  if (body !== undefined && !(body instanceof FormData)) {
    finalHeaders["Content-Type"] = finalHeaders["Content-Type"] ?? "application/json";
  }
  if (auth) {
    const token = getToken();
    if (token) finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      ...rest,
      credentials: "include",
      headers: finalHeaders,
      body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }
    if (error instanceof TypeError) {
      throw new ApiError(
        "Sem conexão com o servidor. Verifique sua internet e tente novamente.",
        0,
        null,
      );
    }
    throw error;
  }

  if (response.status === 401 && !url.pathname.includes("/auth/refresh") && !url.pathname.includes("/auth/login")) {
    try {
      const refreshUrl = new URL(`${API_BASE_URL}/api/auth/refresh`);
      const refreshResponse = await fetch(refreshUrl.toString(), {
        method: "POST",
        credentials: "include",
        headers: { Accept: "application/json" }
      });
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        if (refreshData.token) {
          setToken(refreshData.token);
          if (auth) {
            finalHeaders["Authorization"] = `Bearer ${refreshData.token}`;
          }
          response = await fetch(url.toString(), {
            ...rest,
            credentials: "include",
            headers: finalHeaders,
            body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
          });
        }
      } else {
        setToken(null);
      }
    } catch {
      setToken(null);
    }
  }

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await response.json().catch(() => null) : await response.text();

  if (!response.ok) {
    const message =
      (isJson && data && typeof data === "object" && "message" in (data as Record<string, unknown>)
        ? String((data as Record<string, unknown>).message)
        : null) ?? (typeof data === "string" && data ? data : `Erro ${response.status}`);
    throw new ApiError(message, response.status, data);
  }

  return data as T;
}
