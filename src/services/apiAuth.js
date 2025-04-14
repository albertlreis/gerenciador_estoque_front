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
    // Se a URL for da rota de login (ou outras rotas livres), ignora a injeção do token.
    if (config.url && (config.url.includes('/login') || config.url.includes('/register'))) {
      return config;
    }

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


export default apiAuth;
