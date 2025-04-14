import axios from 'axios';

const apiAuth = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL_AUTH,
  timeout: Number(process.env.REACT_APP_TIMEOUT),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar o token à requisição
apiAuth.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('token');
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

export default apiAuth;
