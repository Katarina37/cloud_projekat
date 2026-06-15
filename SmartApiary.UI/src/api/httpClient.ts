// API pozivi koje koristi httpClient.

import axios from 'axios';
import { clearAuthToken, getAuthToken } from '../auth/authStorage';
import { CONFIG } from '../config/config';

const apiClient = axios.create({
  baseURL: CONFIG.API_BASE_URL,
});

// Ovo prolazi pre svakog axios zahteva.
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();

  // Posle login-a svaki zahtev nosi token.
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    // 401 obradjujemo ovde za celu aplikaciju.
    const status = axios.isAxiosError(error) && error.response
      ? error.response.status
      : null;

    if (status === 401) {
      // Ako je sesija istekla, korisnik se vraca na stranicu za prijavu.
      clearAuthToken();

      if (!isAuthPage(window.location.pathname)) {
        window.location.assign('/login');
      }
    }

    return Promise.reject(error);
  },
);

function isAuthPage(pathname: string) {
  return pathname === '/login'
    || pathname === '/activate'
    || pathname === '/forgot-password'
    || pathname === '/reset-password';
}

export default apiClient;
