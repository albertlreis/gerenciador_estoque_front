/**
 * Verifica se o token salvo no localStorage ainda está dentro da validade.
 * Aceita:
 * - user.exp (timestamp UNIX em segundos)
 * - user.expiresAt (timestamp em ms)
 */
export const isTokenValid = () => {
  const stored = localStorage.getItem('user');
  if (!stored) return false;

  try {
    const user = JSON.parse(stored);

    // Sem token, não tem sessão
    if (!user?.token) return false;

    // Preferência: exp (segundos)
    if (typeof user.exp === 'number' && user.exp > 0) {
      const now = Math.floor(Date.now() / 1000);
      return user.exp > now;
    }

    // Compat: expiresAt (ms)
    if (typeof user.expiresAt === 'number' && user.expiresAt > 0) {
      return user.expiresAt > Date.now();
    }

    // Se não tem expiração, considera inválido (com access curto isso evita “falso logado”)
    return false;
  } catch {
    return false;
  }
};
