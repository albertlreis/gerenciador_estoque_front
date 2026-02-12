export const buildOutletExportIds = (selected = []) => {
  const lista = Array.isArray(selected) ? selected : [];
  const ids = lista
    .map((item) => item?.id)
    .filter((id) => id !== null && id !== undefined);

  return Array.from(new Set(ids));
};
