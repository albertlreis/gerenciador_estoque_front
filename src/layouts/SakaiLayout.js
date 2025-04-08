import React from 'react';
import { Menubar } from 'primereact/menubar';
import { PanelMenu } from 'primereact/panelmenu';
import { useNavigate } from 'react-router-dom';

const SakaiLayout = ({ children }) => {
  const navigate = useNavigate();

  // Exemplo de itens do Menubar (cabeçalho)
  const menubarItems = [
    {
      label: 'Dashboard',
      icon: 'pi pi-fw pi-home',
      command: () => navigate('/')
    },
    {
      label: 'Sair',
      icon: 'pi pi-fw pi-sign-out',
      command: () => {
        localStorage.removeItem('user');
        navigate('/login');
      }
    }
  ];

  // Exemplo de itens do PanelMenu (sidebar)
  const sidebarItems = [
    {
      label: 'Gerenciamento',
      icon: 'pi pi-fw pi-briefcase',
      items: [
        {
          label: 'Usuários',
          icon: 'pi pi-fw pi-users',
          command: () => navigate('/usuarios')
        },
        {
          label: 'Categorias',
          icon: 'pi pi-fw pi-box',
          command: () => navigate('/categorias')
        },
        {
          label: 'Produtos',
          icon: 'pi pi-fw pi-box',
          command: () => navigate('/produtos')
        },
        {
          label: 'Cientes',
          icon: 'pi pi-fw pi-box',
          command: () => navigate('/clientes')
        },
        {
          label: 'Pedidos',
          icon: 'pi pi-fw pi-box',
          command: () => navigate('/pedidos')
        }
      ]
    }
  ];

  return (
    <div className="layout-wrapper">
      <div className="layout-header">
        <Menubar model={menubarItems} />
      </div>
      <div className="layout-container">
        <div className="layout-sidebar">
          <PanelMenu model={sidebarItems} style={{ width: '300px' }} />
        </div>
        <div className="layout-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SakaiLayout;
