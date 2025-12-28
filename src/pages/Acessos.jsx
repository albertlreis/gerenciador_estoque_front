import React, { useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { TabMenu } from 'primereact/tabmenu';
import SakaiLayout from '../layouts/SakaiLayout';
import usePermissions from '../hooks/usePermissions';
import { PERMISSOES } from '../constants/permissoes';

export default function Acessos() {
  const navigate = useNavigate();
  const location = useLocation();
  const { has } = usePermissions();

  const tabs = useMemo(() => {
    const all = [
      { label: 'Usuários', icon: 'pi pi-users', path: '/acessos/usuarios', can: has(PERMISSOES.USUARIOS?.VISUALIZAR) },
      { label: 'Perfis', icon: 'pi pi-id-card', path: '/acessos/perfis', can: has(PERMISSOES.PERFIS?.VISUALIZAR) },
      { label: 'Permissões', icon: 'pi pi-lock', path: '/acessos/permissoes', can: has(PERMISSOES.PERMISSOES?.VISUALIZAR) },
    ];

    return all.filter(t => t.can);
  }, [has]);

  const activeIndex = useMemo(() => {
    const idx = tabs.findIndex(t => location.pathname.startsWith(t.path));
    return idx >= 0 ? idx : 0;
  }, [location.pathname, tabs]);

  return (
    <SakaiLayout>
      <div style={{ margin: '2rem' }}>
        <h2 style={{ marginTop: 0 }}>Administração de Acesso</h2>

        <TabMenu
          model={tabs.map(t => ({
            label: t.label,
            icon: t.icon,
            command: () => navigate(t.path),
          }))}
          activeIndex={activeIndex}
        />

        <div style={{ marginTop: '1rem' }}>
          <Outlet />
        </div>
      </div>
    </SakaiLayout>
  );
}
