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
    if (!userHasToggled.current) {
      if (
        location.pathname.startsWith('/usuarios') ||
        location.pathname.startsWith('/perfis') ||
        location.pathname.startsWith('/permissoes')
      ) {
        setExpandedKeys({ administracao: true });
      } else if (
        location.pathname.startsWith('/catalogo') ||
        location.pathname.startsWith('/produtos-outlet') ||
        location.pathname.startsWith('/configuracao-outlet')
      ) {
        setExpandedKeys({ produtos: true });
      } else if (location.pathname.startsWith('/pedidos')) {
        setExpandedKeys({ vendas: true });
      } else {
        setExpandedKeys({});
      }
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
      <Topbar onToggleMenu={toggleSidebar} usuario={user} onLogout={handleLogout}/>
      <div className="layout-container">
        <div
          className={`layout-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}
        >
          <PanelMenu
            model={sidebarItems}
            style={{width: '100%'}}
            expandedKeys={expandedKeys}
            onExpandedKeysChange={(e) => {
              userHasToggled.current = true;
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
                style={{ position: 'relative' }}
              >
                {item.icon && <i className={`${item.icon} p-menuitem-icon`} />}
                <span className="p-menuitem-text">{item.label}</span>
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
