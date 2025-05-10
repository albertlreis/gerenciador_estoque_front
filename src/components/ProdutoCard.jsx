import React from 'react';
import { Tag } from 'primereact/tag';

const ProdutoCard = ({ produto, onDetalhes, onAdicionar }) => {
  const variacao = produto.variacoes?.[0];
  const preco = Number(variacao?.preco || 0);
  const promocional = Number(variacao?.preco_promocional || 0);
  const temDesconto = promocional > 0 && promocional < preco;
  const percentual = temDesconto ? Math.round(((preco - promocional) / preco) * 100) : 0;
  const quantidade = variacao?.estoque?.quantidade ?? 0;

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
        src={produto.imagens?.[0]?.url
          ? `${process.env.REACT_APP_BASE_URL_ESTOQUE}/${process.env.REACT_APP_PRODUCT_IMAGES_FOLDER}/${produto.imagens[0].url}`
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
              {temDesconto ? (
                <>
                  <span style={{ textDecoration: 'line-through', color: '#999', marginRight: '0.5rem' }}>
                    R$ {preco.toFixed(2)}
                  </span>
                  <span style={{ fontWeight: 'bold', color: '#0f9d58', marginRight: '0.5rem' }}>
                    R$ {promocional.toFixed(2)}
                  </span>
                  <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>
                    (-{percentual}%)
                  </span>
                </>
              ) : (
                <span>R$ {preco.toFixed(2)}</span>
              )}
            </div>

            <div className="mb-3 text-sm">
              <strong>Estoque:</strong>{' '}
              <Tag
                value={`${quantidade} un.`}
                severity={quantidade > 0 ? 'success' : 'danger'}
              />
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
