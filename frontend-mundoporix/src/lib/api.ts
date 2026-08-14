import type {
  ApiErrorPayload,
  AuthResponse,
  Paginated,
  Product,
} from "@/lib/types";

export const API_BASE = "/api/v1";

const ACCESS_KEY = "mp_access_token";
const REFRESH_KEY = "mp_refresh_token";

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

let refreshing: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new ApiError("Tu sesión ha expirado. Inicia sesión nuevamente.", 401);
  }
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) {
    clearTokens();
    throw new ApiError("Tu sesión ha expirado. Inicia sesión nuevamente.", 401);
  }
  const data = (await res.json()) as AuthResponse;
  setTokens(data.accessToken, data.refreshToken);
  return data.accessToken;
}

async function ensureAccessToken(): Promise<string | null> {
  const token = getAccessToken();
  if (token) return token;
  if (!getRefreshToken()) return null;
  refreshing = refreshing ?? refreshAccessToken().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retryOnAuth = true,
): Promise<T> {
  const token = await ensureAccessToken();
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch {
    throw new ApiError(
      "No se pudo conectar con el servidor. Inténtalo de nuevo.",
      0,
    );
  }

  if (res.status === 401 && token && retryOnAuth) {
    try {
      await refreshAccessToken();
    } catch {
      window.dispatchEvent(new CustomEvent("mp:auth-expired"));
      throw new ApiError("Tu sesión ha expirado. Inicia sesión nuevamente.", 401);
    }
    return apiFetch<T>(path, options, false);
  }

  if (!res.ok) {
    let payload: ApiErrorPayload | null = null;
    try {
      payload = (await res.json()) as ApiErrorPayload;
    } catch {
      /* sin cuerpo JSON */
    }
    const message = extractErrorMessage(payload, res.status);
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return (await res.json()) as T;
}

export function extractErrorMessage(
  payload: ApiErrorPayload | null,
  status: number,
): string {
  if (payload?.message) {
    if (Array.isArray(payload.message)) {
      return payload.message[0];
    }
    return payload.message;
  }
  if (status === 401) return "Credenciales inválidas";
  if (status === 404) return "No se encontró el recurso solicitado";
  if (status === 429) return "Demasiadas solicitudes. Espera un momento.";
  return "Ocurrió un error inesperado. Inténtalo de nuevo.";
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),

  post: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  patch: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
};

export type PageQuery = Record<string, string | number | undefined>;

export function toQueryString(params: PageQuery): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export interface ProductQuery extends PageQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  brandId?: string;
  seasonId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "name" | "price" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export function fetchProducts(query: ProductQuery) {
  return apiFetch<Paginated<Product>>(`/products${toQueryString(query)}`);
}
