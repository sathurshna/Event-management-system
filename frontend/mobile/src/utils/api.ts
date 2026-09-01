import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Production backend URL (Render deployment)
const baseURL = 'https://event-management-system-a0j8.onrender.com/api';

const api = axios.create({
  baseURL,
});

// Interceptor to add JWT token
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
