import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

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

  return (
    <Dialog
      header={`Selecionar Variação de ${produto?.nome}`}
      visible={visible}
      onHide={onHide}
      modal
      style={{ width: '80vw' }}
    >
      <div className="grid">
        <div className="col-12 md:col-4 flex justify-content-center align-items-start mb-4">
          <img src={produto.imagem_principal || '/placeholder.jpg'} alt={produto.nome} style={{ maxWidth: '100%' }} />
        </div>
        <div className="col-12 md:col-8">
          <div className="grid">
            {(produto.variacoes || []).map(variacao => {
              const isSelecionada = variacaoSelecionada?.id === variacao.id;
              const atributos = new Map();
              (variacao.atributos || []).forEach(attr => {
                const nome = attr.atributo?.toUpperCase();
                if (nome) atributos.set(nome, attr.valor?.toUpperCase());
              });
              const estoqueQtd = variacao?.estoque?.quantidade ?? 0;

              return (
                <div
                  key={variacao.id}
                  className={`col-12 md:col-6 cursor-pointer border-2 border-round p-3 ${
                    isSelecionada ? 'border-green-600 shadow-2' : 'border-gray-300 hover:border-primary'
                  }`}
                  onClick={() => setVariacaoSelecionada(variacao)}
                >
                  <div className="text-sm font-semibold">{produto.nome}</div>
                  <div className="text-xs mb-2">REF: {variacao.referencia} • MED: {medidas} CM</div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {[...atributos.entries()].map(([k, v], i) => (
                      <span key={i} className="text-xs px-2 py-1 border-round bg-gray-100">{k}: {v}</span>
                    ))}
                  </div>
                  <div className="flex justify-content-between">
                    <span className="text-green-700 font-bold">R$ {Number(variacao.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    <span className="text-xs">{estoqueQtd > 0 ? `Estoque: ${estoqueQtd}` : 'Esgotado'}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex justify-content-end gap-2">
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={onHide} />
            <Button label="Adicionar ao Carrinho" icon="pi pi-cart-plus" disabled={!variacaoSelecionada} onClick={onAdicionar} />
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default SelecionarVariacaoDialog;
