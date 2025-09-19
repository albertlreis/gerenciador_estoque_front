import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import formatarPreco from '../utils/formatarPreco';
import getImageSrc from "../utils/getImageSrc";

const SelecionarVariacaoDialog = ({
                                    produto,
                                    variacaoSelecionada,
                                    setVariacaoSelecionada,
                                    visible,
                                    onHide,
                                    onAdicionar
                                  }) => {
  if (!produto) return null;

  const medidas = [produto.largura, produto.profundidade, produto.altura]
    .filter(Boolean).join(' X ');

  const motivoLegivel = (motivo) =>
    motivo.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <Dialog
      header={`Selecionar Variação de ${produto?.nome}`}
      visible={visible}
      onHide={onHide}
      modal
      style={{ width: '90vw', maxWidth: '1280px' }}
      className="p-0"
      contentStyle={{ padding: '1.5rem' }}
      footer={
        <div className="flex justify-content-end gap-2">
          <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={onHide} />
          <Button
            label="Adicionar ao Carrinho"
            icon="pi pi-check"
            disabled={!variacaoSelecionada}
            className="p-button-primary"
            onClick={onAdicionar}
          />
        </div>
      }
    >
      <div className="grid m-0 p-0">
        {/* Imagem do Produto */}
        <div className="col-12 md:col-3 flex justify-content-center align-items-start mb-4 p-0">
          <img
            src={produto.imagem_principal ?? 'https://placehold.co/500x300?text=Sem+Imagem'}
            alt={produto.nome}
            style={{ maxWidth: '100%', borderRadius: '4px' }}
          />
        </div>

        {/* Conteúdo de variações */}
        <div className="col-12 md:col-9 p-0">
          <div className="flex flex-wrap -mt-3">
            {(produto.variacoes || []).map((variacao, idx) => {
              const preco = Number(variacao.preco || 0);
              const isSelecionada = variacaoSelecionada?.id === variacao.id;
              const outletSelecionado = variacaoSelecionada?.outletSelecionado;
              const atributos = new Map();
              (variacao.atributos || []).forEach(attr => {
                const nome = attr.atributo?.toUpperCase();
                if (nome) atributos.set(nome, attr.valor?.toUpperCase());
              });
              const estoqueQtd = variacao?.estoque?.quantidade ?? 0;

              return (
                <div key={variacao.id} className="w-full md:w-6 lg:w-6 xl:w-6 p-2">
                  <div
                    className={`border-2 border-round p-3 h-full flex flex-column justify-content-between ${
                      isSelecionada ? 'border-green-500 bg-green-50 shadow-1' : 'border-gray-300 hover:border-primary'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-semibold mb-1">{produto.nome}</div>
                      <div className="text-xs mb-2">
                        REF: {variacao.referencia} • MED: {medidas} CM
                      </div>

                      <div className="flex flex-wrap gap-2 mb-2">
                        {[...atributos.entries()].map(([k, v], i) => (
                          <span key={i} className="text-xs px-2 py-1 border-round bg-gray-100">{k}: {v}</span>
                        ))}
                      </div>

                      <div className="flex justify-content-between align-items-center mb-2">
                        <span className="text-green-700 font-bold text-sm">
                          Preço: {formatarPreco(preco)}
                        </span>
                        <span className="text-xs">{estoqueQtd > 0 ? `Estoque: ${estoqueQtd}` : 'Esgotado'}</span>
                      </div>

                      {/* OUTLETS */}
                      {produto.is_outlet && variacao.outlets?.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-bold mb-1">Opções OUTLET:</p>
                          <div className="flex flex-column gap-2">
                            {variacao.outlets.filter(o => o.quantidade_restante > 0).map((outlet, idxOutlet) => {
                              const precoComDesconto = preco * (1 - outlet.percentual_desconto / 100);
                              const selecionado = outletSelecionado?.id === outlet.id && isSelecionada;

                              return (
                                <div
                                  key={idxOutlet}
                                  className={`p-2 border-1 border-round surface-100 flex justify-content-between align-items-center gap-3 ${
                                    selecionado ? 'bg-yellow-100 border-yellow-500' : ''
                                  }`}
                                >
                                  <div>
                                    <div className="text-sm">
                                      <strong>{formatarPreco(precoComDesconto)}</strong>{' '}
                                      <span className="text-xs text-600">
                                        (-{outlet.percentual_desconto}%, {motivoLegivel(outlet.motivo)})
                                      </span>
                                    </div>
                                    <div className="text-xs text-600">
                                      Disponível: {outlet.quantidade_restante} un.
                                    </div>
                                  </div>
                                  <div className="flex align-items-center">
                                    <Button
                                      label="Selecionar"
                                      icon="pi pi-cart-plus"
                                      className={`p-button-sm ${selecionado ? 'p-button-warning' : 'p-button-success'}`}
                                      onClick={() =>
                                        setVariacaoSelecionada({...variacao, outletSelecionado: outlet})
                                      }
                                    />
                                    {selecionado && (
                                      <Tag value="Selecionado" severity="warning" className="ml-2"/>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Botão de seleção padrão */}
                    <div className="mt-3 flex justify-content-end">
                      {produto.is_outlet && variacao.outlets?.some(o => o.quantidade_restante > 0) ? (
                        <Button
                          label="Selecionar Preço Normal"
                          icon="pi pi-money-bill"
                          className={`p-button-sm ${isSelecionada && !outletSelecionado ? 'p-button-info' : 'p-button-secondary'}`}
                          onClick={() => setVariacaoSelecionada({...variacao, outletSelecionado: null})}
                        />
                      ) : (
                        <Button
                          label="Selecionar"
                          icon="pi pi-cart-plus"
                          className={`p-button-sm ${isSelecionada ? 'p-button-info' : 'p-button-secondary'}`}
                          onClick={() => setVariacaoSelecionada({...variacao, outletSelecionado: null})}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default SelecionarVariacaoDialog;
