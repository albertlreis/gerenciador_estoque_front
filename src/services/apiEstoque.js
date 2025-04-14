import axios from 'axios';

const apiEstoque = axios.create({
  baseURL: `${process.env.REACT_APP_BASE_URL_ESTOQUE}/api/v1`,
  timeout: Number(process.env.REACT_APP_TIMEOUT),
  headers: {
    'Content-Type': 'application/json'
  },

});

// Interceptor para adicionar o token à requisição
apiEstoque.interceptors.request.use(
  (config) => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        // Tenta fazer o parse apenas se houver um valor e que comece com "{" (indicando JSON)
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

export default apiEstoque;
