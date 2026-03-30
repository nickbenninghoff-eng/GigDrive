import axios from 'axios';
import { Capacitor } from '@capacitor/core';

// On native, hit the deployed API; on web, use Vite proxy
const BASE_URL = Capacitor.isNativePlatform()
  ? 'https://api.gigdrive.app/api/v1' // Replace with your production API URL
  : '/api/v1';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
