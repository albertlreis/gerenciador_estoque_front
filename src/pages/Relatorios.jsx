import React, { useState, useEffect, useRef } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Panel } from 'primereact/panel';
import { Toast } from 'primereact/toast';
import { saveAs } from 'file-saver';

import api from '../services/apiEstoque';
import apiAuth from '../services/apiAuth';
import SakaiLayout from '../layouts/SakaiLayout';
import CalendarBR from '../components/CalendarBR';

import { STATUS_CONSIGNACAO_OPTIONS } from '../constants/statusConsignacao';

const Relatorios = () => {
  const [tipo, setTipo] = useState(null);

  // Pedidos
  const [periodoPedidos, setPeriodoPedidos] = useState(null);
  const [clienteId, setClienteId] = useState(null);
  const [parceiroId, setParceiroId] = useState(null);
  const [vendedorId, setVendedorId] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [parceiros, setParceiros] = useState([]);
  const [vendedores, setVendedores] = useState([]);

  // Estoque
  const [depositos, setDepositos] = useState([]);
  const [depositoIds, setDepositoIds] = useState([]);
  const [somenteOutlet, setSomenteOutlet] = useState(false);

  // Consignações
  const [statusConsig, setStatusConsig] = useState(null);
  const [periodoEnvio, setPeriodoEnvio] = useState(null);       // range
  const [periodoVencimento, setPeriodoVencimento] = useState(null); // range
  const [consolidado, setConsolidado] = useState(false);

  // UI
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);

  const tiposRelatorio = [
    { label: 'Estoque Atual', value: 'estoque' },
    { label: 'Pedidos por Período', value: 'pedidos' },
    { label: 'Consignações', value: 'consignacoes' },
  ];

  useEffect(() => {
    const carregarParaPedidos = async () => {
      try {
        const [resClientes, resParceiros, resVendedores] = await Promise.all([
          api.get('/clientes'),
          api.get('/parceiros'),
          apiAuth.get('/usuarios/vendedores'),
        ]);
        setClientes(resClientes.data || []);
        setParceiros(resParceiros.data || []);
        setVendedores(resVendedores.data || []);
      } catch (error) {
        console.error('Erro ao carregar filtros de pedidos:', error);
        toast.current?.show({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar clientes/parceiros/vendedores',
        });
      }
    };

    const carregarParaEstoque = async () => {
      try {
        const resDepositos = await api.get('/depositos');
        const lista = (resDepositos.data || []).map((d) => ({
          label: d.nome || d.label || `Depósito #${d.id}`,
          value: d.id,
        }));
        setDepositos(lista);
      } catch (error) {
        console.error('Erro ao carregar depósitos:', error);
        toast.current?.show({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar a lista de depósitos',
        });
      }
    };

    // reset de campos quando muda tipo
    if (tipo === 'estoque') {
      setClienteId(null);
      setParceiroId(null);
      setVendedorId(null);
      setPeriodoPedidos(null);
      carregarParaEstoque();
    } else if (tipo === 'consignacoes') {
      setStatusConsig(null);
      setPeriodoEnvio(null);
      setPeriodoVencimento(null);
      setConsolidado(false);
    } else if (tipo === 'pedidos') {
      carregarParaPedidos();
    }
  }, [tipo]);

  const montarEndpoint = () => {
    if (tipo === 'estoque') return '/relatorios/estoque/atual';
    if (tipo === 'pedidos') return '/relatorios/pedidos';
    if (tipo === 'consignacoes') return '/relatorios/consignacoes/ativas';
    return '';
  };

  const toIsoDate = (d) => new Date(d).toISOString().slice(0, 10);

  const validar = () => {
    if (tipo === 'pedidos') {
      const [ini, fim] = Array.isArray(periodoPedidos) ? periodoPedidos : [];
      if (ini && fim && ini > fim) {
        toast.current?.show({
          severity: 'warn',
          summary: 'Período inválido',
          detail: 'A data inicial não pode ser maior que a data final.',
        });
        return false;
      }
    }
    if (tipo === 'consignacoes') {
      const [ei, ef] = Array.isArray(periodoEnvio) ? periodoEnvio : [];
      const [vi, vf] = Array.isArray(periodoVencimento) ? periodoVencimento : [];
      if (ei && ef && ei > ef) {
        toast.current?.show({ severity: 'warn', summary: 'Período inválido', detail: 'Envio: início maior que fim.' });
        return false;
      }
      if (vi && vf && vi > vf) {
        toast.current?.show({ severity: 'warn', summary: 'Período inválido', detail: 'Vencimento: início maior que fim.' });
        return false;
      }
    }
    return true;
  };

  const appendFiltros = (params) => {
    if (tipo === 'estoque') {
      if (depositoIds?.length) {
        depositoIds.forEach((id) => params.append('deposito_ids[]', id));
      }
      if (somenteOutlet) params.append('somente_outlet', 1);
      return;
    }

    if (tipo === 'pedidos') {
      const [ini, fim] = Array.isArray(periodoPedidos) ? periodoPedidos : [];
      if (ini) params.append('data_inicio', toIsoDate(ini));
      if (fim) params.append('data_fim', toIsoDate(fim));
      if (clienteId) params.append('cliente_id', clienteId);
      if (parceiroId) params.append('parceiro_id', parceiroId);
      if (vendedorId) params.append('vendedor_id', vendedorId);
      return;
    }

    if (tipo === 'consignacoes') {
      if (statusConsig) params.append('status', statusConsig);
      const [ei, ef] = Array.isArray(periodoEnvio) ? periodoEnvio : [];
      const [vi, vf] = Array.isArray(periodoVencimento) ? periodoVencimento : [];
      if (ei) params.append('envio_inicio', toIsoDate(ei));
      if (ef) params.append('envio_fim', toIsoDate(ef));
      if (vi) params.append('vencimento_inicio', toIsoDate(vi));
      if (vf) params.append('vencimento_fim', toIsoDate(vf));
      if (consolidado) params.append('consolidado', '1');
    }
  };

  const baixarArquivo = async (formato) => {
    try {
      const endpoint = montarEndpoint();
      if (!endpoint) return;
      if (!validar()) return;

      const params = new URLSearchParams();
      params.append('formato', formato);

      appendFiltros(params);

      setLoading(true);
      const res = await api.get(`${endpoint}?${params.toString()}`, {
        responseType: 'blob',
      });

      const timestamp = Date.now();
      const nome = `relatorio-${tipo}-${timestamp}.${formato === 'pdf' ? 'pdf' : 'xlsx'}`;
      const blob = new Blob([res.data], {
        type: formato === 'pdf'
          ? 'application/pdf'
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      saveAs(blob, nome);
    } catch (err) {
      console.error(err);
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: `Erro ao gerar ${tipo} (${formato.toUpperCase()})`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SakaiLayout>
      <Toast ref={toast} />
      <div className="p-4">
        <Panel header="Relatórios">
          <div className="formgrid grid">
            {/* Tipo */}
            <div className="field col-12 md:col-4">
              <label className="mb-2 block">Tipo de Relatório</label>
              <Dropdown
                value={tipo}
                options={tiposRelatorio}
                onChange={(e) => setTipo(e.value)}
                placeholder="Selecione"
                className="w-full"
              />
            </div>

            {/* ESTOQUE */}
            {tipo === 'estoque' && (
              <div className="field col-12">
                <div className="grid">
                  <div className="col-12 md:col-8">
                    <label className="mb-2 block">Depósitos</label>
                    <MultiSelect
                      value={depositoIds}
                      onChange={(e) => setDepositoIds(e.value)}
                      options={depositos}
                      placeholder="Selecione um ou mais depósitos"
                      display="chip"
                      filter
                      showClear
                      className="w-full"
                      maxSelectedLabels={3}
                      selectedItemsLabel="{0} depósitos selecionados"
                    />
                  </div>
                  <div className="col-12 md:col-4 flex align-items-end">
                    <div className="flex align-items-center">
                      <Checkbox
                        inputId="somenteOutlet"
                        checked={somenteOutlet}
                        onChange={(e) => setSomenteOutlet(e.checked)}
                      />
                      <label htmlFor="somenteOutlet" className="ml-2 mb-0">
                        Somente produtos em outlet
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PEDIDOS */}
            {tipo === 'pedidos' && (
              <>
                <div className="field col-12 md:col-4">
                  <label className="mb-2 block">Período</label>
                  <CalendarBR
                    value={periodoPedidos}
                    onChange={(e) => setPeriodoPedidos(e.value)}
                    selectionMode="range"
                    placeholder="Selecione um intervalo"
                  />
                </div>

                <div className="field col-12 md:col-4">
                  <label className="mb-2 block">Cliente</label>
                  <Dropdown
                    value={clienteId}
                    onChange={(e) => setClienteId(e.value)}
                    options={clientes.map((c) => ({ label: c.nome, value: c.id }))}
                    placeholder="Todos"
                    filter
                    showClear
                    className="w-full"
                  />
                </div>

                <div className="field col-12 md:col-4">
                  <label className="mb-2 block">Parceiro</label>
                  <Dropdown
                    value={parceiroId}
                    onChange={(e) => setParceiroId(e.value)}
                    options={parceiros.map((p) => ({ label: p.nome, value: p.id }))}
                    placeholder="Todos"
                    filter
                    showClear
                    className="w-full"
                  />
                </div>

                <div className="field col-12 md:col-4">
                  <label className="mb-2 block">Vendedor</label>
                  <Dropdown
                    value={vendedorId}
                    onChange={(e) => setVendedorId(e.value)}
                    options={vendedores.map((v) => ({ label: v.nome, value: v.id }))}
                    placeholder="Todos"
                    filter
                    showClear
                    className="w-full"
                  />
                </div>
              </>
            )}

            {/* CONSIGNAÇÕES */}
            {tipo === 'consignacoes' && (
              <>
                <div className="field col-12 md:col-4">
                  <label className="mb-2 block">Período de Envio</label>
                  <CalendarBR
                    value={periodoEnvio}
                    onChange={(e) => setPeriodoEnvio(e.value)}
                    selectionMode="range"
                    placeholder="Selecione um intervalo (opcional)"
                  />
                </div>

                <div className="field col-12 md:col-4">
                  <label className="mb-2 block">Período de Vencimento</label>
                  <CalendarBR
                    value={periodoVencimento}
                    onChange={(e) => setPeriodoVencimento(e.value)}
                    selectionMode="range"
                    placeholder="Selecione um intervalo (opcional)"
                  />
                </div>

                <div className="field col-12 md:col-4">
                  <label className="mb-2 block">Status</label>
                  <Dropdown
                    value={statusConsig}
                    onChange={(e) => setStatusConsig(e.value)}
                    options={STATUS_CONSIGNACAO_OPTIONS}
                    placeholder="Todos"
                    filter
                    showClear
                    className="w-full"
                  />
                </div>

                <div className="field col-12">
                  <div className="flex align-items-center">
                    <Checkbox
                      inputId="consolidado"
                      checked={consolidado}
                      onChange={(e) => setConsolidado(e.checked)}
                    />
                    <label htmlFor="consolidado" className="ml-2 mb-0">
                      Consolidar por cliente (desmarcado = detalhado com produtos)
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="mt-3 flex gap-2 flex-wrap justify-content-end">
            <Button
              label="Gerar PDF"
              icon={`pi ${loading ? 'pi-spin pi-spinner' : 'pi-file-pdf'}`}
              className="p-button-danger"
              onClick={() => baixarArquivo('pdf')}
              disabled={!tipo || loading}
            />
            <Button
              label="Exportar Excel"
              icon={`pi ${loading ? 'pi-spin pi-spinner' : 'pi-file-excel'}`}
              className="p-button-success"
              onClick={() => baixarArquivo('excel')}
              disabled={!tipo || loading}
            />
          </div>
        </Panel>
      </div>
    </SakaiLayout>
  );
};

export default Relatorios;
