import React from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Exibe o conteúdo apenas se o usuário tiver a permissão requerida.
 *
 * @param {string|string[]} permissoes - Permissão única ou lista de permissões exigidas
 * @param {ReactNode} children - Conteúdo protegido
 * @param {boolean} all - Se verdadeiro, exige todas as permissões (AND); senão, apenas uma (OR)
 */
const PermissaoGuard = ({ permissoes, children, all = false }) => {
  const { hasPermission } = useAuth();

  if (!permissoes) return null;

  const required = Array.isArray(permissoes) ? permissoes : [permissoes];
  const autorizado = all
    ? required.every((p) => hasPermission(p))
    : required.some((p) => hasPermission(p));

  return autorizado ? <>{children}</> : null;
};

export default PermissaoGuard;
