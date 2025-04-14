import axios from 'axios';

const apiEstoque = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL_ESTOQUE,
  timeout: Number(process.env.REACT_APP_TIMEOUT),
  headers: {
    'Content-Type': 'application/json'
  },

});

// Interceptor para adicionar o token à requisição
apiEstoque.interceptors.request.use(
  config => {
    const user = localStorage.getItem('token');
    if (user) {
      const { token } = JSON.parse(user);
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  error => Promise.reject(error)
);

export default apiEstoque;
