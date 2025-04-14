export const isTokenValid = () => {
  const storedUser = localStorage.getItem('user');
  if (!storedUser) return false;
  try {
    const user = JSON.parse(storedUser);
    return user.expiresAt && new Date().getTime() < user.expiresAt;
  } catch (error) {
    console.error('Erro ao verificar o token:', error);
    return false;
  }
};
