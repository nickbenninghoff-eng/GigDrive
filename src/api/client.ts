import axios from 'axios';
import { Capacitor } from '@capacitor/core';

// API URL: use Vite proxy in dev, Render in production/native
const BASE_URL = import.meta.env.DEV
  ? '/api/v1' // Vite proxy in development
  : Capacitor.isNativePlatform()
    ? 'https://gigdrive-api.onrender.com/api/v1'
    : 'https://gigdrive-api.onrender.com/api/v1';

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
