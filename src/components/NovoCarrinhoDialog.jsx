import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';

const NovoCarrinhoDialog = ({
                              visible,
                              onHide,
                              clientes,
                              clienteSelecionado,
                              setClienteSelecionado,
                              onConfirmar
                            }) => (
  <Dialog header="Novo Carrinho" visible={visible} onHide={onHide} modal>
    <div className="mb-3">
      <label>Cliente</label>
      <Dropdown
        value={clienteSelecionado}
        options={clientes}
        optionLabel="nome"
        optionValue="id"
        onChange={(e) => setClienteSelecionado(e.value)}
        placeholder="Selecione o cliente"
        className="w-full"
        filter
      />
    </div>
    <div className="flex justify-content-end">
      <Button label="Criar Carrinho" icon="pi pi-check" className="p-button-sm" onClick={onConfirmar} disabled={!clienteSelecionado} />
    </div>
  </Dialog>
);

export default NovoCarrinhoDialog;
