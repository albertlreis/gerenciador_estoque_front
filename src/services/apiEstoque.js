import axios from 'axios';

const apiEstoque = axios.create({
  baseURL: `${process.env.REACT_APP_BASE_URL_ESTOQUE}/api/v1`,
  timeout: Number(process.env.REACT_APP_TIMEOUT),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para incluir token
apiEstoque.interceptors.request.use(
  (config) => {
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

// Interceptor de resposta para lidar com 401
apiEstoque.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLoginPage = window.location.pathname === '/login';
      const hasUser = !!localStorage.getItem('user');

      if (!isLoginPage && hasUser) {
        localStorage.removeItem('user');
        // Em vez de redirecionar aqui diretamente, delegue à lógica do roteador
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);


export default apiEstoque;
