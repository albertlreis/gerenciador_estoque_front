import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { OverlayPanel } from 'primereact/overlaypanel';
import apiEstoque from '../services/apiEstoque';
import { Menubar } from 'primereact/menubar';
import {useNavigate} from "react-router-dom";


const statusOptions = [
  { label: 'Todos', value: null },
  { label: 'Pendente', value: 'pendente' },
  { label: 'Em andamento', value: 'andamento' },
  { label: 'Concluído', value: 'concluido' },
  { label: 'Cancelado', value: 'cancelado' },
];

export default function PedidosListagem() {
  const [pedidos, setPedidos] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState(null);
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroData, setFiltroData] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);
  const navigate = useNavigate();
  const overlayRef = useRef(null);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      const { data } = await apiEstoque.get('/pedidos');
      setPedidos(data);
    } catch (error) {
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar pedidos.' });
    } finally {
      setLoading(false);
    }
  };

  const exportarPedidos = async (formato, detalhado = false) => {
    try {
      const params = new URLSearchParams({ formato });
      if (detalhado) params.append('detalhado', 'true');

      const response = await apiEstoque.get(`/pedidos/exportar?${params.toString()}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `pedidos${detalhado ? '-detalhado' : ''}.${formato === 'pdf' ? 'pdf' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.current.show({ severity: 'error', summary: 'Erro', detail: `Falha ao exportar (${formato}).` });
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  const statusTemplate = (rowData) => {
    const statusMap = {
      pendente: 'warning',
      andamento: 'info',
      concluido: 'success',
      cancelado: 'danger',
    };
    return <Tag severity={statusMap[rowData.status]} value={rowData.status} />;
  };

  const acoesTemplate = (rowData) => (
    <>
      <Button icon="pi pi-eye" className="p-button-rounded p-button-text" onClick={(e) => {
        setPedidoSelecionado(rowData);
        overlayRef.current.toggle(e);
      }} />
    </>
  );

  const produtosDetalhes = () => (
    <div className="p-3" style={{ width: '300px' }}>
      <h4>Produtos</h4>
      {pedidoSelecionado?.produtos?.map((p, i) => (
        <li key={i}>
          {p.nome} - {p.quantidade}x R$ {Number(p.valor ?? 0).toFixed(2)}
        </li>
      ))}

      {pedidoSelecionado?.observacoes && (
        <>
          <h5>Observações</h5>
          <p>{pedidoSelecionado.observacoes}</p>
        </>
      )}
    </div>
  );

  const pedidosFiltrados = pedidos.filter(p => {
    const texto = filtroTexto.toLowerCase();
    const cliente = typeof p.cliente === 'string' ? p.cliente.toLowerCase() : '';
    const numero = typeof p.numero === 'string' ? p.numero : '';

    return (
      (!filtroStatus || p.status === filtroStatus) &&
      (!filtroData || p.data === filtroData.toISOString().split('T')[0]) &&
      (cliente.includes(texto) || numero.includes(filtroTexto))
    );
  });

  const menuItems = [
    {
      label: 'Início',
      icon: 'pi pi-home',
      command: () => navigate('/')
    },
    {
      label: 'Clientes',
      key: 'clientes',
      icon: 'pi pi-fw pi-user',
      command: () => navigate('/clientes')
    },
    {
      label: 'Pedidos',
      key: 'pedidos',
      icon: 'pi pi-fw pi-shopping-cart',
      command: () => navigate('/pedidos')
    },
  ];

  return (
    <div className="p-4">
      <Menubar model={menuItems} className="mb-4 shadow-2" />
      <Toast ref={toast} />
      <div className="flex flex-wrap gap-3 mb-4 align-items-end">
        <Button label="Novo Pedido" icon="pi pi-plus" />
        <Calendar value={filtroData} onChange={e => setFiltroData(e.value)} placeholder="Data" />
        <Dropdown value={filtroStatus} options={statusOptions} onChange={e => setFiltroStatus(e.value)} placeholder="Status" />
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText value={filtroTexto} onChange={e => setFiltroTexto(e.target.value)} placeholder="Buscar por cliente ou nº pedido" />
        </span>
        <div className="flex gap-2">
          <Button label="PDF Simples" icon="pi pi-file-pdf" className="p-button-outlined p-button-danger" onClick={() => exportarPedidos('pdf', false)} />
          <Button label="PDF Detalhado" icon="pi pi-file-pdf" className="p-button-danger" onClick={() => exportarPedidos('pdf', true)} />
          <Button label="Excel" icon="pi pi-file-excel" className="p-button-success" onClick={() => exportarPedidos('excel')} />
        </div>
      </div>

      <DataTable value={pedidosFiltrados} paginator rows={5} loading={loading} emptyMessage="Nenhum pedido encontrado." responsiveLayout="scroll">
        <Column field="id" header="Nº Pedido" style={{ minWidth: '120px' }} />
        <Column header="Data" body={row => new Date(row.data).toLocaleDateString('pt-BR')} />
        <Column header="Cliente" body={row => row.cliente?.nome ?? '-'} />
        <Column header="Parceiro" body={row => row.parceiro?.nome ?? '-'} />
        <Column header="Total" body={row => `R$ ${Number(row.total ?? 0).toFixed(2)}`} />
        <Column field="status" header="Status" body={statusTemplate} />
        <Column header="Produtos" body={acoesTemplate} style={{ width: '100px' }} />
      </DataTable>

      <OverlayPanel ref={overlayRef} showCloseIcon dismissable>{produtosDetalhes()}</OverlayPanel>
    </div>
  );
}
