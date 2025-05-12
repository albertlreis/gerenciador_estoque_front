import { useAuth } from '../context/AuthContext';

const ComPermissao = ({ permissoes, children, fallback = null }) => {
  const { hasPermission } = useAuth();
  return hasPermission(permissoes) ? children : fallback;
};

export default ComPermissao;
