import React, { useRef, useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Menubar } from 'primereact/menubar';
import { useNavigate } from 'react-router-dom';
import { addLocale } from 'primereact/api';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';

import PedidosFiltro from '../components/PedidosFiltro';
import ProdutosDetalhes from '../components/ProdutosDetalhes';
import PedidosExportar from '../components/PedidosExportar';
import { usePedidos } from '../hooks/usePedidos';
import { formatarReal } from '../utils/formatters';

addLocale('pt-BR', {
  firstDayOfWeek: 0,
  dayNames: ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'],
  dayNamesShort: ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'],
  dayNamesMin: ['D','S','T','Q','Q','S','S'],
  monthNames: ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'],
  monthNamesShort: ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'],
  today: 'Hoje',
  clear: 'Limpar'
});

const statusTemplate = (rowData) => {
  const statusMap = {
    pendente: 'warning', andamento: 'info', concluido: 'success', cancelado: 'danger'
  };
  return <Tag severity={statusMap[rowData.status]} value={rowData.status} />;
};

export default function PedidosListagem() {
  const toast = useRef(null);
  const overlayRef = useRef(null);
  const navigate = useNavigate();

  const [filtros, setFiltros] = useState({ texto: '', status: null, tipo: 'todos', periodo: null });
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);

  const { pedidos, total, paginaAtual, loading, fetchPedidos, setPaginaAtual } = usePedidos(filtros);

  useEffect(() => { fetchPedidos(1); }, []);

  const onPageChange = (e) => {
    const novaPagina = Math.floor(e.first / 10) + 1;
    setPaginaAtual(novaPagina);
    fetchPedidos(novaPagina);
  };

  const menuItems = [
    { label: 'Início', icon: 'pi pi-home', command: () => navigate('/') },
    { label: 'Clientes', icon: 'pi pi-fw pi-user', command: () => navigate('/clientes') },
    { label: 'Pedidos', icon: 'pi pi-fw pi-shopping-cart', command: () => navigate('/pedidos') }
  ];

  return (
    <div className="p-4">
      <Menubar model={menuItems} className="mb-4 shadow-2" />
      <Toast ref={toast} />

      <div className="flex flex-wrap gap-3 mb-3 align-items-end justify-content-between">
        <PedidosFiltro filtros={filtros} setFiltros={setFiltros} onBuscar={() => fetchPedidos(1)}/>
        <PedidosExportar toast={toast} loading={loading}/>
      </div>

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
        <Column header="Produtos" body={(row) => (
          <Button icon="pi pi-eye" onClick={(e) => { setPedidoSelecionado(row); overlayRef.current.toggle(e); }} />
        )} />
      </DataTable>

      <OverlayPanel ref={overlayRef} showCloseIcon dismissable>
        <ProdutosDetalhes pedido={pedidoSelecionado} />
      </OverlayPanel>
    </div>
  );
}
