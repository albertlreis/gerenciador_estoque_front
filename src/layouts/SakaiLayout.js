import React, { useState, useEffect, useRef } from 'react';
import { PanelMenu } from 'primereact/panelmenu';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Topbar from './Topbar';
import menuItems from '../utils/menuItems';
import './SakaiLayout.css';

const SakaiLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, hasPermission, logout } = useAuth();

  const [expandedKeys, setExpandedKeys] = useState({});
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const userHasToggled = useRef(false);

  useEffect(() => {
    if (!userHasToggled.current) {
      if (location.pathname.startsWith('/usuarios') || location.pathname.startsWith('/perfis') || location.pathname.startsWith('/permissoes')) {
        setExpandedKeys({ acesso: true });
      } else if (location.pathname.startsWith('/catalogo') || location.pathname.startsWith('/produtos-outlet') || location.pathname.startsWith('/configuracao-outlet')) {
        setExpandedKeys({ produtos: true });
      } else {
        setExpandedKeys({});
      }
    }
  }, [location]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const handleLogout = () => {
    logout(); // useAuth deve cuidar de limpar o token e redirecionar
    navigate('/login');
  };

  const sidebarItems = menuItems(navigate, hasPermission);

  return (
    <div className="layout-wrapper">
      <Topbar onToggleMenu={toggleSidebar} usuario={user} onLogout={handleLogout} />
      <div className="layout-container">
        <div
          className={`layout-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}
          style={{ width: isSidebarCollapsed ? '80px' : '300px' }}
        >
          <PanelMenu
            model={sidebarItems}
            style={{ width: '100%' }}
            expandedKeys={expandedKeys}
            onExpandedKeysChange={(e) => {
              userHasToggled.current = true;
              setExpandedKeys(e.value);
            }}
            multiple
          />
        </div>
        <div className="layout-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SakaiLayout;
