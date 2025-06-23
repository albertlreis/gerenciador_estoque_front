import React from 'react';
import { Tag } from 'primereact/tag';
import formatarPreco from '../utils/formatarPreco';

const ProdutoCard = ({ produto, onDetalhes, onAdicionar }) => {
  const variacao = produto.variacoes?.[0];
  const preco = Number(variacao?.preco || 0);

  return (
    <div
      className="p-3 border-1 surface-border border-round surface-card shadow-1 relative h-full flex flex-column justify-between"
      style={{ minHeight: '370px' }}
    >
      {Boolean(produto.is_outlet) && (
        <div className="absolute top-0 right-0 p-1 bg-orange-500 text-white text-xs font-bold z-2 border-round-right">
          OUTLET
        </div>
      )}

      <img
        src={produto.imagem_principal
          ? `${produto.imagem_principal}`
          : 'https://placehold.co/500x300?text=Sem+Imagem'}
        alt={produto.nome}
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
          {produto.nome}
        </h4>

        {variacao && (
          <>
            <div className="mb-1 text-sm">
              <strong>Preço:</strong>{' '}
              {produto.is_outlet && variacao.outlets?.length > 0 ? (() => {
                const outletsValidos = variacao.outlets.filter(o => o.quantidade_restante > 0);
                if (outletsValidos.length === 0) return <span>{formatarPreco(preco)}</span>;

                const melhorOutlet = outletsValidos.reduce((menor, atual) =>
                  atual.percentual_desconto > menor.percentual_desconto ? atual : menor
                );

                const precoOutlet = preco * (1 - melhorOutlet.percentual_desconto / 100);

                return (
                  <>
                    <span style={{textDecoration: 'line-through', color: '#999', marginRight: '0.5rem'}}>
                      {formatarPreco(preco)}
                    </span>
                                <span style={{fontWeight: 'bold', color: '#0f9d58', marginRight: '0.5rem'}}>
                      {formatarPreco(precoOutlet)}
                    </span>
                                <span style={{color: '#d32f2f', fontWeight: 'bold'}}>
                      (-{melhorOutlet.percentual_desconto}%)
                    </span>
                  </>
                );
              })() : (
                <span>{formatarPreco(preco)}</span>
              )}
            </div>

            <div className="mb-3 text-sm">
              <p><strong>Estoque:</strong>{' '}
                <Tag
                  value={`${produto.estoque_total} un.`}
                  severity={produto.estoque_total > 0 ? 'success' : 'danger'}
                />
              </p>

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
