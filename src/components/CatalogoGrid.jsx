import React, { useMemo, useState } from 'react';
import ProdutoCard from './ProdutoCard';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import formatarPreco from '../utils/formatarPreco';
import getImageSrc from '../utils/getImageSrc';
import apiEstoque from '../services/apiEstoque';

// ✅ precisa estar no escopo do módulo (usado em mais de um lugar)
const estoqueDaVariacao = (v) => {
  if (!v) return 0;
  if (typeof v.estoque_total === 'number') return v.estoque_total;
  if (v.estoque && typeof v.estoque.quantidade === 'number') return v.estoque.quantidade;
  if (Array.isArray(v.estoques)) return v.estoques.reduce((s, e) => s + Number(e.quantidade || 0), 0);
  return 0;
};

const resumirDepositos = (variacoes) => {
  const mapa = new Map();

  (variacoes || []).forEach((v) => {
    const estoques = Array.isArray(v?.estoques) ? v.estoques : [];
    estoques.forEach((e) => {
      const qtd = Number(e?.quantidade || 0);
      if (qtd <= 0) return;
      const id = e?.deposito_id ?? e?.deposito?.id;
      const nome = e?.deposito?.nome || (id ? `Depósito #${id}` : 'Depósito');
      if (!id && !nome) return;
      const atual = mapa.get(id || nome) || { id, nome, saldo: 0 };
      atual.saldo += qtd;
      mapa.set(id || nome, atual);
    });
  });

  const lista = Array.from(mapa.values()).sort((a, b) =>
    String(a.nome).localeCompare(String(b.nome))
  );

  const totalSaldo = lista.reduce((s, d) => s + Number(d.saldo || 0), 0);
  if (!lista.length || totalSaldo <= 0) {
    return {
      lista: [],
      resumo: 'Sem estoque',
      tooltip: null,
    };
  }

  const maxMostrar = 2;
  const nomes = lista.map((d) => d.nome);
  const exibidos = nomes.slice(0, maxMostrar);
  const restantes = nomes.length - exibidos.length;
  const resumo = `Disponivel em: ${exibidos.join(', ')}${restantes > 0 ? ` +${restantes}` : ''}`;
  const tooltip = lista.map((d) => `${d.nome}: ${d.saldo} un.`).join('\n');

  return { lista, resumo, tooltip };
};

const agruparPorReferencia = (produtos, apenasComEstoque = false) => {
  const grupos = [];

  for (const p of produtos) {
    const vs = Array.isArray(p.variacoes) ? p.variacoes : [];
    const byRef = vs.reduce((acc, v) => {
      const ref = v.referencia || 'SEM-REF';
      (acc[ref] ||= []).push(v);
      return acc;
    }, {});

    Object.entries(byRef).forEach(([referencia, variacoes]) => {
      const variacoesFiltradas = apenasComEstoque
        ? variacoes.filter((v) => estoqueDaVariacao(v) > 0)
        : variacoes;

      if (!variacoesFiltradas.length) {
        return;
      }

      const estoqueTotal = variacoesFiltradas.reduce((sum, v) => sum + estoqueDaVariacao(v), 0);
      const depositosResumo = resumirDepositos(variacoesFiltradas);

      const outletRestante = variacoesFiltradas.reduce(
        (sum, v) =>
          sum +
          (v.outlets?.reduce?.((s, o) => s + (o.quantidade_restante || 0), 0) || 0),
        0
      );

      const hasOutlet =
        outletRestante > 0 || variacoesFiltradas.some((v) => (v.outlet_restante_total || 0) > 0);

        grupos.push({
          id: `${p.id}|${referencia}`,
          produto: p,
          referencia,
          variacoes: variacoesFiltradas,
          estoque_total: estoqueTotal,
          depositos_resumo: depositosResumo.resumo,
          depositos_tooltip: depositosResumo.tooltip,
          depositos_lista: depositosResumo.lista,
          is_outlet: !!hasOutlet,
          imagem_principal: p.imagem_principal,
        });
      });
  }

  return grupos;
};

