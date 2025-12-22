import React, { useState, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

import ClienteForm from '../components/cliente/ClienteForm';

const NovoCarrinhoDialog = ({
                              visible,
                              onHide,
                              clientes,
                              setClientes,
                              clienteSelecionado,
                              setClienteSelecionado,
                              onConfirmar
                            }) => {
  const [showClienteDialog, setShowClienteDialog] = useState(false);
  const toast = useRef(null);

  return (
    <>
      <Toast ref={toast} />

      <Dialog header="Novo Carrinho" visible={visible} onHide={onHide} modal>
        <div className="mb-3">
          <div className="flex align-items-center justify-content-between mb-1">
            <label className="font-semibold">Cliente</label>
          </div>

          <Dropdown
            value={clienteSelecionado}
            options={clientes}
            optionLabel="nome"
            optionValue="id"
            onChange={(e) => setClienteSelecionado(e.value)}
            placeholder="Selecione o cliente"
            className="w-full"
            filter
            showClear
          />
        </div>

        <div className="flex justify-content-end gap-2">
          <Button
            type="button"
            label="Novo cliente"
            icon="pi pi-user-plus"
            className="p-button-sm"
            onClick={() => setShowClienteDialog(true)}
          />
          <Button
            label="Criar Carrinho"
            icon="pi pi-check"
            className="p-button-sm"
            onClick={onConfirmar}
            disabled={!clienteSelecionado}
          />
        </div>
      </Dialog>

      <Dialog
        header="Cadastrar Cliente"
        visible={showClienteDialog}
        onHide={() => setShowClienteDialog(false)}
        modal
        className="w-7"
      >
        <ClienteForm
          initialData={{}}
          onSaved={(novoCliente) => {
            setClientes?.((prev) => Array.isArray(prev) ? [...prev, novoCliente] : [novoCliente]);
            setClienteSelecionado?.(novoCliente.id);

            toast.current?.show({
              severity: 'success',
              summary: 'Cliente criado',
              detail: 'Novo cliente cadastrado com sucesso.',
              life: 2500,
            });

            setShowClienteDialog(false);
          }}
          onCancel={() => setShowClienteDialog(false)}
        />
      </Dialog>
    </>
  );
};

export default NovoCarrinhoDialog;
