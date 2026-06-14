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
  const payload = getTokenPayload();

  return payload ? payload.Role : null;
}

export function getCurrentUserId() {
  const payload = getTokenPayload();

  return payload ? payload.UserId : null;
}

export function getCurrentUserDisplayName() {
  const email = getCurrentUserEmail();

  if (!email) {
    const role = getCurrentUserRole();

    if (role === 'Admin') {
      return 'Administrator';
    }

    if (role === 'Farmer') {
      return 'Poljoprivrednik';
    }

    return 'Pčelar';
  }

  const emailName = email.split('@')[0];
  const nameParts = emailName.split(/[._-]+/).filter((part) => part.length > 0);

  if (nameParts.length === 0) {
    return email;
  }

  return nameParts
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join(' ');
}

function getCurrentUserEmail() {
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

    return JSON.parse(window.atob(paddedPayload)) as TokenPayload;
  } catch {
    return null;
  }
}
