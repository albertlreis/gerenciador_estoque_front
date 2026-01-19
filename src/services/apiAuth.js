import axios from 'axios';

const apiAuth = axios.create({
  baseURL: `${process.env.REACT_APP_BASE_URL_AUTH}/api/v1`,
  timeout: Number(process.env.REACT_APP_TIMEOUT),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

apiAuth.interceptors.request.use(
  (config) => {
    const url = config.url || '';

    // Rotas públicas
    if (url.includes('/auth/login') || url.includes('/auth/refresh')) {
      return config;
    }

    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const parsedUser = JSON.parse(userStr);
        if (parsedUser?.token) {
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
