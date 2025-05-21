import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
});

api.interceptors.request.use(
  (config) => {
    const visitorToken = localStorage.getItem('visitorAccessToken');
    const businessToken = localStorage.getItem('businessAccessToken');
    const adminToken = localStorage.getItem('adminAccessToken');

    const token = visitorToken || businessToken || adminToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
