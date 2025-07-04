import React from 'react';
import { Dropdown } from 'primereact/dropdown';
import { confirmDialog } from 'primereact/confirmdialog';

const SelecionarEntidades = ({
                               isAdmin,
                               vendedores,
                               clientes,
                               parceiros,
                               carrinhoAtual,
                               idVendedorSelecionado,
                               setIdVendedorSelecionado,
                               onAtualizarCarrinho,
                               toast,
                             }) => (
  <div className="grid mb-4 gap-3">
    {isAdmin && (
      <div className="col-12 md:col-6">
        <label className="block mb-1 font-medium">Vendedor</label>
        <Dropdown
          value={idVendedorSelecionado}
          options={vendedores}
          optionLabel="nome"
          optionValue="id"
          onChange={(e) => setIdVendedorSelecionado(e.value)}
          placeholder="Selecione o vendedor"
          className="w-full"
          filter
        />
      </div>
    )}

    <div className="col-12 md:col-6">
      <label className="block mb-1 font-medium">Cliente</label>
      <Dropdown
        value={carrinhoAtual?.id_cliente}
        options={clientes}
        optionLabel="nome"
        optionValue="id"
        onChange={(e) => {
          const novoId = e.value;
          if (novoId === carrinhoAtual?.id_cliente) return;
          confirmDialog({
            message: 'Deseja alterar o cliente do carrinho?',
            header: 'Alterar Cliente',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sim',
            rejectLabel: 'Cancelar',
            accept: () => {
              onAtualizarCarrinho(carrinhoAtual.id, { id_cliente: novoId });
              toast.current.show({ severity: 'success', summary: 'Cliente alterado' });
            },
          });
        }}
        placeholder="Selecione o cliente"
        className="w-full"
        filter
      />
    </div>

    <div className="col-12 md:col-6">
      <label className="block mb-1 font-medium">Parceiro</label>
      <Dropdown
        value={carrinhoAtual?.id_parceiro}
        options={parceiros}
        optionLabel="nome"
        optionValue="id"
        onChange={(e) => {
          const novoId = e.value;
          if (novoId === carrinhoAtual?.id_parceiro) return;
          confirmDialog({
            message: 'Deseja alterar o parceiro do carrinho?',
            header: 'Alterar Parceiro',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sim',
            rejectLabel: 'Cancelar',
            accept: () => {
              onAtualizarCarrinho(carrinhoAtual.id, { id_parceiro: novoId });
              toast.current.show({ severity: 'success', summary: 'Parceiro alterado' });
            },
          });
        }}
        placeholder="Selecione o parceiro"
        className="w-full"
        filter
      />
    </div>
  </div>
);

export default SelecionarEntidades;
