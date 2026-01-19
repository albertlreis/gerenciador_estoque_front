import axios from 'axios';
import apiAuth from './apiAuth';

const apiEstoque = axios.create({
  baseURL: `${process.env.REACT_APP_BASE_URL_ESTOQUE}/api/v1`,
  timeout: Number(process.env.REACT_APP_TIMEOUT),
  headers: { 'Accept': 'application/json' },
});

function getUser() {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

function setUserToken(token) {
  const u = getUser() || {};
  u.token = token;
  localStorage.setItem('user', JSON.stringify(u));
}

function logoutToLogin() {
  localStorage.removeItem('user');
  window.location.href = '/login';
}

// =========================
// Refresh control (anti storm)
// =========================
let isRefreshing = false;
let refreshQueue = [];

function enqueueRefresh(cb) {
  refreshQueue.push(cb);
}

function resolveQueue(newToken) {
  refreshQueue.forEach((cb) => cb(newToken));
  refreshQueue = [];
}

async function refreshAccessToken() {
  // Chama API Auth (cookie refresh vai junto por withCredentials do apiAuth)
  const { data } = await apiAuth.post('/auth/refresh');
  // Backend pode devolver {access_token} ou {access_token: "..."}
  const token = data?.access_token || data?.accessToken || null;
  if (!token) throw new Error('Refresh não retornou access_token');
  setUserToken(token);
  return token;
}

// Interceptor de requisição
apiEstoque.interceptors.request.use(
  (config) => {
    const user = getUser();
    if (user?.token) {
      config.headers['Authorization'] = `Bearer ${user.token}`;
    }

    // Recomendo remover isso (o servidor não deve confiar no client p/ permissões)
    // if (user?.permissoes) config.headers['X-Permissoes'] = JSON.stringify(user.permissoes);

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de resposta (401 -> refresh -> retry)
apiEstoque.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const original = error.config;

    // Se não for 401, segue fluxo normal
    if (status !== 401) return Promise.reject(error);

    // Evita loop infinito
    if (original?._retry) return Promise.reject(error);
    original._retry = true;

    // Se já está na tela de login, não tenta refresh
    if (window.location.pathname === '/login') {
      return Promise.reject(error);
    }

    // Se não tem usuário salvo, não tenta refresh
    if (!localStorage.getItem('user')) {
      logoutToLogin();
      return Promise.reject(error);
    }

    // Se já tem refresh em andamento, enfileira a request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        enqueueRefresh((newToken) => {
          if (!newToken) return reject(error);
          original.headers['Authorization'] = `Bearer ${newToken}`;
          resolve(apiEstoque(original));
        });
      });
    }

    // Faz refresh
    isRefreshing = true;
    try {
      const newToken = await refreshAccessToken();
      resolveQueue(newToken);

      // retry da request original
      original.headers['Authorization'] = `Bearer ${newToken}`;
      return apiEstoque(original);
    } catch (e) {
      resolveQueue(null);
      logoutToLogin();
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiEstoque;
