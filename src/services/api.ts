import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('idrive_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});



api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Agora pegamos tanto o 401 quanto o 403!
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem("idrive_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
