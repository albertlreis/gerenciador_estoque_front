import React from 'react';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';

const PedidosMesCard = ({ visible, onHide, pedidos = [] }) => {
  const getStatusSeverity = (status) => {
    switch (status) {
      case 'confirmado':
        return 'success';
      case 'cancelado':
        return 'danger';
      case 'rascunho':
        return 'warning';
      default:
        return 'info';
    }
  };

  const formatarMoeda = (valor) => {
    return Number(valor || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return (
    <Dialog
      header="Pedidos do mês"
      visible={visible}
      style={{ width: '60vw' }}
      onHide={onHide}
    >
      <DataTable
        value={pedidos}
        responsiveLayout="scroll"
        emptyMessage="Nenhum pedido encontrado."
      >
        <Column field="cliente.nome" header="Cliente" body={(row) => row.cliente?.nome || 'Não informado'} />
        <Column field="valor_total" header="Valor" body={(row) => formatarMoeda(row.valor_total)} />
        <Column field="status" header="Status" body={(row) => (
          <Tag
            value={row.status}
            severity={getStatusSeverity(row.status)}
            className="text-capitalize"
          />
        )} />
        <Column field="data" header="Data" body={(row) => new Date(row.data).toLocaleDateString('pt-BR')} />
      </DataTable>
    </Dialog>
  );
};

export default PedidosMesCard;
