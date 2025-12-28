import React, { useEffect, useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import SakaiLayout from '../layouts/SakaiLayout';
import apiEstoque from '../services/apiEstoque';
import {formatarDataIsoParaBR} from "../utils/formatters";

const Reservas = () => {
  const toast = useRef(null);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarReservas();
  }, []);

  const carregarReservas = async () => {
    try {
      setLoading(true);
      const { data } = await apiEstoque.get('/pedidos/itens?entrega_pendente=1');
      setReservas(data);
    } catch (error) {
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar reservas' });
    } finally {
      setLoading(false);
    }
  };

  const liberarEntrega = (item) => {
    confirmDialog({
      message: `Deseja realmente liberar a entrega do produto "${item.variacao.produto.nome}"?`,
      header: 'Confirmar Liberação',
      acceptLabel: 'Sim',
      rejectLabel: 'Cancelar',
      accept: async () => {
        try {
          await apiEstoque.patch(`/pedidos/itens/${item.id}/liberar-entrega`);
          toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Entrega liberada!' });
          carregarReservas();
        } catch (error) {
          toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao liberar entrega' });
        }
      }
    });
  };

  const header = (
    <div className="flex justify-between">
      <h2 className="m-0">Reservas de Produtos com Entrega Pendente</h2>
    </div>
  );

  const acaoTemplate = (rowData) => (
    <Button
      icon="pi pi-check"
      className="p-button-success p-button-sm"
      label="Liberar"
      onClick={() => liberarEntrega(rowData)}
    />
  );

  const clienteTemplate = (rowData) => rowData.pedido?.cliente?.nome ?? '-';

  const produtoTemplate = (rowData) => (
    <>
      <span className="font-bold">{rowData.variacao?.produto?.nome}</span><br />
      <small className="text-sm italic">{rowData.variacao?.atributos?.map(a => a.valor).join(', ')}</small>
    </>
  );

  const dataPedidoTemplate = (rowData) =>
    formatarDataIsoParaBR(rowData.pedido?.data_pedido);

  return (
    <SakaiLayout>
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="card">
        <DataTable
          value={reservas}
          paginator
          rows={10}
          loading={loading}
          header={header}
          emptyMessage="Nenhuma reserva pendente encontrada."
        >
          <Column field="pedido.numero_externo" header="Pedido" />
          <Column body={clienteTemplate} header="Cliente" />
          <Column body={produtoTemplate} header="Produto" />
          <Column field="quantidade" header="Qtd." />
          <Column body={dataPedidoTemplate} header="Data Pedido" />
          <Column field="observacao_entrega_pendente" header="Observações" />
          <Column body={acaoTemplate} header="Ação" />
        </DataTable>
      </div>
    </SakaiLayout>
  );
};

export default Reservas;
