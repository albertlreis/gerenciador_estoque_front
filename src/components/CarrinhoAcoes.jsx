import React from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Badge } from 'primereact/badge';
import { useNavigate } from 'react-router-dom';

const CarrinhoAcoes = ({
                         carrinhoAtual,
                         carrinhos,
                         carregarCarrinho,
                         abrirDialogCarrinho,
                         quantidadeTotal,
                         setCarrinhoVisible,
                         animateCart,
                         setAnimateCart
                       }) => {
  const navigate = useNavigate();

  return (
    <div className="flex gap-3 align-items-center">
      <Dropdown
        value={carrinhoAtual?.id || null}
        options={(carrinhos || []).map((c) => ({
          label: `Cliente: ${c.cliente?.nome || '---'}`,
          value: c.id
        }))}
        placeholder="Selecionar carrinho"
        onChange={(e) => carregarCarrinho(e.value)}
        className="w-18rem"
        filter
      />
      <Button label="Novo Carrinho" icon="pi pi-plus" className="p-button-sm" onClick={abrirDialogCarrinho} />
      <Button label="Finalizar" icon="pi pi-check" className="p-button-sm p-button-success" disabled={!carrinhoAtual} onClick={() => navigate(`/finalizar-pedido/${carrinhoAtual.id}`)} />
      <div className="relative cursor-pointer" onClick={() => setCarrinhoVisible(true)}>
        <i className={`pi pi-shopping-cart text-2xl ${animateCart ? 'p-cart-pulse' : ''}`} onAnimationEnd={() => setAnimateCart(false)} />
        {quantidadeTotal > 0 && (
          <Badge value={quantidadeTotal} severity="info" className="p-overlay-badge" />
        )}
      </div>
    </div>
  );
};

export default CarrinhoAcoes;
