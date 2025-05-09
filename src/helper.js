export function isTokenValid() {
  const userStr = localStorage.getItem('user');
  if (!userStr) return false;

  try {
    const user = JSON.parse(userStr);

    // Verifica existência e validade do token e tempo de expiração
    if (
      typeof user.token !== 'string' ||
      typeof user.expiresAt !== 'number' ||
      new Date().getTime() >= user.expiresAt
    ) {
      return false;
    }

    return true;
  } catch (err) {
    console.error('Erro ao validar token:', err);
    return false;
  }
}
