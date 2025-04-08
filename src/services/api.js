import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
  timeout: 100000, // Timeout de 1 minuto
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar o token à requisição, se disponível
api.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        if (parsedUser.token) {
          config.headers['Authorization'] = `Bearer ${parsedUser.token}`;
        }
      } catch (err) {
        console.error('Erro ao parsear usuário do localStorage', err);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
