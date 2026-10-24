
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

export async function apiFetch(path, options = {}) {
  const auth = getStoredAuth();
  const headers = new Headers(options.headers || {});

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (auth?.token) {
    headers.set('Authorization', `Bearer ${auth.token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  // A refresh failure is handled by SessionGuard.
  // Do not dispatch a second unauthorized event for it.
  const isRefreshRequest = path === '/api/auth/refresh';

  if (
      response.status === 401 &&
      auth?.token &&
      !isRefreshRequest
  ) {
    window.dispatchEvent(
        new CustomEvent('fudcy:unauthorized')
    );
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
