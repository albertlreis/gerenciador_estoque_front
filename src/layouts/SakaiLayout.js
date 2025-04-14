import React from 'react';
import {Menubar} from 'primereact/menubar';
import {PanelMenu} from 'primereact/panelmenu';
import {useNavigate} from 'react-router-dom';

const SakaiLayout = ({children}) => {
  const navigate = useNavigate();

  // Itens do cabeçalho (Menubar)
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

  // Itens da sidebar (PanelMenu) atualizados com as rotas definidas e ícones relacionados
  const sidebarItems = [
    {
      label: 'Acesso',
      icon: 'pi pi-fw pi-briefcase',
      items: [
        {
          label: 'Usuários',
          icon: 'pi pi-fw pi-users',
          command: () => navigate('/usuarios')
        },
        {
          label: 'Perfis',
          icon: 'pi pi-fw pi-id-card',
          command: () => navigate('/perfis')
        },
        {
          label: 'Permissões',
          icon: 'pi pi-fw pi-lock',
          command: () => navigate('/permissoes')
        },
      ]
    },
    {
      label: 'Clientes',
      icon: 'pi pi-fw pi-user',
      command: () => navigate('/clientes')
    },
    {
      label: 'Categorias',
      icon: 'pi pi-fw pi-book',
      command: () => navigate('/categorias')
    },
    {
      label: 'Produtos',
      icon: 'pi pi-fw pi-tags',
      command: () => navigate('/produtos')
    },
    // {
    //   label: 'Variações',
    //   icon: 'pi pi-fw pi-clone',
    //   command: () => navigate('/produto-variacoes')
    // },
    {
      label: 'Pedidos',
      icon: 'pi pi-fw pi-shopping-cart',
      command: () => navigate('/pedidos')
    }
  ];

  return (
    <div className="layout-wrapper">
      <div className="layout-header">
        <Menubar model={menubarItems}/>
      </div>
      <div className="layout-container">
        <div className="layout-sidebar">
          <PanelMenu model={sidebarItems} style={{width: '300px'}}/>
        </div>
        <div className="layout-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SakaiLayout;
