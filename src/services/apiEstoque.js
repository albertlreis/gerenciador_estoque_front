import axios from 'axios';

const apiEstoque = axios.create({
  baseURL: 'http://localhost:8001/api/v1/', // URL da API de gerenciamento de estoque (ajuste conforme necessário)
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000, // Timeout de 10 segundos
});

// Caso a API de estoque também exija autenticação, podemos usar um interceptor similar:
apiEstoque.interceptors.request.use(
  config => {
    // Se houver um token específico para estoque ou usar o mesmo token da autenticação:
    const user = localStorage.getItem('user');
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
