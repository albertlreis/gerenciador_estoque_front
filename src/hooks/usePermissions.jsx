import { useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Hook para verificar permissões do usuário autenticado.
 * Retorna funções utilitárias: has (any), hasAll (all) e list (todas).
 */
const usePermissions = () => {
  const { user } = useAuth();

  const currentList = useMemo(
    () => (Array.isArray(user?.permissoes) ? user.permissoes : []),
    [user?.permissoes]
  );

  const set = useMemo(() => new Set(currentList), [currentList]);

  const has = useCallback(
    (permissoes) => {
      if (!set.size || !permissoes) return false;
      const lista = Array.isArray(permissoes) ? permissoes : [permissoes];
      return lista.some((perm) => !!perm && set.has(perm));
    },
    [set]
  );

  const hasAll = useCallback(
    (permissoes) => {
      if (!set.size || !permissoes) return false;
      const lista = Array.isArray(permissoes) ? permissoes : [permissoes];
      return lista.every((perm) => !!perm && set.has(perm));
    },
    [set]
  );

  const list = useCallback(() => currentList, [currentList]);

  return useMemo(() => ({ has, hasAll, list }), [has, hasAll, list]);
};

export default usePermissions;
