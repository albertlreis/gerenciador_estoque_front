import React, { useRef, useState, useEffect, useMemo } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { addLocale } from 'primereact/api';

import SakaiLayout from '../layouts/SakaiLayout';
import PedidosFiltro from '../components/PedidosFiltro';
import PedidosExportar from '../components/PedidosExportar';
import PedidoStatusDialog from '../components/PedidoStatusDialog';
import PedidoDetalhado from '../components/PedidoDetalhado';
import PedidoForm from '../components/PedidoForm';
import { usePedidos } from '../hooks/usePedidos';
import { usePedidosFiltros } from '../hooks/relatorios/usePedidosFiltros';
import { formatarReal, formatarDataParaISO } from '../utils/formatters';
import { STATUS_MAP } from '../constants/statusPedido';
import api from '../services/apiEstoque';
import AuthApi from '../api/authApi';
import { formatarDataIsoParaBR } from "../utils/formatarData";
import ColumnSelector from "../components/ColumnSelector";
import DialogDevolucao from "../components/DialogDevolucao";
import usePermissions from '../hooks/usePermissions';
import { PERMISSOES } from '../constants/permissoes';

addLocale('pt-BR', {
  firstDayOfWeek: 0,
  dayNames: ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'],
  dayNamesShort: ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'],
  dayNamesMin: ['D','S','T','Q','Q','S','S'],
  monthNames: ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'],
  monthNamesShort: ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'],
  today: 'Hoje',
  clear: 'Limpar',
  chooseDate: 'Escolher data',
  dateFormat: 'dd/mm/yy',
  allSelected: 'Todos selecionados',
  noResultsFound: 'Nenhum resultado encontrado',
  selectAll: 'Selecionar todos',
  unselectAll: 'Desmarcar todos',
});

