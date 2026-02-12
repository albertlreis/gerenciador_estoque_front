export const normalizarBuscaProduto = (value) => {
  if (value === null || value === undefined) return undefined;

  const normalizado = String(value).trim();
  return normalizado === '' ? undefined : normalizado;
};

export const aplicarNormalizacaoBuscaProduto = (
  params = {},
  campos = ['q', 'search', 'nome', 'referencia', 'produto']
) => {
  const normalizados = { ...params };

  campos.forEach((campo) => {
    if (!(campo in normalizados)) return;

    const valorNormalizado = normalizarBuscaProduto(normalizados[campo]);
    if (valorNormalizado === undefined) {
      delete normalizados[campo];
      return;
    }

    normalizados[campo] = valorNormalizado;
  });

  return normalizados;
};
