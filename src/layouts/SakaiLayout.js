import React, { useState, useEffect } from 'react';
import { Menubar } from 'primereact/menubar';
import { PanelMenu } from 'primereact/panelmenu';
import { useNavigate, useLocation } from 'react-router-dom';
import apiAuth from '../services/apiAuth';

const SakaiLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedKeys, setExpandedKeys] = useState({});

  // Atualiza os itens expandidos com base na rota atual
  useEffect(() => {
    if (
      location.pathname.startsWith('/usuarios') ||
      location.pathname.startsWith('/perfis') ||
      location.pathname.startsWith('/permissoes')
    ) {
      setExpandedKeys({ acesso: true });
    } else {
      setExpandedKeys({});
    }
  }, [location]);

  // Função para realizar logout: chama o endpoint de logout (caso disponível),
  // limpa os dados do usuário e redireciona para a página de login.
  const handleLogout = async () => {
    try {
      // Tenta revogar o token no servidor.
      await apiAuth.post('/logout');
      window.location.reload();
    } catch (error) {
      navigate('/login');
    } finally {
      // Limpa os dados do usuário no localStorage.
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

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
      command: handleLogout
    }
  ];

  // Itens da sidebar (PanelMenu)
  const sidebarItems = [
    {
      label: 'Acesso',
      key: 'acesso',
      icon: 'pi pi-fw pi-briefcase',
      items: [
        {
          label: 'Usuários',
          key: 'acesso-usuarios',
          icon: 'pi pi-fw pi-users',
          command: () => navigate('/usuarios')
        },
        {
          label: 'Perfis',
          key: 'acesso-perfis',
          icon: 'pi pi-fw pi-id-card',
          command: () => navigate('/perfis')
        },
        {
          label: 'Permissões',
          key: 'acesso-permissoes',
          icon: 'pi pi-fw pi-lock',
          command: () => navigate('/permissoes')
        }
      ]
    },
    {
      label: 'Clientes',
      key: 'clientes',
      icon: 'pi pi-fw pi-user',
      command: () => navigate('/clientes')
    },
    {
      label: 'Categorias',
      key: 'categorias',
      icon: 'pi pi-fw pi-book',
      command: () => navigate('/categorias')
    },
    {
      label: 'Produtos',
      key: 'produtos',
      icon: 'pi pi-fw pi-tags',
      command: () => navigate('/produtos')
    },
    {
      label: 'Pedidos',
      key: 'pedidos',
      icon: 'pi pi-fw pi-shopping-cart',
      command: () => navigate('/pedidos')
    }
  ];

  return (
    <div className="layout-wrapper">
      <div className="layout-header">
        <Menubar model={menubarItems} />
      </div>
      <div className="layout-container">
        <div className="layout-sidebar">
          <PanelMenu
            model={sidebarItems}
            style={{ width: '300px' }}
            expandedKeys={expandedKeys}
            onToggle={(e) => setExpandedKeys(e.value)}
          />
        </div>
        <div className="layout-content">{children}</div>
      </div>
    </div>
  );
};

export default SakaiLayout;
