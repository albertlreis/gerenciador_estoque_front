import React, { useMemo, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import ProdutoCard from './ProdutoCard';
import formatarPreco from '../utils/formatarPreco';
import getImageSrc from '../utils/getImageSrc';
import { getQuantidadeDisponivelVariacao } from '../utils/estoqueVariacao';
import { filtrarVariacoesPorEstoqueStatus } from '../utils/catalogoEstoque';

const estoqueDaVariacao = (variacao) => getQuantidadeDisponivelVariacao(variacao);

const resumirDepositos = (variacoes) => {
  const mapa = new Map();

  (variacoes || []).forEach((variacao) => {
    const estoques = Array.isArray(variacao?.estoques) ? variacao.estoques : [];
    estoques.forEach((estoque) => {
      const qtd = Number(estoque?.quantidade || 0);
      if (qtd <= 0) return;

      const id = estoque?.deposito_id ?? estoque?.deposito?.id;
      const nome = estoque?.deposito?.nome || (id ? `Deposito #${id}` : 'Deposito');
      const chave = id || nome;
      const atual = mapa.get(chave) || { id, nome, saldo: 0 };
      atual.saldo += qtd;
      mapa.set(chave, atual);
    });
  });

  const lista = Array.from(mapa.values()).sort((a, b) => String(a.nome).localeCompare(String(b.nome)));
  const totalSaldo = lista.reduce((soma, deposito) => soma + Number(deposito.saldo || 0), 0);

  if (!lista.length || totalSaldo <= 0) {
    return { lista: [], resumo: 'Sem estoque', tooltip: null };
  }

  const nomes = lista.map((d) => d.nome);
  const exibidos = nomes.slice(0, 2);
  const restantes = nomes.length - exibidos.length;

  return {
    lista,
    resumo: `Disponivel em: ${exibidos.join(', ')}${restantes > 0 ? ` +${restantes}` : ''}`,
    tooltip: lista.map((d) => `${d.nome}: ${d.saldo} un.`).join('\n'),
  };
};

const montarResumoEstoque = (variacoes) => {
  const quantidades = (variacoes || []).map((variacao) => estoqueDaVariacao(variacao));
  const variacoesComEstoque = quantidades.filter((qtd) => qtd > 0);
  const variacoesSemEstoque = quantidades.filter((qtd) => qtd <= 0);

  return {
    total_variacoes: quantidades.length,
    variacoes_com_estoque: variacoesComEstoque.length,
    variacoes_sem_estoque: variacoesSemEstoque.length,
    total_disponivel: variacoesComEstoque.reduce((soma, qtd) => soma + qtd, 0),
    max_disponivel: quantidades.length ? Math.max(...quantidades) : 0,
  };
};

const agruparPorReferencia = (produtos, apenasComEstoque = false) => {
  const grupos = [];

  for (const produto of produtos || []) {
    const variacoes = Array.isArray(produto?.variacoes) ? produto.variacoes : [];
    const variacoesPorReferencia = variacoes.reduce((acc, variacao) => {
      const referencia = variacao?.referencia || 'SEM-REF';
      (acc[referencia] ||= []).push(variacao);
      return acc;
    }, {});

    Object.entries(variacoesPorReferencia).forEach(([referencia, variacoesRef]) => {
      const estoqueResumo = montarResumoEstoque(variacoesRef);
      const depositosResumo = resumirDepositos(variacoesRef);
      const outletRestante = variacoesRef.reduce(
        (soma, variacao) => soma + (variacao?.outlets?.reduce?.((s, o) => s + (o.quantidade_restante || 0), 0) || 0),
        0
      );
      const hasOutlet = outletRestante > 0 || variacoesRef.some((v) => (v?.outlet_restante_total || 0) > 0);

      grupos.push({
        id: `${produto.id}|${referencia}`,
        produto,
        referencia,
        variacoes: variacoesRef,
        estoque_total: variacoesRef.reduce((soma, v) => soma + estoqueDaVariacao(v), 0),
        estoque_resumo: estoqueResumo,
        depositos_resumo: depositosResumo.resumo,
        depositos_tooltip: depositosResumo.tooltip,
        depositos_lista: depositosResumo.lista,
        is_outlet: !!hasOutlet,
        imagem_url: variacoesRef.find((v) => v?.imagem_url)?.imagem_url || produto?.imagem_principal || null,
      });
    });
  }

  return grupos;
};

const filtrarGruposPorEstoqueStatus = (grupos, estoqueStatus) => {
  if (estoqueStatus === 'com_estoque') {
    return grupos.filter((grupo) => Number(grupo?.estoque_resumo?.variacoes_com_estoque || 0) > 0);
  }

  if (estoqueStatus === 'sem_estoque') {
    return grupos.filter((grupo) => Number(grupo?.estoque_resumo?.variacoes_sem_estoque || 0) > 0);
  }

  return grupos;
};

const CatalogoGrid = ({ produtos, estoqueStatus, onAdicionarAoCarrinho, onEditarProduto }) => {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const variacoesDetalheBase = Array.isArray(selectedGroup?.produto?.variacoes) ? selectedGroup.produto.variacoes : [];
  const variacoesDetalhe = filtrarVariacoesPorEstoqueStatus(variacoesDetalheBase, estoqueStatus);

  const grupos = useMemo(() => {
    const agrupados = agruparPorReferencia(produtos);
    return filtrarGruposPorEstoqueStatus(agrupados, estoqueStatus);
  }, [produtos, estoqueStatus]);

  const openDetalhes = (grupo) => setSelectedGroup(grupo);
  const closeDetalhes = () => setSelectedGroup(null);

  if (!grupos.length) {
    return <p>Nenhum produto encontrado.</p>;
  }

  return (
    <>
      <div className="grid">
        {grupos.map((grupo) => (
          <div key={grupo.id} className="col-12 sm:col-6 md:col-4 lg:col-3">
            <ProdutoCard
              grupo={grupo}
              estoqueStatus={estoqueStatus}
              onDetalhes={() => openDetalhes(grupo)}
              onAdicionar={() => {
                if (!onAdicionarAoCarrinho) return;
                onAdicionarAoCarrinho({
                  ...grupo.produto,
                  variacoes: Array.isArray(grupo?.produto?.variacoes) ? grupo.produto.variacoes : [],
                });
              }}
              onEditar={() => onEditarProduto && onEditarProduto(grupo)}
            />
          </div>
        ))}
      </div>

      <Dialog
        header={selectedGroup ? `${selectedGroup.produto?.nome || ''} - Ref. ${selectedGroup.referencia}` : ''}
        visible={!!selectedGroup}
        style={{ width: '640px' }}
        modal
        onHide={closeDetalhes}
      >
        {selectedGroup && (
          <div className="p-fluid">
            <img
              src={
                selectedGroup.imagem_url
                  ? getImageSrc(selectedGroup.imagem_url)
                  : 'https://placehold.co/600x400.jpg'
              }
              alt={selectedGroup.produto?.nome}
              style={{ width: '100%', objectFit: 'cover' }}
              className="mb-3 border-round"
            />

            <div className="grid text-sm mb-3">
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

            <p>
              <strong>Variacoes do produto:</strong>
            </p>

            {variacoesDetalhe.map((variacao, idx) => {
              const preco = Number(variacao.preco || 0);
              const quantidade = estoqueDaVariacao(variacao);
              const outletsValidos = Array.isArray(variacao.outlets)
                ? variacao.outlets.filter((outlet) => Number(outlet?.quantidade_restante || 0) > 0)
                : [];

              const renderPreco = () => {
                if (!selectedGroup.is_outlet || outletsValidos.length === 0) {
                  return <span>{formatarPreco(preco)}</span>;
                }

                const melhorOutlet = outletsValidos.reduce((melhor, atual) =>
                  (atual.percentual_desconto || 0) > (melhor.percentual_desconto || 0) ? atual : melhor
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

              const atributosOrdenados = Array.isArray(variacao.atributos)
                ? [...variacao.atributos].sort((a, b) => {
                    const ka = `${a.atributo || ''} ${a.valor || ''}`.toLowerCase();
                    const kb = `${b.atributo || ''} ${b.valor || ''}`.toLowerCase();
                    return ka.localeCompare(kb);
                  })
                : [];

              return (
                <div key={idx} className="mb-3 border-bottom-1 surface-border pb-2">
                  <p className="m-0">
                    <strong>Nome:</strong> {variacao.nome}
                  </p>
                  <p className="m-0">
                    <strong>Referencia:</strong> {variacao.referencia || 'N/A'}
                  </p>
                  <p className="m-0">
                    <strong>Preco:</strong> {renderPreco()}
                  </p>
                  <p className="m-0 mt-1">
                    <strong>Estoque:</strong>{' '}
                    <Tag value={`${quantidade} un.`} severity={quantidade > 0 ? 'success' : 'danger'} />
                  </p>

                  <p className="m-0 mt-2">
                    <strong>Atributos:</strong>
                  </p>
                  <ul className="pl-3 mt-1">
                    {atributosOrdenados.length ? (
                      atributosOrdenados.map((attr, i) => (
                        <li key={i}>
                          {attr.atributo}: {attr.valor}
                        </li>
                      ))
                    ) : (
                      <li>Nenhum atributo</li>
                    )}
                  </ul>
                </div>
              );
            })}

            {variacoesDetalhe.length === 0 && (
              <p className="text-sm text-600">Nenhuma variacao disponivel para o filtro selecionado.</p>
            )}
          </div>
        )}
      </Dialog>
    </>
  );
};

export default CatalogoGrid;
