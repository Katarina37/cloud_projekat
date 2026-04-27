const authTokenKey = 'smartapiary.authToken';
const roleClaimType = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

export function getAuthToken() {
  return window.localStorage.getItem(authTokenKey);
}

export function setAuthToken(token: string) {
  window.localStorage.setItem(authTokenKey, token);
}

export function clearAuthToken() {
  window.localStorage.removeItem(authTokenKey);
}

export function hasAuthToken() {
  return Boolean(getAuthToken());
}

export function getCurrentUserRole() {
  const payload = getTokenPayload();

  return payload?.Role ?? payload?.role ?? payload?.[roleClaimType] ?? null;
}

function getTokenPayload(): Record<string, string> | null {
  const token = getAuthToken();
  const payload = token?.split('.')[1];

  if (!payload) {
    return null;
  }

  try {
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      '=',
    );

    return JSON.parse(window.atob(paddedPayload)) as Record<string, string>;
  } catch {
    return null;
  }
}
