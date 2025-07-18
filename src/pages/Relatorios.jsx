import React, { useState, useEffect, useRef } from 'react';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Panel } from 'primereact/panel';
import { Toast } from 'primereact/toast';
import { saveAs } from 'file-saver';

import api from '../services/apiEstoque';
import apiAuth from '../services/apiAuth';
import SakaiLayout from '../layouts/SakaiLayout';

const Relatorios = () => {
  const [tipo, setTipo] = useState(null);
  const [dataInicio, setDataInicio] = useState(null);
  const [dataFim, setDataFim] = useState(null);

  const [clienteId, setClienteId] = useState(null);
  const [parceiroId, setParceiroId] = useState(null);
  const [vendedorId, setVendedorId] = useState(null);

  const [clientes, setClientes] = useState([]);
  const [parceiros, setParceiros] = useState([]);
  const [vendedores, setVendedores] = useState([]);

  const toast = useRef(null);

  const tiposRelatorio = [
    { label: 'Estoque Atual', value: 'estoque' },
    { label: 'Pedidos por Período', value: 'pedidos' },
    { label: 'Consignações Ativas', value: 'consignacoes' },
  ];

  useEffect(() => {
    const carregarFiltros = async () => {
      try {
        const [resClientes, resParceiros, resVendedores] = await Promise.all([
          api.get('/clientes'),
          api.get('/parceiros'),
          apiAuth.get('/usuarios/vendedores')
        ]);

        setClientes(resClientes.data);
        setParceiros(resParceiros.data);
        setVendedores(resVendedores.data);
      } catch (error) {
        console.error('Erro ao carregar filtros:', error);
        toast.current.show({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar dados de filtros',
        });
      }
    };

    carregarFiltros();
  }, []);

  const gerarPDF = async () => {
    try {
      let endpoint = '';
      const params = new URLSearchParams();

      if (tipo === 'estoque') {
        endpoint = '/relatorios/estoque/atual';
      } else if (tipo === 'pedidos') {
        endpoint = '/relatorios/pedidos';
        if (dataInicio) params.append('data_inicio', dataInicio.toISOString().slice(0, 10));
        if (dataFim) params.append('data_fim', dataFim.toISOString().slice(0, 10));
      } else if (tipo === 'consignacoes') {
        endpoint = '/relatorios/consignacoes/ativas';
      }

      if (clienteId) params.append('cliente_id', clienteId);
      if (parceiroId) params.append('parceiro_id', parceiroId);
      if (vendedorId) params.append('vendedor_id', vendedorId);

      params.append('formato', 'pdf');

      const res = await api.get(`${endpoint}?${params.toString()}`, {
        responseType: 'blob',
      });

      const blob = new Blob([res.data], { type: 'application/pdf' });
      saveAs(blob, `relatorio-${tipo}-${Date.now()}.pdf`);
    } catch (err) {
      console.error(err);
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao gerar PDF' });
    }
  };

  const gerarExcel = async () => {
    try {
      let endpoint = '';
      const params = new URLSearchParams();

      if (tipo === 'estoque') {
        endpoint = '/relatorios/estoque/atual';
      } else if (tipo === 'pedidos') {
        endpoint = '/relatorios/pedidos';
        if (dataInicio) params.append('data_inicio', dataInicio.toISOString().slice(0, 10));
        if (dataFim) params.append('data_fim', dataFim.toISOString().slice(0, 10));
      } else if (tipo === 'consignacoes') {
        endpoint = '/relatorios/consignacoes/ativas';
      }

      if (clienteId) params.append('cliente_id', clienteId);
      if (parceiroId) params.append('parceiro_id', parceiroId);
      if (vendedorId) params.append('vendedor_id', vendedorId);

      params.append('formato', 'excel');

      const res = await api.get(`${endpoint}?${params.toString()}`, {
        responseType: 'blob',
      });

      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      saveAs(blob, `relatorio-${tipo}-${Date.now()}.xlsx`);
    } catch (err) {
      console.error(err);
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao gerar Excel' });
    }
  };

  return (
    <SakaiLayout>
      <Toast ref={toast} />
      <div className="p-4">
        <Panel header="Relatórios">
          <div className="formgrid grid">
            <div className="field col-12 md:col-4">
              <label>Tipo de Relatório</label>
              <Dropdown value={tipo} options={tiposRelatorio} onChange={(e) => setTipo(e.value)} placeholder="Selecione" />
            </div>

            {tipo === 'pedidos' && (
              <>
                <div className="field col-6 md:col-4">
                  <label>Data Início</label>
                  <Calendar value={dataInicio} onChange={(e) => setDataInicio(e.value)} dateFormat="dd/mm/yy" showIcon />
                </div>
                <div className="field col-6 md:col-4">
                  <label>Data Fim</label>
                  <Calendar value={dataFim} onChange={(e) => setDataFim(e.value)} dateFormat="dd/mm/yy" showIcon />
                </div>
              </>
            )}

            <div className="field col-12 md:col-4">
              <label>Cliente</label>
              <Dropdown
                value={clienteId}
                onChange={(e) => setClienteId(e.value)}
                options={clientes.map(c => ({ label: c.nome, value: c.id }))}
                placeholder="Todos"
                filter
              />
            </div>

            <div className="field col-12 md:col-4">
              <label>Parceiro</label>
              <Dropdown
                value={parceiroId}
                onChange={(e) => setParceiroId(e.value)}
                options={parceiros.map(p => ({ label: p.nome, value: p.id }))}
                placeholder="Todos"
                filter
              />
            </div>

            <div className="field col-12 md:col-4">
              <label>Vendedor</label>
              <Dropdown
                value={vendedorId}
                onChange={(e) => setVendedorId(e.value)}
                options={vendedores.map(v => ({ label: v.nome, value: v.id }))}
                placeholder="Todos"
                filter
              />
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <Button
              label="Gerar PDF"
              icon="pi pi-file-pdf"
              className="p-button-danger"
              onClick={gerarPDF}
              disabled={!tipo}
            />
            <Button
              label="Exportar Excel"
              icon="pi pi-file-excel"
              className="p-button-success"
              onClick={gerarExcel}
              disabled={!tipo}
            />
          </div>
        </Panel>
      </div>
    </SakaiLayout>
  );
};

export default Relatorios;