export default function PedidosListagem() {
  const toast = useRef(null);
  const [filtros, setFiltros] = useState({ texto: '', status: null, tipo: 'todos', periodo: null });
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [exibirDialogStatus, setExibirDialogStatus] = useState(false);
  const [pedidoDetalhado, setPedidoDetalhado] = useState(null);
  const [pedidoEmEdicao, setPedidoEmEdicao] = useState(null);
  const [exibirDialogEdicao, setExibirDialogEdicao] = useState(false);
  const [loadingEdicao, setLoadingEdicao] = useState(false);
  const [depositos, setDepositos] = useState([]);
  const [vendedoresExtras, setVendedoresExtras] = useState([]);
  const [pedidoParaDevolucao, setPedidoParaDevolucao] = useState(null);
  const [detalhesVisivel, setDetalhesVisivel] = useState(false);
  const [loadingDetalhes, setLoadingDetalhes] = useState(false);
  const [loadingPdfId, setLoadingPdfId] = useState(null);

  const { pedidos, total, paginaAtual, loading, fetchPedidos, setPaginaAtual } = usePedidos(filtros);
  const { has } = usePermissions();
  const podeEditar = has(PERMISSOES.PEDIDOS.EDITAR);
  const podeSelecionarVendedor = has(PERMISSOES.PEDIDOS.SELECIONAR_VENDEDOR);

  const { clientesOpts, parceirosOpts, vendedoresOpts } = usePedidosFiltros({
    enabled: exibirDialogEdicao,
    toastRef: toast,
  });

  const vendedoresDisponiveis = useMemo(() => {
    const map = new Map();
    [...(vendedoresOpts || []), ...(vendedoresExtras || [])].forEach((v) => {
      if (!v || v.value === undefined || v.value === null) return;
      const key = Number(v.value);
      if (!map.has(key)) map.set(key, v);
    });
    return Array.from(map.values());
  }, [vendedoresOpts, vendedoresExtras]);

  const isEstadoFinal = (status) => (
    ['entrega_cliente','finalizado','consignado','devolucao_consignacao'].includes(status ?? '')
  );

  const severidadeEntrega = (diasUteisRestantes, atrasadoEntrega) => {
    if (atrasadoEntrega) return 'danger';
    if (diasUteisRestantes === 0) return 'warning';
    if (diasUteisRestantes <= 7) return 'info';
    return 'success';
  };

  const situacaoEntregaBody = (row) => {
    const situacaoEntrega = row.situacao_entrega;

    if (situacaoEntrega) {
      const diasAtraso = Number(row.dias_atraso ?? 0);

      if (situacaoEntrega === 'Entregue') {
        return <Tag value="Entregue" icon="pi pi-check-circle" severity="success" className="text-xs" rounded />;
      }

      if (situacaoEntrega === 'Cancelado') {
        return <Tag value="Cancelado" icon="pi pi-times-circle" severity="danger" className="text-xs" rounded />;
      }

      if (situacaoEntrega === 'Atrasado') {
        const label = diasAtraso > 0 ? `Atrasado (${diasAtraso} dia(s))` : 'Atrasado';
        return <Tag value={label} icon="pi pi-exclamation-triangle" severity="danger" className="text-xs" rounded />;
      }

      if (situacaoEntrega === 'Entrega hoje') {
        return <Tag value="Entrega hoje" icon="pi pi-clock" severity="warning" className="text-xs" rounded />;
      }

      if (situacaoEntrega === 'No prazo') {
        return <Tag value="No prazo" icon="pi pi-check" severity="info" className="text-xs" rounded />;
      }
    }

    // Se o backend considerar que não conta prazo, virá null/false; render tratada aqui
    const d = row.dias_uteis_restantes;
    const atrasado = row.atrasado_entrega;
    const status = row.status;

    // Estados finais/que não contam prazo: mostra um badge estático
    if (isEstadoFinal(status)) {
      const map = {
        entrega_cliente: { label: 'Entregue', severity: 'success', icon: 'pi pi-check-circle' },
        finalizado: { label: 'Finalizado', severity: 'success', icon: 'pi pi-verified' },
        consignado: { label: 'Consignado', severity: 'info', icon: 'pi pi-inbox' },
        devolucao_consignacao: { label: 'Devolução', severity: 'warning', icon: 'pi pi-undo' },
      };
      const cfg = map[status] ?? { label: '—', severity: 'secondary' };
      return <Tag value={cfg.label} icon={cfg.icon} severity={cfg.severity} className="text-xs" rounded />;
    }

    // Quando ainda conta prazo mas backend não mandou data limite
    if (d === null || d === undefined) {
      return <span className="text-500 text-xs">—</span>;
    }

    // Contador normal
    const texto = atrasado ? `${Math.abs(d)} dia(s) úteis em atraso` : `${d} dia(s) úteis`;
    return (
      <Tag
        value={texto}
        severity={severidadeEntrega(d, atrasado)}
        rounded
        className="text-xs"
        title={atrasado ? 'Entrega atrasada' : 'Dias úteis restantes até a entrega prevista'}
      />
    );
  };

  const entregaPrevistaBody = (row) => {
    const dataEntregaPrevista = row.entrega_prevista || row.data_limite_entrega;
    return dataEntregaPrevista ? formatarDataIsoParaBR(dataEntregaPrevista) : '—';
  };

  const prazoBody = (row) => row.prazo_dias_uteis ?? 60;

  const depositosOpts = useMemo(
    () => (depositos || []).map((d) => ({ label: d.nome ?? d.label ?? `Deposito #${d.id}`, value: d.id })),
    [depositos]
  );

  const colunasDisponiveis = useMemo(() => [
    { field: 'numero', header: 'Nº Pedido', body: (row) => row.numero_externo || row.id },
    { field: 'data', header: 'Data', body: (row) => row.data ? formatarDataIsoParaBR(row.data) : '-' },
    { field: 'cliente', header: 'Cliente', body: (row) => row.cliente?.nome ?? '-' },
    { field: 'parceiro', header: 'Parceiro', body: (row) => row.parceiro?.nome ?? '-' },
    { field: 'vendedor', header: 'Vendedor', body: (row) => row.vendedor?.nome ?? '-' },
    { field: 'valor_total', header: 'Total', body: (row) => formatarReal(row.valor_total) },
    { field: 'status', header: 'Status', body: (row) => statusTemplate(row) },
    { field: 'data_ultimo_status', header: 'Última Atualização', body: (row) => dataStatusBody(row) },
    { field: 'prazo_dias_uteis', header: 'Prazo (úteis)', body: prazoBody },
    { field: 'entrega_prevista', header: 'Entrega prevista', body: entregaPrevistaBody },
    { field: 'situacao_entrega', header: 'Situação da entrega', body: situacaoEntregaBody },
  ], []);

  const [colunasVisiveis, setColunasVisiveis] = useState(colunasDisponiveis);

  useEffect(() => {
    fetchPedidos(1, filtros).catch(r => console.log("Erro: ", r));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!exibirDialogEdicao) return;
    let alive = true;

    (async () => {
      try {
        const { data } = await api.get('/depositos');
        if (!alive) return;
        const lista = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        setDepositos(lista);
      } catch (err) {
        if (!alive) return;
        toast.current?.show({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar depositos',
        });
        setDepositos([]);
      }
    })();

    return () => {
      alive = false;
    };
  }, [exibirDialogEdicao]);

  useEffect(() => {
    if (!exibirDialogEdicao || !podeSelecionarVendedor) return;

    const vendedorId = pedidoEmEdicao?.id_usuario;
    if (!vendedorId) return;

    const existe = vendedoresDisponiveis.some((v) => Number(v.value) === Number(vendedorId));
    if (existe) return;

    let alive = true;
    (async () => {
      try {
        const { data } = await AuthApi.usuarios.buscar(vendedorId);
        const usuario = data?.data ?? data;
        if (!alive || !usuario?.id) return;

        setVendedoresExtras((prev) => {
          const jaExiste = prev.some((v) => Number(v.value) === Number(usuario.id));
          if (jaExiste) return prev;
          return [
            ...prev,
            { label: usuario.nome ?? usuario.email ?? `Vendedor #${usuario.id}`, value: usuario.id },
          ];
        });
      } catch (err) {
        if (!alive) return;
        toast.current?.show({
          severity: 'warn',
          summary: 'Vendedor',
          detail: 'Nao foi possivel carregar o vendedor atual.',
        });
      }
    })();

    return () => {
      alive = false;
    };
  }, [exibirDialogEdicao, podeSelecionarVendedor, pedidoEmEdicao?.id_usuario, vendedoresDisponiveis]);

  useEffect(() => {
    const listener = (e) => setPedidoParaDevolucao(e.detail);
    window.addEventListener('abrir-dialog-devolucao', listener);
    return () => window.removeEventListener('abrir-dialog-devolucao', listener);
  }, []);

  const onPageChange = (e) => {
    const novaPagina = Math.floor(e.first / 10) + 1;
    setPaginaAtual(novaPagina);
    fetchPedidos(novaPagina).catch(r => console.log("Erro: ", r));
  };

  const handleBuscar = (override) => {
    const efetivos = override ?? filtros;
    setPaginaAtual(1);
    fetchPedidos(1, efetivos).catch(r => console.log("Erro: ", r));
  };

  const statusTemplate = (rowData) => {
    const status = STATUS_MAP[rowData.status];
    if (!status) return <Tag value={rowData.status} />;
    return (
      <Tag
        value={status.label}
        icon={status.icon}
        severity={status.color}
        className="text-sm"
      />
    );
  };

  const abrirEdicaoPedido = async (pedido) => {
    setExibirDialogEdicao(true);
    setLoadingEdicao(true);
    try {
      const { data } = await api.get(`/pedidos/${pedido.id}/detalhado`);
      setPedidoEmEdicao(data?.data ?? data);
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro ao carregar pedido',
        detail: err.response?.data?.message || err.message,
      });
      setPedidoEmEdicao(null);
      setExibirDialogEdicao(false);
    } finally {
      setLoadingEdicao(false);
    }
  };

  const fecharEdicaoPedido = () => {
    setExibirDialogEdicao(false);
    setPedidoEmEdicao(null);
  };

  const salvarPedidoEdicao = async (dados) => {
    if (!pedidoEmEdicao?.id) return;

    const payload = {
      tipo: dados.tipo,
      numero_externo: dados.numero_externo,
      id_cliente: dados.id_cliente,
      id_parceiro: dados.id_parceiro,
      data_pedido: formatarDataParaISO(dados.data_pedido),
      prazo_dias_uteis: dados.prazo_dias_uteis,
      data_limite_entrega: dados.data_limite_entrega ? formatarDataParaISO(dados.data_limite_entrega) : null,
      observacoes: dados.observacoes,
      itens: (dados.itens || []).map((item) => ({
        id: item.id ?? null,
        id_variacao: item.id_variacao ?? item.variacao_id ?? null,
        id_produto: item.produto_id ?? null,
        quantidade: item.quantidade,
        preco_unitario: item.preco_unitario,
        id_deposito: item.id_deposito ?? null,
        observacoes: item.observacoes ?? null,
      })),
    };

    if (podeSelecionarVendedor) {
      payload.id_usuario = dados.id_usuario ?? null;
    }

    const response = await api.put(`/pedidos/${pedidoEmEdicao.id}`, payload);
    const pedidoAtualizado = response?.data?.data ?? response?.data ?? null;

    toast.current?.show({
      severity: 'success',
      summary: 'Pedido atualizado',
    });

    setPedidoEmEdicao(pedidoAtualizado);
    setExibirDialogEdicao(false);

    await fetchPedidos(paginaAtual);
    if (detalhesVisivel && pedidoEmEdicao?.id) {
      await carregarDetalhesPedido({ id: pedidoEmEdicao.id });
    }
  };

  const carregarDetalhesPedido = async (pedido) => {
    setLoadingDetalhes(true);
    setDetalhesVisivel(true);
    try {
      const { data } = await api.get(`/pedidos/${pedido.id}/detalhado`);
      setPedidoDetalhado(data.data);
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro ao carregar detalhes',
        detail: err.response?.data?.message || err.message
      });
      setPedidoDetalhado(null);
      setDetalhesVisivel(false);
    } finally {
      setLoadingDetalhes(false);
    }
  };

  const gerarPdfPedido = async (pedidoId) => {
    try {
      setLoadingPdfId(pedidoId);

      const response = await api.get(`/pedidos/${pedidoId}/pdf/roteiro`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `roteiro_pedido_${pedidoId}.pdf`;
      link.click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro ao gerar PDF',
        detail: err.response?.data?.message || err.message
      });
    } finally {
      setLoadingPdfId(null);
    }
  };

  const dataStatusBody = (row) => {
    const dataStatus = formatarDataIsoParaBR(row.data_ultimo_status);
    const previsao = row.previsao ? formatarDataIsoParaBR(row.previsao) : null;

    return (
      <div className="flex align-items-center gap-2">
        <span>{dataStatus}</span>
        {previsao && (
          <span
            className="text-500 text-sm"
            title={`Previsão de ${row.proximo_status_label ?? 'próximo status'}: ${previsao}`}
          >
            <i className="pi pi-clock" />
          </span>
        )}
        {row.atrasado && (
          <i
            className="pi pi-exclamation-triangle text-red-500"
            title="Pedido em atraso no fluxo"
          />
        )}
      </div>
    );
  };

  return (
    <SakaiLayout>
      <Toast ref={toast} />

      <PedidoStatusDialog
        visible={exibirDialogStatus}
        onHide={() => setExibirDialogStatus(false)}
        pedido={pedidoSelecionado}
        toast={toast}
        onSalvo={() => fetchPedidos(paginaAtual)}
      />

      <PedidoDetalhado
        visible={detalhesVisivel}
        onHide={() => {
          setDetalhesVisivel(false);
          setPedidoDetalhado(null);
        }}
        pedido={pedidoDetalhado}
        loading={loadingDetalhes}
      />

      <Dialog
        header={`Editar Pedido${pedidoEmEdicao?.numero_externo ? ` #${pedidoEmEdicao.numero_externo}` : ''}`}
        visible={exibirDialogEdicao}
        onHide={fecharEdicaoPedido}
        style={{ width: '80vw' }}
        modal
      >
        {loadingEdicao ? (
          <div>Carregando...</div>
        ) : (
          <PedidoForm
            initialData={pedidoEmEdicao || {}}
            clientes={clientesOpts}
            parceiros={parceirosOpts}
            vendedores={vendedoresDisponiveis}
            depositos={depositosOpts}
            permitirSelecionarVendedor={podeSelecionarVendedor}
            onSubmit={salvarPedidoEdicao}
            onCancel={fecharEdicaoPedido}
          />
        )}
      </Dialog>

      <div className="p-4">
        <div className="flex flex-wrap gap-4 justify-content-between align-items-end mb-3">
          <PedidosFiltro
            filtros={filtros}
            setFiltros={setFiltros}
            onBuscar={handleBuscar}
          />

          <PedidosExportar toast={toast} loading={loading}/>
        </div>

        <h2 className="mb-3">Pedidos</h2>

        <ColumnSelector
          columns={colunasDisponiveis}
          value={colunasVisiveis}
          onChange={setColunasVisiveis}
          storageKey="colunasPedidos"
        />

        <DataTable
          value={pedidos}
          paginator
          lazy
          rows={10}
          totalRecords={total}
          first={(paginaAtual - 1) * 10}
          onPage={onPageChange}
          loading={loading}
          emptyMessage="Nenhum pedido encontrado."
          scrollable
          responsiveLayout="scroll"
          rowClassName={(row) => (row.situacao_entrega === 'Atrasado' || (row.dias_uteis_restantes !== null && row.atrasado_entrega)) ? 'linha-atrasada' : ''}
          className="text-sm"
          size="small"
        >
          <Column
            header=""
            body={(row) => (
              <Button
                icon="pi pi-refresh"
                severity="secondary"
                onClick={() => {
                  setPedidoSelecionado(row);
                  setExibirDialogStatus(true);
                }}
                tooltip="Atualizar status"
              />
            )}
          />
          <Column
            header=""
            body={(row) => (
              <Button
                icon="pi pi-eye"
                severity="info"
                onClick={() => carregarDetalhesPedido(row)}
                tooltip="Ver detalhes"
              />
            )}
          />

          {podeEditar && (
            <Column
              header=""
              body={(row) => (
                <Button
                  icon="pi pi-pencil"
                  severity="warning"
                  onClick={() => abrirEdicaoPedido(row)}
                  tooltip="Editar pedido"
                />
              )}
            />
          )}

          <Column
            header=""
            body={(row) => {
              const disabled = loading || loadingPdfId === row.id;

              if (row.status !== 'consignado') return null;

              return (
                <Button
                  icon={loadingPdfId === row.id ? 'pi pi-spin pi-spinner' : 'pi pi-file-pdf'}
                  severity="danger"
                  onClick={() => gerarPdfPedido(row.id)}
                  tooltip={row.status === 'consignado' ? 'Roteiro de consignação (PDF)' : 'Roteiro do pedido (PDF)'}
                  loading={loadingPdfId === row.id}
                  disabled={disabled}
                />
              );
            }}
          />

          {colunasVisiveis.map((col) => (
            <Column
              key={col.field}
              field={col.field}
              header={col.header}
              body={col.body}
              style={{minWidth: '140px'}}
            />
          ))}

          <Column
            header=""
            body={(row) => {
              return row.tem_devolucao
                ? (
                  <Tag
                    value="Devolução/Troca"
                    icon="pi pi-exchange"
                    severity="warning"
                    className="text-xs px-2 py-1"
                    title="Este pedido possui devoluções ou trocas"
                  />
                )
                : null;
            }}
            style={{ minWidth: '140px' }}
          />
        </DataTable>
      </div>

      {pedidoParaDevolucao && (
        <DialogDevolucao
          pedido={pedidoParaDevolucao}
          onHide={() => setPedidoParaDevolucao(null)}
          onSucesso={async () => {
            toast.current?.show({
              severity: 'success',
              summary: 'Devolução registrada com sucesso'
            });

            await fetchPedidos(paginaAtual);
            if (detalhesVisivel && pedidoParaDevolucao?.id) {
              await carregarDetalhesPedido(pedidoParaDevolucao);
            }
          }}
        />
      )}

    </SakaiLayout>
  );
}
