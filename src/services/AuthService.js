import apiAuth from './apiAuth';

const STORAGE_KEY = 'user';

const AuthService = {
  /**
   * Faz login no sistema.
   * Chama o endpoint de CSRF (Sanctum) antes de enviar as credenciais.
   */
  async login({ email, senha }) {
    try {
      // Garante o cookie CSRF (obrigatório com Sanctum)
      await apiAuth.get('/sanctum/csrf-cookie', { withCredentials: true });

      const response = await apiAuth.post('/login', { email, senha }, { withCredentials: true });

      const { access_token, expires_in, user } = response.data;

      if (!access_token || !user) throw new Error('Token ou usuário ausente');
      if (!user.ativo) throw new Error('Usuário inativo');

      const expiresAt = new Date().getTime() + expires_in * 1000;

      const userData = { token: access_token, expiresAt, ...user };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));

      return userData;
    } catch (err) {
      throw err.response?.data?.message || err.message || 'Erro ao fazer login';
    }
  },

  /**
   * Faz logout do sistema.
   * Limpa localStorage e avisa a API.
   */
  async logout() {
    try {
      await apiAuth.post('/logout', {}, { withCredentials: true });
    } catch (err) {
      console.warn('Erro ao fazer logout na API', err);
    } finally {
      localStorage.removeItem(STORAGE_KEY);
    }
  },

  /**
   * Retorna o usuário autenticado armazenado localmente.
   */
  getUser() {
    const userStr = localStorage.getItem(STORAGE_KEY);
    if (!userStr) return null;

    try {
      const user = JSON.parse(userStr);
      return user;
    } catch {
      return null;
    }
  },

  /**
   * Verifica se o token é válido com base no tempo de expiração.
   */
  isTokenValid() {
    const user = AuthService.getUser();
    if (!user || !user.token || !user.expiresAt) return false;

    return new Date().getTime() < user.expiresAt;
  }
};

export default AuthService;
