import React, { useState, useEffect, useRef } from 'react';
import { PanelMenu } from 'primereact/panelmenu';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import usePermissions from '../hooks/usePermissions';
import Topbar from './Topbar';
import menuItems from '../utils/menuItems';

/**
 * Layout principal da aplicacao com menu lateral e topbar.
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

  const sidebarItems = menuItems(has);

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
              userHasToggled.current = true;
              setExpandedKeys(e.value);
            }}
            multiple
            template={(item, options) => {
              const hasSubmenu = Array.isArray(item.items) && item.items.length > 0;
              const isExternalUrl = typeof item.url === 'string' && /^https?:\/\//i.test(item.url);
              const href = item.url || item.to || '#';
              const target = item.target || (isExternalUrl ? '_blank' : undefined);
              const opensInNewTab = target === '_blank';

              if (hasSubmenu) {
                return (
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
                    {options.submenuIcon}
                  </div>
                );
              }

              if (!item.to && !item.url) {
                return (
                  <button
                    type="button"
                    onClick={options.onClick}
                    onKeyDown={options.onKeyDown}
                    tabIndex={options.tabIndex}
                    className={options.className}
                    title={isSidebarCollapsed ? item.label : undefined}
                    style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      width: '100%',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    {item.icon && <i className={`${item.icon} p-menuitem-icon`} />}
                    <span className="p-menuitem-text">{item.label}</span>
                  </button>
                );
              }

              const handleLinkClick = (event) => {
                if (!item.to || opensInNewTab || isExternalUrl) return;

                const hasModifierKey = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
                const isPrimaryClick = event.button === 0;

                if (!isPrimaryClick || hasModifierKey) return;

                // Mantem o ciclo interno do PanelMenu (estado ativo/expandido)
                options.onClick?.(event);
                event.preventDefault();
                navigate(item.to);
              };

              return (
                <a
                  href={href}
                  target={target}
                  rel={opensInNewTab ? 'noopener noreferrer' : undefined}
                  onClick={handleLinkClick}
                  onKeyDown={options.onKeyDown}
                  tabIndex={options.tabIndex}
                  className={options.className}
                  title={isSidebarCollapsed ? item.label : undefined}
                  style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
                >
                  {item.icon && <i className={`${item.icon} p-menuitem-icon`} />}
                  <span className="p-menuitem-text">{item.label}</span>
                </a>
              );
            }}
          />
        </div>
        <div className="layout-content">{children}</div>
      </div>
    </div>
  );
};

export default SakaiLayout;
