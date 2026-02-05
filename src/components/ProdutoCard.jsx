import React, { useMemo } from 'react';
import { Tag } from 'primereact/tag';
import formatarPreco from '../utils/formatarPreco';

const ProdutoCard = ({ grupo, onDetalhes, onAdicionar }) => {
  const primeira = grupo?.variacoes?.[0];
  const preco = Number(primeira?.preco || 0);

  const precoRender = useMemo(() => {
    const outletsValidos = Array.isArray(primeira?.outlets)
      ? primeira.outlets.filter((o) => (o.quantidade_restante || 0) > 0)
      : [];
    if (!grupo?.is_outlet || outletsValidos.length === 0) {
      return <span>{formatarPreco(preco)}</span>;
    }
    const melhorOutlet = outletsValidos.reduce((menor, atual) =>
      (atual.percentual_desconto || 0) > (menor.percentual_desconto || 0) ? atual : menor
    );
    const precoOutlet = preco * (1 - (melhorOutlet.percentual_desconto || 0) / 100);
    return (
      <>
        <span style={{ textDecoration: 'line-through', color: '#999', marginRight: '0.5rem' }}>
          {formatarPreco(preco)}
        </span>
        <span style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>
          {formatarPreco(precoOutlet)}
        </span>
        <span style={{ fontWeight: 'bold' }}>(-{melhorOutlet.percentual_desconto}%)</span>
      </>
    );
  }, [primeira, grupo?.is_outlet, preco]);

  return (
    <div
      className="p-3 border-1 surface-border border-round surface-card shadow-1 relative h-full flex flex-column justify-between"
      style={{ minHeight: '390px' }}
    >
      {grupo?.is_outlet && (
        <div className="absolute top-0 right-0 p-1 bg-orange-500 text-white text-xs font-bold z-2 border-round-right">
          OUTLET
        </div>
      )}

      <img
        src={
          grupo?.imagem_principal
            ? grupo.imagem_principal
            : 'https://placehold.co/500x300?text=Sem+Imagem'
        }
        alt={grupo?.produto?.nome}
        className="w-full mb-2 border-round"
        style={{ height: '180px', objectFit: 'cover' }}
      />

      <div className="flex-grow-1">
        <h4
          className="mb-2"
          style={{
            fontSize: '1rem',
            lineHeight: '1.2',
            height: '3.6em',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {grupo?.produto?.nome}
        </h4>

        <div className="text-sm mb-1"><strong>Ref.:</strong> {grupo?.referencia || 'N/A'}</div>

        <div className="grid text-xs mb-2">
          <div className="col-4"><strong>Alt:</strong> {grupo?.produto?.altura ?? '-'}</div>
          <div className="col-4"><strong>Larg:</strong> {grupo?.produto?.largura ?? '-'}</div>
          <div className="col-4"><strong>Prof:</strong> {grupo?.produto?.profundidade ?? '-'}</div>
        </div>

        {primeira && (
          <>
            <div className="mb-2 text-sm">
              <strong>Preço:</strong> {precoRender}
            </div>

            <div className="mb-3 text-sm">
              <p className="m-0">
                <strong>Estoque:</strong>{' '}
                <Tag value={`${grupo?.estoque_total} un.`} severity={grupo?.estoque_total > 0 ? 'success' : 'danger'} />
              </p>
            </div>

            <div className="mb-3 text-xs text-600" title={grupo?.depositos_tooltip || ''}>
              {grupo?.estoque_total > 0 ? (grupo?.depositos_resumo || 'Disponivel em: —') : 'Sem estoque'}
            </div>
          </>
        )}
      </div>

      <div className="flex justify-content-between mt-auto">
        <button className="p-button p-button-sm p-button-outlined" onClick={onDetalhes}>
          Detalhes
        </button>
        <button className="p-button p-button-sm p-button-success" onClick={onAdicionar}>
          Adicionar
        </button>
      </div>
    </div>
  );
};

export default ProdutoCard;
