import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'ui.menuState.v1';

const MenuStateContext = createContext(null);

const getInitialState = () => {
  if (typeof window === 'undefined') {
    return {
      isSidebarCollapsed: false,
      expandedKeys: {},
      lastActivePath: '',
      hasStoredState: false,
    };
  }

  try {
    const storedRaw = window.localStorage.getItem(STORAGE_KEY);
    if (!storedRaw) {
      return {
        isSidebarCollapsed: false,
        expandedKeys: {},
        lastActivePath: '',
        hasStoredState: false,
      };
    }

    const stored = JSON.parse(storedRaw);
    return {
      isSidebarCollapsed: !!stored.isSidebarCollapsed,
      expandedKeys: stored.expandedKeys && typeof stored.expandedKeys === 'object' ? stored.expandedKeys : {},
      lastActivePath: typeof stored.lastActivePath === 'string' ? stored.lastActivePath : '',
      hasStoredState: true,
    };
  } catch {
    return {
      isSidebarCollapsed: false,
      expandedKeys: {},
      lastActivePath: '',
      hasStoredState: false,
    };
  }
};

export const MenuStateProvider = ({ children }) => {
  const initialState = useMemo(getInitialState, []);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(initialState.isSidebarCollapsed);
  const [expandedKeys, setExpandedKeys] = useState(initialState.expandedKeys);
  const [lastActivePath, setLastActivePath] = useState(initialState.lastActivePath);
  const [hasStoredState] = useState(initialState.hasStoredState);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const payload = {
      isSidebarCollapsed: !!isSidebarCollapsed,
      expandedKeys,
      lastActivePath: lastActivePath || '',
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [expandedKeys, isSidebarCollapsed, lastActivePath]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((prev) => !prev);
  }, []);

  const value = useMemo(() => ({
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    toggleSidebar,
    expandedKeys,
    setExpandedKeys,
    lastActivePath,
    setLastActivePath,
    hasStoredState,
  }), [
    isSidebarCollapsed,
    toggleSidebar,
    expandedKeys,
    lastActivePath,
    hasStoredState,
  ]);

  return (
    <MenuStateContext.Provider value={value}>
      {children}
    </MenuStateContext.Provider>
  );
};

export const useMenuState = () => {
  const context = useContext(MenuStateContext);
  if (!context) {
    throw new Error('useMenuState deve ser usado dentro de MenuStateProvider');
  }
  return context;
};
