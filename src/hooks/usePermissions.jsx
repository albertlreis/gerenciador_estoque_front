import { useAuth } from '../context/AuthContext';

/**
 * Hook para verificar permissões do usuário autenticado.
 * Retorna funções utilitárias para trabalhar com permissões.
 */
const usePermissions = () => {
  const { user } = useAuth();

  /**
   * Verifica se o usuário possui uma ou mais permissões.
   * @param {string|string[]} permissoes
   * @returns {boolean}
   */
  const has = (permissoes) => {
    if (!user?.permissoes) return false;
    const lista = Array.isArray(permissoes) ? permissoes : [permissoes];
    return lista.some((perm) => user.permissoes.includes(perm));
  };

  return { has };
};

export default usePermissions;
