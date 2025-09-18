import React, { useMemo, useState } from 'react';
import ProdutoCard from './ProdutoCard';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import formatarPreco from '../utils/formatarPreco';
import getImageSrc from '../utils/getImageSrc';

const agruparPorReferencia = (produtos) => {
  const grupos = [];
  for (const p of produtos) {
    const vs = Array.isArray(p.variacoes) ? p.variacoes : [];
    const byRef = vs.reduce((acc, v) => {
      const ref = v.referencia || 'SEM-REF';
      (acc[ref] ||= []).push(v);
      return acc;
    }, {});
    Object.entries(byRef).forEach(([referencia, variacoes]) => {
      const estoqueTotal = variacoes.reduce((sum, v) => sum + (v.estoque?.quantidade || 0), 0);
      const outletRestante = variacoes.reduce((sum, v) => sum + (v.outlets?.reduce?.((s, o) => s + (o.quantidade_restante || 0), 0) || 0), 0);
      const hasOutlet = outletRestante > 0 || variacoes.some((v) => v.outlet_restante_total > 0);
      grupos.push({
        id: `${p.id}|${referencia}`,
        produto: p,
        referencia,
        variacoes,
        estoque_total: estoqueTotal,
        is_outlet: !!hasOutlet,
        imagem_principal: p.imagem_principal,
      });
    });
  }
  return grupos;
};

const CatalogoGrid = ({ produtos, onAdicionarAoCarrinho }) => {
  const [selectedGroup, setSelectedGroup] = useState(null);

  const grupos = useMemo(() => agruparPorReferencia(produtos), [produtos]);

  const openDetalhes = (grupo) => setSelectedGroup(grupo);
  const closeDetalhes = () => setSelectedGroup(null);

  if (!grupos.length) {
    return <p>Nenhum produto encontrado.</p>;
  }

  return (
    <>
      <div className="grid">
        {grupos.map((g) => (
          <div key={g.id} className="col-12 sm:col-6 md:col-4 lg:col-3">
            <ProdutoCard
              grupo={g}
              onDetalhes={() => openDetalhes(g)}
              onAdicionar={() => {
                // para o diálogo de variações: passamos as variações do grupo
                onAdicionarAoCarrinho &&
                onAdicionarAoCarrinho({ ...g.produto, variacoes: g.variacoes });
              }}
            />
          </div>
        ))}
      </div>

      <Dialog
        header={selectedGroup ? `${selectedGroup.produto?.nome || ''} — Ref. ${selectedGroup.referencia}` : ''}
        visible={!!selectedGroup}
        style={{ width: '640px' }}
        modal
        onHide={closeDetalhes}
      >
        {selectedGroup && (
          <div className="p-fluid">
            <img
              src={
                selectedGroup.imagem_principal
                  ? getImageSrc(selectedGroup.imagem_principal)
                  : 'https://placehold.co/500x300?text=Sem+Imagem'
              }
              alt={selectedGroup.produto?.nome}
              style={{ width: '100%', objectFit: 'cover' }}
              className="mb-3 border-round"
            />

            {/* Dimensões do produto */}
            <div className="grid text-sm mb-3">
              <div className="col-6">
                <strong>Referência:</strong> {selectedGroup.referencia || 'N/A'}
              </div>
              <div className="col-6">
                <strong>Peso:</strong> {selectedGroup.produto?.peso ?? '-'}
              </div>
              <div className="col-4">
                <strong>Altura:</strong> {selectedGroup.produto?.altura ?? '-'}
              </div>
              <div className="col-4">
                <strong>Largura:</strong> {selectedGroup.produto?.largura ?? '-'}
              </div>
              <div className="col-4">
                <strong>Profundidade:</strong> {selectedGroup.produto?.profundidade ?? '-'}
              </div>
            </div>

            <Divider />

            <p><strong>Variações desta referência:</strong></p>

            {selectedGroup.variacoes.map((variacao, idx) => {
              const preco = Number(variacao.preco || 0);
              const quantidade = variacao.estoque?.quantidade ?? 0;

              const renderPreco = () => {
                const outletsValidos = Array.isArray(variacao.outlets)
                  ? variacao.outlets.filter((o) => (o.quantidade_restante || 0) > 0)
                  : [];
                if (!selectedGroup.is_outlet || outletsValidos.length === 0) {
                  return <span>{formatarPreco(preco)}</span>;
                }
                const melhorOutlet = outletsValidos.reduce((menor, atual) =>
                  (atual.percentual_desconto || 0) > (menor.percentual_desconto || 0) ? atual : menor
                );
                const precoOutlet = preco * (1 - (melhorOutlet.percentual_desconto || 0) / 100);
                return (
                  <>
                    <span style={{ textDecoration: 'line-through', marginRight: '0.5rem', color: '#999' }}>
                      {formatarPreco(preco)}
                    </span>
                    <span style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>
                      {formatarPreco(precoOutlet)}
                    </span>
                    <span style={{ fontWeight: 'bold' }}>
                      (-{melhorOutlet.percentual_desconto}%)
                    </span>
                  </>
                );
              };

              // Ordena atributos alfabeticamente
              const atributosOrdenados = Array.isArray(variacao.atributos)
                ? [...variacao.atributos].sort((a, b) => {
                  const ka = `${a.atributo || ''} ${a.valor || ''}`.toLowerCase();
                  const kb = `${b.atributo || ''} ${b.valor || ''}`.toLowerCase();
                  return ka.localeCompare(kb);
                })
                : [];

              return (
                <div key={idx} className="mb-3 border-bottom-1 surface-border pb-2">
                  <p className="m-0"><strong>Nome:</strong> {variacao.nome}</p>
                  <p className="m-0"><strong>Referência:</strong> {variacao.referencia || 'N/A'}</p>
                  <p className="m-0"><strong>Preço:</strong> {renderPreco()}</p>
                  <p className="m-0 mt-1">
                    <strong>Estoque:</strong>{' '}
                    <Tag value={`${quantidade} un.`} severity={quantidade > 0 ? 'success' : 'danger'} />
                  </p>

                  <p className="m-0 mt-2"><strong>Atributos:</strong></p>
                  <ul className="pl-3 mt-1">
                    {atributosOrdenados.length
                      ? atributosOrdenados.map((attr, i) => (
                        <li key={i}>
                          {attr.atributo}: {attr.valor}
                        </li>
                      ))
                      : <li>Nenhum atributo</li>}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </Dialog>
    </>
  );
};

export default CatalogoGrid;
