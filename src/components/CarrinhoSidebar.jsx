import React, { useState } from 'react';
import { Sidebar } from 'primereact/sidebar';
import { Button } from 'primereact/button';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { confirmDialog } from 'primereact/confirmdialog';
import { useCarrinho } from '../context/CarrinhoContext';
import formatarPreco from '../utils/formatarPreco';

const CarrinhoSidebar = ({ visible, onHide }) => {
  const { itens, removerItem, limparCarrinho, carregarCarrinho, adicionarItem  } = useCarrinho();
  const [limpando, setLimpando] = useState(false);

  const total = itens.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);

  const confirmarRemocaoItem = (itemId) => {
    confirmDialog({
      message: 'Deseja remover este item do carrinho?',
      header: 'Remover Item',
      icon: 'pi pi-trash',
      acceptLabel: 'Sim',
      rejectLabel: 'Cancelar',
      accept: () => removerItem(itemId),
    });
  };

  const atualizarQuantidadeItem = async (item, novaQtd) => {
    if (novaQtd <= 0) {
      confirmarRemocaoItem(item.id);
      return;
    }

    try {
      await adicionarItem({
        id_variacao: item.id_variacao,
        quantidade: novaQtd,
        preco_unitario: Number(item.preco_unitario),
        subtotal: novaQtd * Number(item.preco_unitario)
      });
    } catch (err) {
      console.error('Erro ao atualizar quantidade', err);
    }
  };

  const handleLimparCarrinho = () => {
    confirmDialog({
      message: 'Tem certeza que deseja limpar o carrinho?',
      header: 'Limpar Carrinho',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Cancelar',
      accept: async () => {
        setLimpando(true);
        await limparCarrinho();
        setLimpando(false);
      }
    });
  };

  return (
    <Sidebar visible={visible} onHide={onHide} position="right" showCloseIcon style={{ width: '400px' }}>
      <h3 className="mb-3 border-bottom pb-2">Carrinho</h3>

      {itens.length === 0 ? (
        <div className="text-center text-gray-500 mt-5">
          <i className="pi pi-shopping-cart" style={{ fontSize: '2rem' }}></i>
          <p className="mt-2">Nenhum item no carrinho.</p>
        </div>
      ) : (
        itens.map((item) => (
          <div key={item.id} className="mb-4 border-bottom pb-2">
            <div className="font-semibold mb-1">{item.variacao?.produto?.nome || 'Produto'}</div>
            <div className="text-sm text-gray-600 mb-1">{item.variacao?.descricao || 'Variação'}</div>

            {/* Atributos como badges */}
            {Array.isArray(item.variacao?.atributos) && item.variacao.atributos.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {item.variacao.atributos.map((attr, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 bg-blue-100 border-round">
                    {attr.nome}: {attr.valor}
                  </span>
                ))}
              </div>
            )}

            {/* Medidas do produto */}
            {item.variacao?.produto && (
              <div className="text-xs text-gray-600 mb-2">
                MED: {item.variacao.produto.largura} x {item.variacao.produto.profundidade} x {item.variacao.produto.altura} cm
              </div>
            )}

            <div className="flex align-items-center gap-2">
              <Button icon="pi pi-minus" text onClick={() => atualizarQuantidadeItem(item, item.quantidade - 1)} />
              <span className="font-medium">{item.quantidade}</span>
              <Button icon="pi pi-plus" text onClick={() => atualizarQuantidadeItem(item, item.quantidade + 1)} />
              <span className="ml-2 text-sm">x {formatarPreco(item.preco_unitario)}</span>
              <Button icon="pi pi-trash" className="p-button-text p-button-danger ml-auto" onClick={() => confirmarRemocaoItem(item.id)} />
            </div>
          </div>
        ))
      )}

      <hr />
      <div className="text-right font-bold text-lg">Total: {formatarPreco(total)}</div>

      <div className="mt-4 flex gap-2 justify-end">
        <Button
          label="Limpar"
          icon="pi pi-trash"
          severity="danger"
          disabled={itens.length === 0 || limpando}
          loading={limpando}
          onClick={handleLimparCarrinho}
        />
      </div>

      <ConfirmDialog />
    </Sidebar>
  );
};

export default CarrinhoSidebar;
