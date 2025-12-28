import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import usePermissions from '../../hooks/usePermissions';
import { PERMISSOES } from '../../constants/permissoes';

export default function AcessosIndex() {
  const navigate = useNavigate();
  const { has } = usePermissions();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;

    if (has(PERMISSOES.USUARIOS?.VISUALIZAR)) return navigate('/acessos/usuarios', { replace: true });
    if (has(PERMISSOES.PERFIS?.VISUALIZAR)) return navigate('/acessos/perfis', { replace: true });
    if (has(PERMISSOES.PERMISSOES?.VISUALIZAR)) return navigate('/acessos/permissoes', { replace: true });

    navigate('/acesso-negado', { replace: true });
  }, [has, navigate]);

  return null;
}