const CatalogoGrid = ({ produtos, onAdicionarAoCarrinho, estoqueStatus }) => {
  const [selectedGroup, setSelectedGroup] = useState(null);

  const apenasComEstoque = estoqueStatus === 'com_estoque';
  const grupos = useMemo(
    () => agruparPorReferencia(produtos, apenasComEstoque),
    [produtos, apenasComEstoque]
  );

  const precisaDetalhe = (produto) => {
    const primeira = produto?.variacoes?.[0];
    return !primeira || (typeof primeira.atributos === 'undefined' && typeof primeira.outlets === 'undefined');
  };

  const carregarGrupoDetalhado = async (grupo) => {
    if (!grupo?.produto?.id) return grupo;
    if (!precisaDetalhe(grupo.produto)) return grupo;

    try {
      const response = await apiEstoque.get(`/produtos/${grupo.produto.id}`);
      const produtoDetalhado = response.data?.data || response.data;
      const gruposDetalhados = agruparPorReferencia([produtoDetalhado], apenasComEstoque);
      return gruposDetalhados.find((g) => g.referencia === grupo.referencia) || {
        ...grupo,
        produto: produtoDetalhado,
        variacoes: produtoDetalhado?.variacoes || [],
      };
    } catch (error) {
      console.error('Erro ao carregar detalhes do produto:', error);
      return grupo;
    }
  };

  const openDetalhes = async (grupo) => {
    setSelectedGroup(grupo);
    const detalhado = await carregarGrupoDetalhado(grupo);
    setSelectedGroup(detalhado);
  };
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
              onAdicionar={async () => {
                if (!onAdicionarAoCarrinho) return;
                const detalhado = await carregarGrupoDetalhado(g);
                onAdicionarAoCarrinho({
                  ...detalhado.produto,
                  variacoes: detalhado.variacoes,
                  imagem_principal: detalhado.imagem_principal,
                });
              }}
            />
          </div>
        ))}
      </div>

      <Dialog
        header={
          selectedGroup
            ? `${selectedGroup.produto?.nome || ''} — Ref. ${selectedGroup.referencia}`
            : ''
        }
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

            <p>
              <strong>Variações desta referência:</strong>
            </p>

            {selectedGroup.variacoes.map((variacao, idx) => {
              const preco = Number(variacao.preco || 0);
              const quantidade = estoqueDaVariacao(variacao);

              const renderPreco = () => {
                const outletsValidos = Array.isArray(variacao.outlets)
                  ? variacao.outlets.filter((o) => (o.quantidade_restante || 0) > 0)
                  : [];

                if (!selectedGroup.is_outlet || outletsValidos.length === 0) {
                  return <span>{formatarPreco(preco)}</span>;
                }

                const melhorOutlet = outletsValidos.reduce((melhor, atual) =>
                  (atual.percentual_desconto || 0) > (melhor.percentual_desconto || 0)
                    ? atual
                    : melhor
                );

                const precoOutlet = preco * (1 - (melhorOutlet.percentual_desconto || 0) / 100);

                return (
                  <>
                    <span
                      style={{
                        textDecoration: 'line-through',
                        marginRight: '0.5rem',
                        color: '#999',
                      }}
                    >
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
                    <strong>Referência:</strong> {variacao.referencia || 'N/A'}
                  </p>
                  <p className="m-0">
                    <strong>Preço:</strong> {renderPreco()}
                  </p>
                  <p className="m-0 mt-1">
                    <strong>Estoque:</strong>{' '}
                    <Tag
                      value={`${quantidade} un.`}
                      severity={quantidade > 0 ? 'success' : 'danger'}
                    />
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
          </div>
        )}
      </Dialog>
    </>
  );
};

export default CatalogoGrid;
