import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nexus_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('nexus_refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(
            (import.meta.env.VITE_API_URL || '/api') + '/auth/refresh',
            { refreshToken }
          );
          const newAccessToken = res.data.data.accessToken;
          localStorage.setItem('nexus_access_token', newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (err) {
          localStorage.removeItem('nexus_access_token');
          localStorage.removeItem('nexus_refresh_token');
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
