import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  withCredentials: true, // Important for sending/receiving HTTP-only cookies
});

// Request interceptor to attach the JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token refresh seamlessly (Day 2/3 task)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // If we get a 401 Unauthorized and we haven't already retried this request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Attempt to refresh the token using the HTTP-only cookie
        const res = await axios.post(
          'http://localhost:4000/api/auth/refresh',
          {},
          { withCredentials: true }
        );
        const newAccessToken = res.data.accessToken;
        // Save new token
        localStorage.setItem('accessToken', newAccessToken);
        // Update header and retry original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, meaning the refresh token is expired or invalid
        localStorage.removeItem('accessToken');
        // Force redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
