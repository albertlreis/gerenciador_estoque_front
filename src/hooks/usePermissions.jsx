import { useAuth } from '../context/AuthContext';

/**
 * Hook para verificar permissões do usuário autenticado.
 * Retorna funções utilitárias: has (any), hasAll (all) e list (todas).
 */
const usePermissions = () => {
  const { user } = useAuth();

  const currentList = Array.isArray(user?.permissoes) ? user.permissoes : [];
  const set = new Set(currentList);

  /**
   * Verifica se possui AO MENOS uma das permissões informadas.
   * @param {string|string[]} permissoes
   * @returns {boolean}
   */
  const has = (permissoes) => {
    if (!set.size || !permissoes) return false;
    const lista = Array.isArray(permissoes) ? permissoes : [permissoes];
    return lista.some((perm) => !!perm && set.has(perm));
  };

  /**
   * Verifica se possui TODAS as permissões informadas.
   * @param {string|string[]} permissoes
   * @returns {boolean}
   */
  const hasAll = (permissoes) => {
    if (!set.size || !permissoes) return false;
    const lista = Array.isArray(permissoes) ? permissoes : [permissoes];
    return lista.every((perm) => !!perm && set.has(perm));
  };

  /**
   * Lista atual de permissões do usuário.
   * @returns {string[]}
   */
  const list = () => currentList;

  return { has, hasAll, list };
};

export default usePermissions;
