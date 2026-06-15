// Adrese Web API-ja, Functions-a i SignalR Hub-a.

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7035';
const HUB_NAME = import.meta.env.VITE_HUB_NAME || 'hubs/telemetry';

export const CONFIG = {
  API_BASE_URL: `${API_BASE_URL}/api`,
  HUB_URL: `${API_BASE_URL}/${HUB_NAME}`,
};
