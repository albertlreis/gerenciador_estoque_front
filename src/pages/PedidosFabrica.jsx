import React, { useEffect, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Timeline } from 'primereact/timeline';
import SakaiLayout from '../layouts/SakaiLayout';
import apiEstoque from '../services/apiEstoque';
import { formatarDataIsoParaBR } from '../utils/formatarData';
import PedidoFabricaForm from '../components/PedidoFabricaForm';

const statusOpcoes = [
  { label: 'Pendente', value: 'pendente' },
  { label: 'Enviado', value: 'enviado' },
  { label: 'Parcial', value: 'parcial' },
  { label: 'Entregue', value: 'entregue' },
  { label: 'Cancelado', value: 'cancelado' }
];

const mapStatusInfo = (status) => {
  const dict = {
    pendente:  { label: 'Pendente',  icon: 'pi-clock',  severity: 'secondary' },
    enviado:   { label: 'Enviado',   icon: 'pi-send',   severity: 'info' },
    parcial:   { label: 'Parcial',   icon: 'pi-box',    severity: 'warning' },
    entregue:  { label: 'Entregue',  icon: 'pi-check',  severity: 'success' },
    cancelado: { label: 'Cancelado', icon: 'pi-times',  severity: 'danger' },
  };
  return dict[status] ?? { label: status, icon: '', severity: 'secondary' };
};

