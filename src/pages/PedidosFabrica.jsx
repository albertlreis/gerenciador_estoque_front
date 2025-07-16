import React, { useEffect, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Dropdown } from 'primereact/dropdown';
import SakaiLayout from '../layouts/SakaiLayout';
import apiEstoque from '../services/apiEstoque';
import { formatarDataIsoParaBR } from '../utils/formatarData';

const statusOpcoes = [
  { label: 'Pendente', value: 'pendente' },
  { label: 'Produzindo', value: 'produzindo' },
  { label: 'Entregue', value: 'entregue' },
  { label: 'Cancelado', value: 'cancelado' }
];

const PedidosFabrica = () => {
  const toast = useRef(null);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState(null);

  useEffect(() => {
    carregarPedidos();
  }, [filtroStatus]);

  const carregarPedidos = async () => {
    try {
      setLoading(true);
      const { data } = await apiEstoque.get('/pedidos-fabrica', {
        params: filtroStatus ? { status: filtroStatus } : {}
      });
      setPedidos(data);
    } catch (error) {
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar pedidos' });
    } finally {
      setLoading(false);
    }
  };

  const alterarStatus = (pedido) => {
    confirmDialog({
      message: `Deseja alterar o status do pedido #${pedido.id}?`,
      header: 'Alterar Status',
      acceptLabel: 'Sim',
      rejectLabel: 'Cancelar',
      accept: async () => {
        try {
          const proximo = proximoStatus(pedido.status);
          await apiEstoque.patch(`/pedidos-fabrica/${pedido.id}/status`, { status: proximo });
          toast.current.show({ severity: 'success', summary: 'Status atualizado', detail: `Novo status: ${proximo}` });
          carregarPedidos();
        } catch {
          toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao alterar status' });
        }
      }
    });
  };

  const proximoStatus = (atual) => {
    const ordem = ['pendente', 'produzindo', 'entregue'];
    const idx = ordem.indexOf(atual);
    return ordem[idx + 1] ?? 'entregue';
  };

  const statusTemplate = (rowData) => {
    const label = statusOpcoes.find(s => s.value === rowData.status)?.label;
    return <span className="capitalize">{label}</span>;
  };

  const previsaoTemplate = (rowData) => formatarDataIsoParaBR(rowData.data_previsao_entrega);

  const totalItensTemplate = (rowData) => rowData.itens?.reduce((soma, i) => soma + i.quantidade, 0) ?? 0;

  const acoesTemplate = (rowData) => (
    <Button
      icon="pi pi-sync"
      className="p-button-sm p-button-warning"
      tooltip="Alterar Status"
      onClick={() => alterarStatus(rowData)}
    />
  );

  const header = (
    <div className="flex justify-between items-center">
      <h2 className="m-0">Pedidos para Fábrica</h2>
      <Dropdown
        value={filtroStatus}
        options={[{ label: 'Todos', value: null }, ...statusOpcoes]}
        onChange={(e) => setFiltroStatus(e.value)}
        placeholder="Filtrar por status"
        className="w-60"
        showClear
      />
    </div>
  );

  return (
    <SakaiLayout>
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="card">
        <DataTable
          value={pedidos}
          paginator
          rows={10}
          loading={loading}
          header={header}
          emptyMessage="Nenhum pedido encontrado"
        >
          <Column field="id" header="ID" style={{ width: '80px' }} />
          <Column header="Status" body={statusTemplate} />
          <Column header="Previsão Entrega" body={previsaoTemplate} />
          <Column header="Total de Itens" body={totalItensTemplate} />
          <Column header="Observações" field="observacoes" />
          <Column header="Ações" body={acoesTemplate} style={{ width: '120px' }} />
        </DataTable>
      </div>
    </SakaiLayout>
  );
};

export default PedidosFabrica;
