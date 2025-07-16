import React, { useEffect, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import SakaiLayout from '../layouts/SakaiLayout';
import apiEstoque from '../services/apiEstoque';
import { formatarDataIsoParaBR } from '../utils/formatarData';
import PedidoFabricaForm from '../components/PedidoFabricaForm';

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

  const [showForm, setShowForm] = useState(false);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [pedidoDetalhado, setPedidoDetalhado] = useState(null);

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
    const proximo = proximoStatus(pedido.status);
    const proximoLabel = statusOpcoes.find(s => s.value === proximo)?.label || proximo;

    confirmDialog({
      message: `Deseja alterar o status do pedido #${pedido.id} para *${proximoLabel}*?`,
      header: 'Alterar Status',
      acceptLabel: 'Sim',
      rejectLabel: 'Cancelar',
      accept: async () => {
        try {
          await apiEstoque.patch(`/pedidos-fabrica/${pedido.id}/status`, { status: proximo });
          toast.current.show({ severity: 'success', summary: 'Status atualizado', detail: `Novo status: ${proximoLabel}` });
          carregarPedidos();
        } catch {
          toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao alterar status' });
        }
      }
    });
  };

  const cancelarPedido = (pedido) => {
    confirmDialog({
      message: `Tem certeza que deseja cancelar o pedido #${pedido.id}? Esta ação não poderá ser desfeita.`,
      header: 'Cancelar Pedido',
      acceptLabel: 'Sim, Cancelar',
      rejectLabel: 'Não',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await apiEstoque.patch(`/pedidos-fabrica/${pedido.id}/status`, { status: 'cancelado' });
          toast.current.show({ severity: 'warn', summary: 'Pedido Cancelado', detail: `Pedido #${pedido.id} foi cancelado.` });
          carregarPedidos();
        } catch {
          toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao cancelar o pedido' });
        }
      }
    });
  };


  const proximoStatus = (atual) => {
    const ordem = ['pendente', 'produzindo', 'entregue'];
    const idx = ordem.indexOf(atual);
    return ordem[idx + 1] ?? 'entregue';
  };

  const abrirNovoPedido = () => {
    setPedidoSelecionado(null);
    setShowForm(true);
  };

  const editarPedido = (pedido) => {
    setPedidoSelecionado(pedido);
    setShowForm(true);
  };

  const salvarPedido = async (dados) => {
    try {
      if (pedidoSelecionado) {
        await apiEstoque.put(`/pedidos-fabrica/${pedidoSelecionado.id}`, dados);
        toast.current.show({ severity: 'success', summary: 'Atualizado', detail: 'Pedido atualizado com sucesso!' });
      } else {
        await apiEstoque.post('/pedidos-fabrica', dados);
        toast.current.show({ severity: 'success', summary: 'Criado', detail: 'Pedido criado com sucesso!' });
      }
      carregarPedidos();
    } catch {
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao salvar pedido' });
    }
  };

  const abrirDetalhes = async (pedidoId) => {
    try {
      const { data } = await apiEstoque.get(`/pedidos-fabrica/${pedidoId}`);
      setPedidoDetalhado(data);
    } catch {
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar detalhes' });
    }
  };

  const statusTemplate = (rowData) => {
    const status = rowData?.status;
    const statusInfo = {
      pendente: { label: 'Pendente', icon: 'pi-clock', className: 'bg-gray-200 text-gray-800' },
      produzindo: { label: 'Produzindo', icon: 'pi-cog', className: 'bg-blue-200 text-blue-800' },
      entregue: { label: 'Entregue', icon: 'pi-check', className: 'bg-green-200 text-green-800' },
      cancelado: { label: 'Cancelado', icon: 'pi-times', className: 'bg-red-200 text-red-800' },
    };

    const { label, icon, className } = statusInfo[status] ?? { label: status, icon: '', className: '' };

    return (
      <span className={`inline-flex align-items-center gap-2 px-2 py-1 border-round text-sm font-semibold ${className}`}>
      <i className={`pi ${icon}`} /> {label}
    </span>
    );
  };

  const previsaoTemplate = (rowData) => formatarDataIsoParaBR(rowData.data_previsao_entrega);

  const totalItensTemplate = (rowData) => rowData.itens?.reduce((soma, i) => soma + i.quantidade, 0) ?? 0;

  const acoesTemplate = (rowData) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-eye"
        className="p-button-sm p-button-secondary"
        tooltip="Detalhes"
        onClick={() => abrirDetalhes(rowData.id)}
      />

      <Button
        icon="pi pi-pencil"
        className="p-button-sm p-button-info"
        tooltip="Editar"
        onClick={() => editarPedido(rowData)}
      />
      {rowData.status !== 'entregue' && rowData.status !== 'cancelado' && (
        <>
          <Button
            icon="pi pi-sync"
            className="p-button-sm p-button-warning"
            tooltip="Avançar Status"
            onClick={() => alterarStatus(rowData)}
          />
          <Button
            icon="pi pi-times"
            className="p-button-sm p-button-danger"
            tooltip="Cancelar Pedido"
            onClick={() => cancelarPedido(rowData)}
          />
        </>
      )}
    </div>
  );

  const header = (
    <div className="flex justify-between items-center gap-4">
      <h2 className="m-0">Pedidos para Fábrica</h2>
      <div className="flex gap-2">
        <Dropdown
          value={filtroStatus}
          options={[{ label: 'Todos', value: null }, ...statusOpcoes]}
          onChange={(e) => setFiltroStatus(e.value)}
          placeholder="Filtrar por status"
          className="w-60"
          showClear
        />
        <Button label="Novo Pedido" icon="pi pi-plus" onClick={abrirNovoPedido} />
      </div>
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

      <PedidoFabricaForm
        visible={showForm}
        onHide={() => setShowForm(false)}
        onSave={salvarPedido}
        pedidoEditavel={pedidoSelecionado}
      />

      <Dialog
        header={`Detalhes do Pedido #${pedidoDetalhado?.id}`}
        visible={!!pedidoDetalhado}
        onHide={() => setPedidoDetalhado(null)}
        style={{ width: '60vw' }}
        className="p-fluid"
        modal
      >
        <div className="mb-4">
          <div className="flex flex-column gap-2 mb-2">
            <div className="flex gap-2 align-items-center">
              <i className="pi pi-tags text-primary" />
              <span>
          <strong>Status:</strong>{' '}
                {statusTemplate(pedidoDetalhado)}
        </span>
            </div>
            <div className="flex gap-2 align-items-center">
              <i className="pi pi-calendar text-primary" />
              <span>
          <strong>Previsão:</strong>{' '}
                {formatarDataIsoParaBR(pedidoDetalhado?.data_previsao_entrega)}
        </span>
            </div>
            <div className="flex gap-2 align-items-center">
              <i className="pi pi-align-left text-primary" />
              <span>
          <strong>Observações:</strong> {pedidoDetalhado?.observacoes || '—'}
        </span>
            </div>
          </div>
        </div>

        <h5 className="mt-4 mb-2">Itens do Pedido</h5>
        <DataTable value={pedidoDetalhado?.itens || []} responsiveLayout="stack">
          <Column
            header="Produto"
            body={(item) => (
              <div className="flex flex-column">
                <strong>{item.variacao.produto?.nome ?? '—'}</strong>
                <small className="text-500">
                  {item.variacao.atributos?.map((a) => a.valor).join(', ') || '—'}
                </small>
              </div>
            )}
          />
          <Column
            header="Quantidade"
            body={(item) => `${item.quantidade} und`}
            style={{ width: '120px' }}
          />
          <Column
            header="Observações"
            body={(item) => item.observacoes || '—'}
          />
        </DataTable>
      </Dialog>

    </SakaiLayout>
  );
};

export default PedidosFabrica;
