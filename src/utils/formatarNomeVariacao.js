export const formatarNomeVariacao = (produto, variacao) => {
  if (!produto || !variacao) return '';

  const nomeProduto = (produto.nome || '').toUpperCase();
  const partes = [];

  // Atributos únicos
  const atributos = new Map();
  (variacao.atributos || []).forEach(attr => {
    const chave = attr.atributo?.toUpperCase();
    if (chave && !atributos.has(chave)) {
      atributos.set(chave, attr.valor?.toUpperCase());
    }
  });

  atributos.forEach((valor, chave) => {
    partes.push(`* ${chave}: ${valor}`);
  });

  // SKU ou código
  if (variacao.sku) partes.push(`* SKU: ${variacao.sku.toUpperCase()}`);

  // Medidas
  const largura = produto.largura ? parseFloat(produto.largura) : null;
  const profundidade = produto.profundidade ? parseFloat(produto.profundidade) : null;
  const altura = produto.altura ? parseFloat(produto.altura) : null;

  if (largura && profundidade && altura) {
    partes.push(`MED: ${largura} X ${profundidade} X ${altura} CM`);
  }

  return `${nomeProduto} ${partes.join(' ')}`;
};
