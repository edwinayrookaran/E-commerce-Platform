export const API_BASE = 'http://localhost:8080';

const AUTH_KEY = 'fudcy_auth';
const LEGACY_USER_KEY = 'fudcy_customer_user';
const LOOKUP_PHONE_KEY = 'fudcy_customer_phone';

export function getStoredAuth() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);

    if (raw) {
      const auth = JSON.parse(raw);

      if (auth?.token && auth?.user) {
        return auth;
      }

      localStorage.removeItem(AUTH_KEY);
    }

    // Remove obsolete legacy authentication data.
    localStorage.removeItem(LEGACY_USER_KEY);
  } catch (error) {
    console.error('Unable to read stored authentication:', error);
  }

  return null;
}

export function storeAuth(auth) {
  if (!auth?.token || !auth?.user) {
    clearAuth();
    return;
  }

  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
    localStorage.removeItem(LEGACY_USER_KEY);
  } catch (error) {
    console.error('Unable to store authentication:', error);
    throw error;
  }
}

export function clearAuth() {
  try {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(LEGACY_USER_KEY);
  } catch (error) {
    console.error('Unable to clear authentication:', error);
  }
}

export function clearGuestLookupStorage() {
  try {
    localStorage.removeItem(LOOKUP_PHONE_KEY);
  } catch (error) {
    console.error('Unable to clear guest lookup data:', error);
  }
}

let refreshPromise = null;

export async function doRefresh() {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const stored = getStoredAuth();
      if (!stored?.token) return null;

      const res = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${stored.token}`,
        },
      });

      if (!res.ok) {
        return null;
      }

      const payload = await res.json();
      const token = payload?.token;
      const user = payload?.user || payload?.customer;

      if (!token || !user) {
        return null;
      }

      const freshAuth = {
        token,
        expiresAt: payload.expiresAt,
        user,
      };

      storeAuth(freshAuth);

      if ('BroadcastChannel' in window) {
        try {
          const channel = new BroadcastChannel('fudcy-auth');
          channel.postMessage({ type: 'renewed', auth: freshAuth });
          channel.close();
        } catch {}
      }

      window.dispatchEvent(
        new CustomEvent('fudcy:session-renewed', { detail: user })
      );

      return freshAuth;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiFetch(path, options = {}) {
  const auth = getStoredAuth();
  const headers = new Headers(options.headers || {});

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (auth?.token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${auth.token}`);
  }

  let response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  // Do not intercept authentication endpoints (login, register, refresh)
  const isAuthEndpoint =
    path.startsWith('/api/auth/login') ||
    path.startsWith('/api/auth/register') ||
    path.startsWith('/api/auth/refresh');

  if (response.status === 401 && auth?.token && !isAuthEndpoint) {
    // Attempt session renewal before declaring the session invalid
    const freshAuth = await doRefresh();
    if (freshAuth?.token) {
      // Retry the original request with the renewed token
      const retryHeaders = new Headers(options.headers || {});
      if (options.body && !retryHeaders.has('Content-Type')) {
        retryHeaders.set('Content-Type', 'application/json');
      }
      retryHeaders.set('Authorization', `Bearer ${freshAuth.token}`);

      response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: retryHeaders,
      });
    } else {
      // Session renewal failed — token is genuinely expired and cannot be renewed
      window.dispatchEvent(new CustomEvent('fudcy:unauthorized'));
    }
  }

  return response;
}

export async function readError(response, fallback) {
  try {
    const data = await response.json();

    if (data?.message) {
      return data.message;
    }

    if (data?.error) {
      return data.error;
    }
  } catch {
    // The response may not contain JSON.
  }

  return fallback;
}
