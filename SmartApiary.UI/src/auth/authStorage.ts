const authTokenKey = 'smartapiary.authToken';

export type UserRole = 'Admin' | 'Beekeeper' | 'Farmer';

type TokenPayload = {
  Role: UserRole;
  UserId: string;
};

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
  return getAuthToken() !== null;
}

export function getCurrentUserRole(): UserRole | null {
  const payload = getTokenPayload();

  return payload ? payload.Role : null;
}

export function getCurrentUserId() {
  const payload = getTokenPayload();

  return payload ? payload.UserId : null;
}

function getTokenPayload(): TokenPayload | null {
  const token = getAuthToken();

  if (!token) {
    return null;
  }

  try {
    // JWT token ima tri dela, a nama su potrebni podaci iz srednjeg dela.
    const payload = token.split('.')[1];
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      '=',
    );

    return JSON.parse(window.atob(paddedPayload)) as TokenPayload;
  } catch {
    return null;
  }
}
