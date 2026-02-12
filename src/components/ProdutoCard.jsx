import React, { useMemo } from 'react';
import { Tag } from 'primereact/tag';
import formatarPreco from '../utils/formatarPreco';
import getImageSrc from '../utils/getImageSrc';

const ProdutoCard = ({ grupo, estoqueStatus, onDetalhes, onAdicionar, onEditar }) => {
  const primeira = grupo?.variacoes?.[0];
  const preco = Number(primeira?.preco || 0);

  const resumo = grupo?.estoque_resumo || {};
  const variacoesComEstoque = Number(resumo?.variacoes_com_estoque || 0);
  const variacoesSemEstoque = Number(resumo?.variacoes_sem_estoque || 0);
  const totalDisponivel = Number(resumo?.total_disponivel || 0);

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
      <button
        type="button"
        className="p-button p-button-rounded p-button-text p-button-secondary p-button-sm absolute top-0 left-0 m-1 z-2"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onEditar && onEditar();
        }}
        title="Editar produto"
      >
        <i className="pi pi-pencil" />
      </button>

      {grupo?.is_outlet && (
        <div className="absolute top-0 right-0 p-1 bg-orange-500 text-white text-xs font-bold z-2 border-round-right">
          OUTLET
        </div>
      )}

      <img
        src={
          grupo?.imagem_principal
            ? getImageSrc(grupo.imagem_principal)
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
              <strong>Preco:</strong> {precoRender}
            </div>

            {estoqueStatus === 'sem_estoque' && (
              <div className="mb-3 text-sm">
                <p className="m-0">
                  <strong>Sem estoque:</strong>{' '}
                  <Tag value="0 un." severity="danger" />
                </p>
                <small className="text-600">
                  Variacoes sem estoque: {variacoesSemEstoque}
                </small>
              </div>
            )}

            {estoqueStatus === 'com_estoque' && (
              <div className="mb-3 text-sm">
                <p className="m-0">
                  <strong>Disponivel:</strong>{' '}
                  <Tag value={`${totalDisponivel} un.`} severity="success" />
                </p>
                <small className="text-600">
                  Variacoes em estoque: {variacoesComEstoque}
                </small>
              </div>
            )}

            {!estoqueStatus && (
              <div className="mb-3 text-sm">
                <p className="m-0">
                  <strong>Em estoque:</strong>{' '}
                  <Tag value={String(variacoesComEstoque)} severity={variacoesComEstoque > 0 ? 'success' : 'danger'} />
                  <span className="mx-2">|</span>
                  <strong>Sem estoque:</strong>{' '}
                  <Tag value={String(variacoesSemEstoque)} severity={variacoesSemEstoque > 0 ? 'danger' : 'success'} />
                </p>
              </div>
            )}

            {estoqueStatus !== 'sem_estoque' && (
              <div className="mb-3 text-xs text-600" title={grupo?.depositos_tooltip || ''}>
                {totalDisponivel > 0 ? (grupo?.depositos_resumo || 'Disponivel em: -') : 'Sem estoque'}
              </div>
            )}
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
