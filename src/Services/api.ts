// The real API client. This replaces Cuba's src/Services/fack.backend.js,
// which intercepts window.fetch and answers /users from a hard-coded array.
//
// Mirrors the contract the backend actually serves (hello_fit_backend):
//   - every success is { success: true, data, meta, message }
//     (common/interceptors/response-envelope.interceptor.ts)
//   - every failure is { success: false, error: { code, message, details? }, meta }
//     (common/filters/all-exceptions.filter.ts)
//   - admin routes want an `admin`-audience bearer; an app token on an
//     /admin/* route answers 401 TOKEN_INVALID, not 403, because the audience
//     guard runs before the permission guard.
//
// Refresh is single-flight: a burst of 401s from parallel table loads must
// produce one rotation, not one per request. The backend rotates refresh tokens
// and detects replay, so a second concurrent refresh would invalidate the
// first one's result and log the admin out.

export interface ApiMeta {
  [key: string]: unknown;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export type ApiResult<T> =
  | { ok: true; data: T; meta: ApiMeta | null; message: string | null }
  | { ok: false; error: ApiError; status: number };

// Relative by default so the dev server's /api proxy handles it and the
// browser stays same-origin -- the API has no CORS configured. Override with
// VITE_API_BASE_URL when the panel is served from a different origin than the
// API, which also requires the backend to allow it.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const ACCESS_KEY = 'hf_admin_access_token';
const REFRESH_KEY = 'hf_admin_refresh_token';

export const tokenStore = {
  get access() {
    return localStorage.getItem(ACCESS_KEY);
  },
  get refresh() {
    return localStorage.getItem(REFRESH_KEY);
  },
  set(accessToken: string, refreshToken: string) {
    localStorage.setItem(ACCESS_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

/** The in-flight refresh, if any. Shared so concurrent 401s wait on one call. */
let refreshInFlight: Promise<boolean> | null = null;

async function rotateRefreshToken(): Promise<boolean> {
  const refreshToken = tokenStore.refresh;
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!response.ok) {
      tokenStore.clear();
      return false;
    }
    const body = await response.json();
    const pair = body?.data as TokenPair | undefined;
    if (!pair?.accessToken || !pair?.refreshToken) {
      tokenStore.clear();
      return false;
    }
    tokenStore.set(pair.accessToken, pair.refreshToken);
    return true;
  } catch {
    tokenStore.clear();
    return false;
  }
}

function refreshOnce(): Promise<boolean> {
  refreshInFlight ??= rotateRefreshToken().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  /** Set for the login call, which must not carry or rotate a token. */
  anonymous?: boolean;
  signal?: AbortSignal;
}

async function send<T>(
  path: string,
  options: RequestOptions,
  isRetry = false,
): Promise<ApiResult<T>> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (!options.anonymous) {
    const access = tokenStore.access;
    if (access) headers.Authorization = `Bearer ${access}`;
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
    });
  } catch {
    return {
      ok: false,
      status: 0,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Could not reach the server.',
      },
    };
  }

  // 401 once -> rotate and replay. Twice -> the session is genuinely over.
  if (response.status === 401 && !options.anonymous && !isRetry) {
    const refreshed = await refreshOnce();
    if (refreshed) {
      return send<T>(path, options, true);
    }
  }

  let body: unknown = null;
  const text = await response.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }

  if (!response.ok) {
    const envelope = body as
      | { error?: { code?: string; message?: string; details?: unknown } }
      | null;
    return {
      ok: false,
      status: response.status,
      error: {
        code: envelope?.error?.code ?? 'UNKNOWN',
        message: envelope?.error?.message ?? response.statusText,
        details: envelope?.error?.details,
      },
    };
  }

  const envelope = body as {
    data?: T;
    meta?: ApiMeta | null;
    message?: string | null;
  } | null;

  return {
    ok: true,
    data: envelope?.data as T,
    meta: envelope?.meta ?? null,
    message: envelope?.message ?? null,
  };
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) =>
    send<T>(path, { method: 'GET', signal }),
  post: <T>(path: string, body?: unknown, signal?: AbortSignal) =>
    send<T>(path, { method: 'POST', body, signal }),
  patch: <T>(path: string, body?: unknown, signal?: AbortSignal) =>
    send<T>(path, { method: 'PATCH', body, signal }),
  put: <T>(path: string, body?: unknown, signal?: AbortSignal) =>
    send<T>(path, { method: 'PUT', body, signal }),
  delete: <T>(path: string, signal?: AbortSignal) =>
    send<T>(path, { method: 'DELETE', signal }),

  /** POST /admin/auth/login — no bearer, no refresh-on-401. */
  adminLogin: (email: string, password: string) =>
    send<TokenPair>('/admin/auth/login', {
      method: 'POST',
      body: { email, password },
      anonymous: true,
    }),

  /** POST /admin/auth/logout — needs the admin bearer and the refresh token. */
  adminLogout: (refreshToken: string) =>
    send<null>('/admin/auth/logout', {
      method: 'POST',
      body: { refreshToken },
    }),
};

export type { TokenPair };
