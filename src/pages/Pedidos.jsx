import React, { useRef, useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { addLocale } from 'primereact/api';

import SakaiLayout from '../layouts/SakaiLayout';
import PedidosFiltro from '../components/PedidosFiltro';
import ProdutosDetalhes from '../components/ProdutosDetalhes';
import PedidosExportar from '../components/PedidosExportar';
import PedidoStatusDialog from '../components/PedidoStatusDialog';
import { usePedidos } from '../hooks/usePedidos';
import { formatarReal } from '../utils/formatters';

const statusMapDetalhado = {
  pedido_criado:     { label: 'Criado', color: 'secondary', icon: 'pi pi-plus' },
  pedido_enviado_fabrica: { label: 'Enviado à Fábrica', color: 'info', icon: 'pi pi-send' },
  nota_emitida:      { label: 'Nota Emitida', color: 'success', icon: 'pi pi-file' },
  previsao_envio_cliente: { label: 'Previsão de Envio', color: 'warning', icon: 'pi pi-clock' },
  embarque_fabrica:  { label: 'Embarcado', color: 'info', icon: 'pi pi-truck' },
  nota_recebida_compra: { label: 'Nota Recebida', color: 'success', icon: 'pi pi-file-check' },
  entrega_estoque:   { label: 'Entrega Estoque', color: 'success', icon: 'pi pi-box' },
  envio_cliente:     { label: 'Enviado ao Cliente', color: 'warning', icon: 'pi pi-send' },
  entrega_cliente:   { label: 'Entregue', color: 'success', icon: 'pi pi-check' },
  consignado:        { label: 'Consignado', color: 'info', icon: 'pi pi-briefcase' },
  devolucao_consignacao: { label: 'Devolvido', color: 'danger', icon: 'pi pi-undo' },
  finalizado:        { label: 'Finalizado', color: 'success', icon: 'pi pi-check-circle' },
};

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
});

export default function PedidosListagem() {
  const toast = useRef(null);
  const overlayRef = useRef(null);
  const [filtros, setFiltros] = useState({ texto: '', status: null, tipo: 'todos', periodo: null });
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [exibirDialogStatus, setExibirDialogStatus] = useState(false);
  const { pedidos, total, paginaAtual, loading, fetchPedidos, setPaginaAtual } = usePedidos(filtros);

  useEffect(() => { fetchPedidos(1); }, []);

  const onPageChange = (e) => {
    const novaPagina = Math.floor(e.first / 10) + 1;
    setPaginaAtual(novaPagina);
    fetchPedidos(novaPagina);
  };

  const statusTemplate = (rowData) => {
    const status = statusMapDetalhado[rowData.status];
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

  return (
    <SakaiLayout>
      <Toast ref={toast} />
      <OverlayPanel ref={overlayRef} showCloseIcon dismissable>
        <ProdutosDetalhes pedido={pedidoSelecionado} />
      </OverlayPanel>

      <PedidoStatusDialog
        visible={exibirDialogStatus}
        onHide={() => setExibirDialogStatus(false)}
        pedido={pedidoSelecionado}
        toast={toast}
        onSalvo={() => fetchPedidos(paginaAtual)}
      />

      <div className="p-4">
        <div className="flex flex-wrap gap-4 justify-content-between align-items-end mb-3">
          <PedidosFiltro filtros={filtros} setFiltros={setFiltros} onBuscar={() => fetchPedidos(1)} />
          <PedidosExportar toast={toast} loading={loading} />
        </div>

        <h2 className="mb-3">Pedidos</h2>

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
        >
          <Column field="id" header="Nº Pedido" style={{ minWidth: '120px' }} />
          <Column header="Data" body={(row) => row.data ? new Date(row.data).toLocaleDateString('pt-BR') : '-'} />
          <Column header="Cliente" body={(row) => row.cliente?.nome ?? '-'} />
          <Column header="Parceiro" body={(row) => row.parceiro?.nome ?? '-'} />
          <Column header="Total" body={(row) => formatarReal(row.valor_total)} />
          <Column field="status" header="Status" body={statusTemplate} />
          <Column
            header="Ações"
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
            header="Produtos"
            body={(row) => (
              <Button
                icon="pi pi-eye"
                onClick={(e) => {
                  setPedidoSelecionado(row);
                  overlayRef.current.toggle(e);
                }}
              />
            )}
          />
        </DataTable>
      </div>
    </SakaiLayout>
  );
}
