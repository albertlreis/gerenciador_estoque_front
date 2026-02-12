const normalizePath = (value) => {
  if (!value || typeof value !== 'string') return null;
  const withoutQuery = value.split('?')[0];
  const cleaned = withoutQuery.replace(/\/+$/, '');
  return cleaned || '/';
};

export const isRouteMatch = (itemPath, pathname) => {
  const menuPath = normalizePath(itemPath);
  const currentPath = normalizePath(pathname);

  if (!menuPath || !currentPath) return false;
  if (menuPath === '/') return currentPath === '/';

  return currentPath === menuPath || currentPath.startsWith(`${menuPath}/`);
};

export const findMenuPathByRoute = (items, pathname, parentKeys = []) => {
  for (const item of items || []) {
    if (!item || !item.key) continue;
    const nextPath = [...parentKeys, item.key];

    if (item.to && isRouteMatch(item.to, pathname)) {
      return nextPath;
    }

    if (Array.isArray(item.items) && item.items.length > 0) {
      const nestedPath = findMenuPathByRoute(item.items, pathname, nextPath);
      if (nestedPath.length > 0) {
        return nestedPath;
      }
    }
  }

  return [];
};

export const mergeExpandedKeys = (currentExpandedKeys, keysToExpand) => {
  if (!Array.isArray(keysToExpand) || keysToExpand.length === 0) {
    return currentExpandedKeys || {};
  }

  const merged = { ...(currentExpandedKeys || {}) };
  keysToExpand.forEach((key) => {
    if (key) merged[key] = true;
  });
  return merged;
};

export const hasActiveRoute = (item, pathname) => {
  if (!item) return false;

  if (item.to && isRouteMatch(item.to, pathname)) {
    return true;
  }

  if (!Array.isArray(item.items) || item.items.length === 0) {
    return false;
  }

  return item.items.some((child) => hasActiveRoute(child, pathname));
};
