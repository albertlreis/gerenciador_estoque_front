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
    const label = statusOpcoes.find(s => s.value === rowData.status)?.label;
    return <span className="capitalize">{label}</span>;
  };

  const previsaoTemplate = (rowData) => formatarDataIsoParaBR(rowData.data_previsao_entrega);

  const totalItensTemplate = (rowData) => rowData.itens?.reduce((soma, i) => soma + i.quantidade, 0) ?? 0;

  const acoesTemplate = (rowData) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        className="p-button-sm p-button-info"
        tooltip="Editar"
        onClick={() => editarPedido(rowData)}
      />
      <Button
        icon="pi pi-sync"
        className="p-button-sm p-button-warning"
        tooltip="Alterar Status"
        onClick={() => alterarStatus(rowData)}
      />
    </div>
  );

  const detalhesTemplate = (rowData) => (
    <Button
      icon="pi pi-eye"
      className="p-button-text p-button-sm"
      onClick={() => abrirDetalhes(rowData.id)}
    />
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
          <Column header="Detalhes" body={detalhesTemplate} style={{ width: '100px' }} />
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
        header={`Pedido #${pedidoDetalhado?.id}`}
        visible={!!pedidoDetalhado}
        onHide={() => setPedidoDetalhado(null)}
        style={{ width: '50vw' }}
      >
        <div className="mb-3">
          <strong>Status:</strong> {statusOpcoes.find(s => s.value === pedidoDetalhado?.status)?.label}
          <br />
          <strong>Previsão:</strong> {formatarDataIsoParaBR(pedidoDetalhado?.data_previsao_entrega)}
          <br />
          <strong>Observações:</strong> {pedidoDetalhado?.observacoes}
        </div>

        <h5>Itens do Pedido</h5>
        <ul className="pl-3">
          {pedidoDetalhado?.itens?.map((item, idx) => (
            <li key={idx} className="mb-2">
              <strong>{item.variacao.produto?.nome}</strong> – {item.quantidade} und
              <br />
              <small>{item.variacao.atributos?.map(a => a.valor).join(', ')}</small>
              {item.observacoes && <><br /><em>Obs: {item.observacoes}</em></>}
            </li>
          ))}
        </ul>
      </Dialog>
    </SakaiLayout>
  );
};

export default PedidosFabrica;