const PedidosFabrica = () => {
  const toast = useRef(null);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [pedidoDetalhado, setPedidoDetalhado] = useState(null);

  // Entrega dialog (pode vir de item ou de troca para "parcial")
  const [showEntregaDialog, setShowEntregaDialog] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [qtdEntrega, setQtdEntrega] = useState(1);
  const [obsEntrega, setObsEntrega] = useState('');
  const [depositoEntrega, setDepositoEntrega] = useState(null);
  const [depositos, setDepositos] = useState([]);

  useEffect(() => { carregarPedidos(); }, [filtroStatus]);
  useEffect(() => { carregarDepositos(); }, []);

  /** Carrega lista de pedidos com filtro. */
  const carregarPedidos = async () => {
    try {
      setLoading(true);
      const { data } = await apiEstoque.get('/pedidos-fabrica', {
        params: filtroStatus ? { status: filtroStatus } : {}
      });
      setPedidos(data?.data ?? data);
    } catch {
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar pedidos' });
    } finally { setLoading(false); }
  };

  /** Carrega depósitos para o diálogo de entrega. */
  const carregarDepositos = async () => {
    try {
      const { data } = await apiEstoque.get('/depositos');
      setDepositos((data || []).map(d => ({ label: d.nome, value: d.id })));
    } catch {
      // silencioso
    }
  };

  /** Atualiza status: intercepta "parcial" e confirma "entregue". */
  const handleTrocaStatus = (pedido, novoStatus) => {
    if (novoStatus === 'parcial') {
      // abre o diálogo de entrega com seleção de item com saldo
      if (!pedidoDetalhado || pedidoDetalhado.id !== pedido.id) {
        abrirDetalhes(pedido.id, () => abrirEntregaPorPedido(pedido));
      } else {
        abrirEntregaPorPedido(pedidoDetalhado);
      }
      return;
    }

    if (novoStatus === 'entregue') {
      confirmDialog({
        header: 'Confirmar Entrega Total',
        message: 'Isso vai registrar a entrega total de todos os itens. Deseja continuar?',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Sim',
        rejectLabel: 'Não',
        accept: async () => {
          await atualizarStatusManual(pedido.id, 'entregue');
        },
      });
      return;
    }

    // outros status
    atualizarStatusManual(pedido.id, novoStatus);
  };

  /** Chama API para status simples. */
  const atualizarStatusManual = async (pedidoId, novoStatus) => {
    try {
      await apiEstoque.patch(`/pedidos-fabrica/${pedidoId}/status`, { status: novoStatus });
      toast.current.show({ severity: 'success', summary: 'Status atualizado', detail: `Novo status: ${mapStatusInfo(novoStatus).label}` });
      await carregarPedidos();
      if (pedidoDetalhado?.id === pedidoId) await abrirDetalhes(pedidoId);
    } catch {
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao alterar status' });
    }
  };

  /** Abre os detalhes (opcionalmente executa callback após carregar). */
  const abrirDetalhes = async (pedidoId, cb) => {
    try {
      const { data } = await apiEstoque.get(`/pedidos-fabrica/${pedidoId}`);
      const det = data?.data ?? data;
      setPedidoDetalhado(det);
      cb?.();
    } catch {
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar detalhes' });
    }
  };

  /** Template de status (Tag). */
  const statusTemplate = (rowData) => {
    const s = mapStatusInfo(rowData?.status);
    return <Tag value={<span className="flex align-items-center gap-2"><i className={`pi ${s.icon}`} /> {s.label}</span>} severity={s.severity} />;
  };

  /** Editor de status: chama handleTrocaStatus. */
  const statusEditorTemplate = (rowData) => (
    <Dropdown
      value={rowData.status}
      options={statusOpcoes}
      className="w-13rem"
      onChange={(e) => handleTrocaStatus(rowData, e.value)}
      placeholder="Selecionar status"
    />
  );

  const previsaoTemplate = (rowData) => formatarDataIsoParaBR(rowData.data_previsao_entrega);
  const totalItensTemplate = (rowData) => rowData.itens?.reduce((soma, i) => soma + i.quantidade, 0) ?? 0;

  const acoesTemplate = (rowData) => (
    <div className="flex gap-2">
      <Button icon="pi pi-eye" className="p-button-sm p-button-secondary" tooltip="Detalhes" onClick={() => abrirDetalhes(rowData.id)} />
      <Button icon="pi pi-pencil" className="p-button-sm p-button-info" tooltip="Editar" onClick={() => { setPedidoSelecionado(rowData); setShowForm(true); }} />
      {rowData.status !== 'entregue' && rowData.status !== 'cancelado' && (
        <Button icon="pi pi-times" className="p-button-sm p-button-danger" tooltip="Cancelar Pedido" onClick={() => confirmDialog({
          message: `Cancelar o pedido #${rowData.id}?`,
          header: 'Cancelar Pedido',
          acceptLabel: 'Sim, Cancelar',
          rejectLabel: 'Não',
          icon: 'pi pi-exclamation-triangle',
          accept: async () => await atualizarStatusManual(rowData.id, 'cancelado')
        })} />
      )}
    </div>
  );

  /** Abre diálogo de entrega a partir do botão do item. */
  const abrirEntregaParcial = (item) => {
    setItemSelecionado(item);
    setQtdEntrega(1);
    setObsEntrega('');
    setDepositoEntrega(item.deposito_id ?? null);
    setShowEntregaDialog(true);
  };

  /** Abre diálogo de entrega a partir da troca de status do pedido para "parcial". */
  const abrirEntregaPorPedido = (pedido) => {
    // escolhe primeiro item com saldo
    const itens = (pedido.itens || []).filter(i => (i.quantidade - (i.quantidade_entregue ?? 0)) > 0);
    if (itens.length === 0) {
      toast.current.show({ severity: 'warn', summary: 'Sem saldo', detail: 'Não há itens com saldo para entregar.' });
      return;
    }
    abrirEntregaParcial(itens[0]);
  };

  /** Envia PATCH de entrega com deposito_id. */
  const confirmarEntregaParcial = async () => {
    if (!itemSelecionado || !pedidoDetalhado) return;
    const restante = Math.max(0, (itemSelecionado.quantidade ?? 0) - (itemSelecionado.quantidade_entregue ?? 0));
    if (qtdEntrega < 1 || qtdEntrega > restante) {
      toast.current.show({ severity: 'warn', summary: 'Quantidade inválida', detail: `Informe de 1 a ${restante}.` });
      return;
    }
    try {
      await apiEstoque.patch(`/pedidos-fabrica/itens/${itemSelecionado.id}/entrega`, {
        quantidade: qtdEntrega,
        observacao: obsEntrega || null,
        deposito_id: depositoEntrega ?? itemSelecionado.deposito_id ?? null
      });
      toast.current.show({ severity: 'success', summary: 'Entrega registrada', detail: `+${qtdEntrega} unidade(s)` });
      setShowEntregaDialog(false);
      await abrirDetalhes(pedidoDetalhado.id);
      await carregarPedidos();
    } catch {
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao registrar entrega' });
    }
  };

  /** Botão "Entrega parcial" por item (na tabela de itens do detalhe). */
  const botaoEntregaItem = (item) => {
    const restante = Math.max(0, (item.quantidade ?? 0) - (item.quantidade_entregue ?? 0));
    const desabilitado =
      restante <= 0 ||
      pedidoDetalhado?.status === 'entregue' ||
      pedidoDetalhado?.status === 'cancelado';
    return (
      <Button
        icon="pi pi-truck"
        className="p-button-sm p-button-outlined"
        label="Entrega parcial"
        disabled={desabilitado}
        onClick={() => abrirEntregaParcial(item)}
        tooltip={desabilitado ? 'Sem saldo para entregar' : 'Registrar entrega parcial'}
      />
    );
  };

  /** Header */
  const header = (
    <div className="flex justify-between items-center gap-4">
      <h2 className="m-0">Pedidos para Fábrica</h2>
      <div className="flex gap-2">
        <Dropdown
          value={filtroStatus}
          options={[{ label: 'Todos', value: null }, ...statusOpcoes]}
          onChange={(e) => setFiltroStatus(e.value)}
          placeholder="Filtrar por status"
          className="w-16rem"
          showClear
        />
        <Button label="Novo Pedido" icon="pi pi-plus" onClick={() => { setPedidoSelecionado(null); setShowForm(true); }} />
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
          paginator rows={10}
          loading={loading}
          header={header}
          emptyMessage="Nenhum pedido encontrado"
          rowHover responsiveLayout="scroll"
        >
          <Column field="id" header="ID" style={{ width: '80px' }} />
          <Column header="Status" body={statusTemplate} />
          <Column header="Trocar Status" body={(row) => statusEditorTemplate(row)} style={{ width: '240px' }} />
          <Column header="Previsão Entrega" body={previsaoTemplate} />
          <Column header="Total de Itens" body={totalItensTemplate} />
          <Column header="Observações" field="observacoes" />
          <Column header="Ações" body={acoesTemplate} style={{ width: '160px' }} />
        </DataTable>
      </div>

      <PedidoFabricaForm
        visible={showForm}
        onHide={() => setShowForm(false)}
        onSave={async (dados) => {
          try {
            if (pedidoSelecionado) {
              await apiEstoque.put(`/pedidos-fabrica/${pedidoSelecionado.id}`, dados);
              toast.current.show({ severity: 'success', summary: 'Atualizado', detail: 'Pedido atualizado!' });
            } else {
              await apiEstoque.post('/pedidos-fabrica', dados);
              toast.current.show({ severity: 'success', summary: 'Criado', detail: 'Pedido criado!' });
            }
            carregarPedidos();
          } catch {
            toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao salvar' });
          }
        }}
        pedidoEditavel={pedidoSelecionado}
      />

      {/* Detalhes */}
      <Dialog
        header={pedidoDetalhado ? `Detalhes do Pedido #${pedidoDetalhado.id}` : 'Detalhes'}
        visible={!!pedidoDetalhado}
        onHide={() => setPedidoDetalhado(null)}
        style={{ width: '80vw', maxWidth: 1200 }}
        className="p-fluid"
        modal
      >
        {pedidoDetalhado && (
          <>

            {Array.isArray(pedidoDetalhado?.itens) && pedidoDetalhado.itens.some(i => i.pedido_venda_id) && (
              <div className="mt-2 p-2 border-round surface-border surface-100">
                <h5 className="m-0 mb-2">Pedido(s) de Venda relacionado(s)</h5>
                {Object.values(
                  (pedidoDetalhado.itens || [])
                    .filter(i => i.pedido_venda_id)
                    .reduce((acc, i) => {
                      const pv = i.pedido_venda || {};
                      const key = pv.id || i.pedido_venda_id;
                      if (!acc[key]) {
                        acc[key] = {
                          id: key,
                          numero: pv.numero_externo || pv.id,
                          cliente: pv.cliente?.nome || '—',
                          data: pv.data_pedido ? new Date(pv.data_pedido).toLocaleDateString() : '—',
                        };
                      }
                      return acc;
                    }, {})
                ).map(pv => (
                  <div key={pv.id} className="mb-1">
                    <b>Pedido #</b>{pv.numero}{' · '}
                    <b>Data:</b> {pv.data}{' · '}
                    <b>Cliente:</b> {pv.cliente}
                  </div>
                ))}
              </div>
            )}

            <div className="grid mb-3 mt-3">
              <div className="col-12 md:col-4">
                <label className="block text-500 mb-2">Status</label>
                <div className="flex gap-2 align-items-center">
                  {statusTemplate(pedidoDetalhado)}
                  <Dropdown
                    value={pedidoDetalhado.status}
                    options={statusOpcoes}
                    className="w-13rem"
                    onChange={(e) => handleTrocaStatus(pedidoDetalhado, e.value)}
                    placeholder="Selecionar status"
                  />
                </div>
              </div>
              <div className="col-12 md:col-4">
                <label className="block text-500 mb-2">Previsão</label>
                <div>{formatarDataIsoParaBR(pedidoDetalhado?.data_previsao_entrega)}</div>
              </div>
              <div className="col-12 md:col-4">
                <label className="block text-500 mb-2">Observações</label>
                <div>{pedidoDetalhado?.observacoes || '—'}</div>
              </div>
            </div>

            <h5 className="mt-4 mb-2">Itens do Pedido</h5>
            <DataTable value={pedidoDetalhado?.itens || []} responsiveLayout="stack" rowHover>
              <Column
                header="Venda"
                body={(i) => i.pedido_venda_id
                  ? `#${i.pedido_venda?.numero_externo || i.pedido_venda_id}`
                  : '—'
                }
              />
              <Column
                header="Produto"
                body={(item) => (
                  <div className="flex flex-column">
                    <strong>{item.variacao?.produto?.nome ?? '—'}</strong>
                    <small className="text-500">
                      {item.variacao?.atributos?.map((a) => a.valor).join(', ') || '—'}
                    </small>
                  </div>
                )}
              />
              <Column header="Qtd" body={(i) => i.quantidade} style={{ width: 90 }} />
              <Column header="Entregue" body={(i) => i.quantidade_entregue ?? 0} style={{ width: 110 }} />
              <Column header="Depósito" body={(i) => i.deposito?.nome || '—'} />
              <Column header="Obs." body={(i) => i.observacoes || '—'} />
              <Column header="Ações" body={(i) => (
                <div className="flex gap-2">
                  {botaoEntregaItem(i)}
                </div>
              )} style={{ width: 200 }} />
            </DataTable>

            {/* Timeline — estilo Chamados */}
            <h5 className="mt-4 mb-2">Timeline</h5>
            <Timeline
              value={pedidoDetalhado?.logs || []}
              align="alternate"
              content={(e) => (
                <div className="p-2">
                  <div className="font-bold">{e.mensagem}</div>
                  <div className="text-500 text-sm">
                    {e.status_de || '—'}{e.status_de || e.status_para ? ' → ' : ''}{e.status_para || '—'}
                  </div>
                  <div className="text-500 text-sm">{e.created_at ? new Date(e.created_at).toLocaleString() : ''}</div>
                </div>
              )}
              marker={(e) => (
                <span className={`p-avatar p-component p-avatar-circle p-overlay-badge ${e.tipo === 'status' ? 'bg-blue-300' : 'bg-green-300'}`}
                      style={{ width: '1rem', height: '1rem' }} />
              )}
            />
          </>
        )}
      </Dialog>

      {/* Diálogo de Entrega (item/quantidade/depósito/obs) */}
      <Dialog
        header="Registrar entrega"
        visible={showEntregaDialog}
        onHide={() => setShowEntregaDialog(false)}
        modal
        style={{ width: '32rem' }}
        footer={
          <div className="flex justify-content-end gap-2">
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={() => setShowEntregaDialog(false)} />
            <Button label="Confirmar" icon="pi pi-check" onClick={confirmarEntregaParcial} />
          </div>
        }
      >
        {itemSelecionado && (
          <div className="p-fluid">
            {/* Se a origem for pedido, permita trocar o item */}
            {Array.isArray(pedidoDetalhado?.itens) && pedidoDetalhado.itens.length > 0 && (
              <div className="field">
                <label className="font-bold mb-1 block">Item</label>
                <Dropdown
                  value={itemSelecionado?.id}
                  options={(pedidoDetalhado.itens || [])
                    .filter(i => (i.quantidade - (i.quantidade_entregue ?? 0)) > 0)
                    .map(i => ({ label: i.variacao?.nome_completo || `Item #${i.id}`, value: i.id }))}
                  onChange={(e) => {
                    const novo = (pedidoDetalhado.itens || []).find(i => i.id === e.value);
                    setItemSelecionado(novo || itemSelecionado);
                    setDepositoEntrega((novo?.deposito_id) ?? null);
                    setQtdEntrega(1);
                  }}
                  placeholder="Selecione um item"
                />
              </div>
            )}

            <div className="field">
              <label className="font-bold mb-1 block">Quantidade a entregar</label>
              <InputNumber
                value={qtdEntrega}
                onValueChange={(e) => setQtdEntrega(e.value || 0)}
                min={1}
                max={Math.max(1, (itemSelecionado.quantidade ?? 0) - (itemSelecionado.quantidade_entregue ?? 0))}
                showButtons
              />
              <small className="block mt-2 text-500">
                Restante: {(itemSelecionado.quantidade ?? 0) - (itemSelecionado.quantidade_entregue ?? 0)} unid
              </small>
            </div>

            <div className="field">
              <label className="font-bold mb-1 block">Depósito</label>
              <Dropdown
                value={depositoEntrega}
                options={depositos}
                onChange={(e) => setDepositoEntrega(e.value)}
                placeholder="Selecione um depósito"
                showClear
              />
              <small className="block text-500 mt-1">Pré-selecionado com o depósito do item (se houver).</small>
            </div>

            <div className="field">
              <label className="font-bold mb-1 block">Observação (opcional)</label>
              <InputTextarea rows={3} value={obsEntrega} onChange={(e) => setObsEntrega(e.target.value)} />
            </div>
          </div>
        )}
      </Dialog>
    </SakaiLayout>
  );
};

export default PedidosFabrica;
