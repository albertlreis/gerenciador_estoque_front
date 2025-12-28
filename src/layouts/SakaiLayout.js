import React, { useState, useEffect, useRef } from 'react';
import { PanelMenu } from 'primereact/panelmenu';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import usePermissions from '../hooks/usePermissions';
import Topbar from './Topbar';
import menuItems from '../utils/menuItems';

/**
 * Layout principal da aplicação com menu lateral e topbar.
 */
const SakaiLayout = ({ children, defaultSidebarCollapsed = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { has } = usePermissions();

  const [expandedKeys, setExpandedKeys] = useState({});
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(defaultSidebarCollapsed);

  const userHasToggled = useRef(false);

  useEffect(() => {
    if (userHasToggled.current) return;

    const path = location.pathname;

    if (
      path.startsWith('/acessos') ||
      path.startsWith('/usuarios') ||
      path.startsWith('/perfis') ||
      path.startsWith('/permissoes') ||
      path.startsWith('/categorias') ||
      path.startsWith('/fornecedores') ||
      path.startsWith('/parceiros')
    ) {
      setExpandedKeys({ administracao: true });
    } else if (
      path.startsWith('/catalogo') ||
      path.startsWith('/produtos')
    ) {
      setExpandedKeys({ produtos: true });
    } else if (
      path.startsWith('/depositos') ||
      path.startsWith('/movimentacoes-estoque') ||
      path.startsWith('/reservas')
    ) {
      setExpandedKeys({ estoque: true });
    } else if (
      path.startsWith('/pedidos') ||
      path.startsWith('/consignacoes') ||
      path.startsWith('/pedidos-fabrica')
    ) {
      setExpandedKeys({ pedidos: true });
    } else {
      setExpandedKeys({});
    }
  }, [location]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const handleLogout = () => {
    logout();
  };

  const sidebarItems = menuItems(navigate, has);

  return (
    <div
      className={`layout-wrapper ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}
      onMouseEnter={() => {
        if (isSidebarCollapsed) document.body.classList.add('sidebar-hover');
      }}
      onMouseLeave={() => {
        if (isSidebarCollapsed) document.body.classList.remove('sidebar-hover');
      }}
    >
      <Topbar onToggleMenu={toggleSidebar} usuario={user} onLogout={handleLogout} />
      <div className="layout-container">
        <div className={`layout-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
          <PanelMenu
            model={sidebarItems}
            style={{ width: '100%' }}
            expandedKeys={expandedKeys}
            onExpandedKeysChange={(e) => {
              userHasToggled.current = true; // a partir daqui, não auto-reexpande
              setExpandedKeys(e.value);
            }}
            multiple
            template={(item, options) => (
              <div
                onClick={options.onClick}
                onKeyDown={options.onKeyDown}
                tabIndex={options.tabIndex}
                className={options.className}
                title={isSidebarCollapsed ? item.label : undefined}
                style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                {item.icon && <i className={`${item.icon} p-menuitem-icon`} />}
                <span className="p-menuitem-text">{item.label}</span>
                {/* Exibe o caret quando há submenu, melhora a UX de expansão */}
                {options.submenuIcon}
              </div>
            )}
          />
        </div>
        <div className="layout-content">{children}</div>
      </div>
    </div>
  );
};

export default SakaiLayout;
