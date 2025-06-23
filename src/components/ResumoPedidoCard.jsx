import React from 'react';
import { Button } from 'primereact/button';

const ResumoPedidoCard = ({ total, quantidadeItens, onSalvar, onFinalizar, onCancelar }) => (
  <div className="shadow-2 rounded p-4 bg-white sticky top-4">
    <h3 className="text-lg font-semibold mb-3">Resumo do Pedido</h3>
    <div className="flex justify-between mb-2">
      <span className="text-sm">Total de itens:</span>
      <span className="text-sm font-medium">{quantidadeItens}</span>
    </div>
    <div className="flex justify-between mb-2">
      <span className="text-sm">Valor total:</span>
      <span className="text-lg font-bold text-green-700">{total}</span>
    </div>

    <div className="mt-4 flex flex-column gap-2">
      <Button label="Salvar alterações" icon="pi pi-save" className="p-button-info w-full" onClick={onSalvar} />
      <Button label="Finalizar Pedido" icon="pi pi-check" className="p-button-success w-full" onClick={onFinalizar} />
      <Button label="Cancelar Carrinho" icon="pi pi-times" className="p-button-danger w-full" onClick={onCancelar} />
    </div>
  </div>
);

export default ResumoPedidoCard;
