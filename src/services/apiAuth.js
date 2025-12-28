import axios from 'axios';

const apiAuth = axios.create({
  baseURL: `${process.env.REACT_APP_BASE_URL_AUTH}/api/v1`,
  timeout: Number(process.env.REACT_APP_TIMEOUT),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

apiAuth.interceptors.request.use(
  (config) => {
    // Rotas públicas novas
    if (
      config.url &&
      (config.url.includes('/auth/login') || config.url.includes('/auth/register'))
    ) {
      return config;
    }

    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        if (userStr.trim().startsWith('{')) {
          const parsedUser = JSON.parse(userStr);
          if (parsedUser.token) {
            config.headers['Authorization'] = `Bearer ${parsedUser.token}`;
          }
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
