import React, { useRef, useState, useEffect, useMemo } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { addLocale } from 'primereact/api';

import SakaiLayout from '../layouts/SakaiLayout';
import PedidosFiltro from '../components/PedidosFiltro';
import PedidosExportar from '../components/PedidosExportar';
import PedidoStatusDialog from '../components/PedidoStatusDialog';
import PedidoDetalhado from '../components/PedidoDetalhado';
import { usePedidos } from '../hooks/usePedidos';
import { formatarReal } from '../utils/formatters';
import { STATUS_MAP } from '../constants/statusPedido';
import api from '../services/apiEstoque';
import {formatarDataIsoParaBR} from "../utils/formatarData";
import ColumnSelector from "../components/ColumnSelector";
import DialogDevolucao from "../components/DialogDevolucao";


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
  const [pedidoParaDevolucao, setPedidoParaDevolucao] = useState(null);
  const [detalhesVisivel, setDetalhesVisivel] = useState(false);
  const [loadingDetalhes, setLoadingDetalhes] = useState(false);

  const { pedidos, total, paginaAtual, loading, fetchPedidos, setPaginaAtual } = usePedidos(filtros);

  const colunasDisponiveis = useMemo(() => [
    { field: 'numero', header: 'Nº Pedido', body: (row) => row.numero_externo || row.id },
    { field: 'data', header: 'Data', body: (row) => row.data ? formatarDataIsoParaBR(row.data) : '-' },
    { field: 'cliente', header: 'Cliente', body: (row) => row.cliente?.nome ?? '-' },
    { field: 'parceiro', header: 'Parceiro', body: (row) => row.parceiro?.nome ?? '-' },
    { field: 'vendedor', header: 'Vendedor', body: (row) => row.vendedor?.nome ?? '-' },
    { field: 'valor_total', header: 'Total', body: (row) => formatarReal(row.valor_total) },
    { field: 'status', header: 'Status', body: (row) => statusTemplate(row) },
    { field: 'data_ultimo_status', header: 'Última Atualização', body: (row) => dataStatusBody(row) },
  ], []);

  const [colunasVisiveis, setColunasVisiveis] = useState(colunasDisponiveis);

  useEffect(() => { fetchPedidos(1); }, []);

  useEffect(() => {
    const listener = (e) => setPedidoParaDevolucao(e.detail);
    window.addEventListener('abrir-dialog-devolucao', listener);
    return () => window.removeEventListener('abrir-dialog-devolucao', listener);
  }, []);

  const onPageChange = (e) => {
    const novaPagina = Math.floor(e.first / 10) + 1;
    setPaginaAtual(novaPagina);
    fetchPedidos(novaPagina);
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

  const carregarDetalhesPedido = async (pedido) => {
    setLoadingDetalhes(true);
    setDetalhesVisivel(true);
    try {
      const { data } = await api.get(`/pedidos/${pedido.id}/completo`);
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
          <>
            <i
              className="pi pi-exclamation-triangle text-red-500"
              title="Pedido em atraso"
            />
          </>
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

      <div className="p-4">
        <div className="flex flex-wrap gap-4 justify-content-between align-items-end mb-3">
          <PedidosFiltro filtros={filtros} setFiltros={setFiltros} onBuscar={() => fetchPedidos(1)}/>
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
          rowClassName={(row) => row.atrasado ? 'linha-atrasada' : ''}
          className="text-sm"
          size="small"
        >
          {colunasVisiveis.map((col) => (
            <Column
              key={col.field}
              field={col.field}
              header={col.header}
              body={col.body}
              style={{minWidth: '120px'}}
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
        </DataTable>
      </div>

      {pedidoParaDevolucao && (
        <DialogDevolucao
          pedido={pedidoParaDevolucao}
          onHide={() => setPedidoParaDevolucao(null)}
          onSucesso={() => {
            toast.current?.show({
              severity: 'success',
              summary: 'Devolução registrada com sucesso'
            });
            fetchPedidos(paginaAtual);
          }}
        />
      )}

    </SakaiLayout>
  );
}
