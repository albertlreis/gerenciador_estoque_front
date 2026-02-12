import React, { useEffect, useCallback, useMemo } from 'react';
import { PanelMenu } from 'primereact/panelmenu';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMenuState } from '../context/MenuStateContext';
import usePermissions from '../hooks/usePermissions';
import Topbar from './Topbar';
import menuItems from '../utils/menuItems';
import { findMenuPathByRoute, hasActiveRoute, mergeExpandedKeys } from '../utils/menuState';

/**
 * Layout principal da aplicacao com menu lateral e topbar.
 */
const SakaiLayout = ({ children, defaultSidebarCollapsed = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { has } = usePermissions();
  const {
    expandedKeys,
    setExpandedKeys,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    toggleSidebar,
    setLastActivePath,
    hasStoredState,
  } = useMenuState();

  useEffect(() => {
    if (!hasStoredState && defaultSidebarCollapsed) {
      setIsSidebarCollapsed(true);
    }
  }, [defaultSidebarCollapsed, hasStoredState, setIsSidebarCollapsed]);

  const menuModel = useMemo(() => menuItems(has), [has]);

  useEffect(() => {
    const menuPath = findMenuPathByRoute(menuModel, location.pathname);
    if (menuPath.length > 1) {
      const parentKeys = menuPath.slice(0, -1);
      setExpandedKeys((current) => mergeExpandedKeys(current, parentKeys));
    }
    setLastActivePath(location.pathname);
  }, [location.pathname, menuModel, setExpandedKeys, setLastActivePath]);

  const handleLogout = () => {
    logout();
  };

  const getItemClassName = useCallback((item, options) => {
    const active = hasActiveRoute(item, location.pathname);
    return `${options.className || ''}${active ? ' menu-item-active' : ''}`;
  }, [location.pathname]);

  const sharedItemTemplate = useCallback((item, options) => {
    const hasSubmenu = Array.isArray(item.items) && item.items.length > 0;
    const isExternalUrl = typeof item.url === 'string' && /^https?:\/\//i.test(item.url);
    const href = item.url || item.to || '#';
    const target = item.target || (isExternalUrl ? '_blank' : undefined);
    const opensInNewTab = target === '_blank';
    const itemClassName = getItemClassName(item, options);

    if (hasSubmenu) {
      return (
        <div
          onClick={options.onClick}
          onKeyDown={options.onKeyDown}
          tabIndex={options.tabIndex}
          className={itemClassName}
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
          className={itemClassName}
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
        className={itemClassName}
        title={isSidebarCollapsed ? item.label : undefined}
        style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
      >
        {item.icon && <i className={`${item.icon} p-menuitem-icon`} />}
        <span className="p-menuitem-text">{item.label}</span>
      </a>
    );
  }, [getItemClassName, isSidebarCollapsed, navigate]);

  const applyTemplate = useCallback((items) => {
    return (items || []).map((it) => {
      const item = { ...it, template: sharedItemTemplate };

      if (Array.isArray(item.items)) {
        item.items = applyTemplate(item.items);
      }

      return item;
    });
  }, [sharedItemTemplate]);

  const sidebarItems = useMemo(() => applyTemplate(menuModel), [applyTemplate, menuModel]);

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
            onExpandedKeysChange={(e) => setExpandedKeys(e.value)}
            multiple
          />
        </div>
        <div className="layout-content">{children}</div>
      </div>
    </div>
  );
};

export default SakaiLayout;
