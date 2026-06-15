// Ovde cuvamo JWT i citamo podatke prijavljenog korisnika.

const authTokenKey = 'smartapiary.authToken';
const currentUserEmailKey = 'smartapiary.currentUserEmail';

export type UserRole = 'Admin' | 'Beekeeper' | 'Farmer';

type TokenPayload = {
  Role: UserRole;
  UserId: string;
  Email?: string;
  email?: string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'?: string;
};

export function getAuthToken() {
  return window.localStorage.getItem(authTokenKey);
}

export function setAuthToken(token: string) {
  // localStorage ostaje i posle refresh-a.
  window.localStorage.setItem(authTokenKey, token);
}

export function setCurrentUserEmail(email: string) {
  window.localStorage.setItem(currentUserEmailKey, email);
}

export function clearAuthToken() {
  window.localStorage.removeItem(authTokenKey);
  window.localStorage.removeItem(currentUserEmailKey);
}

export function hasAuthToken() {
  return getAuthToken() !== null;
}

export function getCurrentUserRole(): UserRole | null {
  // Ulogu iz tokena koristimo za meni i rute.
  const payload = getTokenPayload();

  return payload ? payload.Role : null;
}

export function getCurrentUserId() {
  const payload = getTokenPayload();

  return payload ? payload.UserId : null;
}

export function getCurrentUserEmail() {
  const savedEmail = window.localStorage.getItem(currentUserEmailKey);

  if (savedEmail) {
    return savedEmail;
  }

  const payload = getTokenPayload();

  if (!payload) {
    return null;
  }

  if (payload.Email) {
    return payload.Email;
  }

  if (payload.email) {
    return payload.email;
  }

  return payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']
    ? payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']
    : null;
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

    // Front samo cita payload, potpis proverava backend.
    return JSON.parse(window.atob(paddedPayload)) as TokenPayload;
  } catch {
    return null;
  }
}
