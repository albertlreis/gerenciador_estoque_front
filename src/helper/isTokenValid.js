/**
 * Verifica se o token do usuário salvo no localStorage ainda é válido.
 * Exige que o campo `exp` (timestamp UNIX) esteja presente em `user`.
 */
export const isTokenValid = () => {
  const stored = localStorage.getItem('user');
  if (!stored) return false;

  try {
    const user = JSON.parse(stored);

    if (!user?.exp) return !!user?.id;

    const now = Math.floor(Date.now() / 1000);
    return user.exp > now;
  } catch {
    return false;
  }
};
