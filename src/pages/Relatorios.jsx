import React, { useEffect, useMemo, useRef, useCallback } from 'react';
import { Panel } from 'primereact/panel';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Divider } from 'primereact/divider';
import { Tooltip } from 'primereact/tooltip';

import SakaiLayout from '../layouts/SakaiLayout';

import { tiposRelatorio, TIPO } from '../modules/relatorios/relatorios.constants';
import { addDays, startOfMonth, endOfMonth } from '../utils/date/dateHelpers';

import { useRelatoriosState } from '../hooks/relatorios/useRelatoriosState';
import { useRelatorioExport } from '../hooks/relatorios/useRelatorioExport';
import { usePedidosFiltros } from '../hooks/relatorios/usePedidosFiltros';
import { useDepositos } from '../hooks/relatorios/useDepositos';
import { useCategoriaAutoComplete } from '../hooks/relatorios/useCategoriaAutoComplete';
import { useProdutoAutoComplete } from '../hooks/relatorios/useProdutoAutoComplete';
import { useFornecedorAutoComplete } from '../hooks/relatorios/useFornecedorAutoComplete'; // NOVO

import { RelatoriosHeader } from '../components/relatorios/RelatoriosHeader';
import { FiltrosChips } from '../components/relatorios/FiltrosChips';
import { RelatoriosActionsBar } from '../components/relatorios/RelatoriosActionsBar';

import { FiltrosEstoque } from '../components/relatorios/filtros/FiltrosEstoque';
import { FiltrosPedidos } from '../components/relatorios/filtros/FiltrosPedidos';
import { FiltrosConsignacoes } from '../components/relatorios/filtros/FiltrosConsignacoes';

import { OPCOES_STATUS as OPCOES_STATUS_PEDIDO } from '../constants/statusPedido'; // NOVO

export default function Relatorios() {
  const toastRef = useRef(null);

  const st = useRelatoriosState();

  // Presets (mantém igual ao original)
  const presetsPedidos = useMemo(
    () => [
      { label: 'Hoje', action: () => st.setPeriodoPedidos([new Date(), new Date()]) },
      { label: '7d', action: () => st.setPeriodoPedidos([addDays(new Date(), -6), new Date()]) },
      { label: '30d', action: () => st.setPeriodoPedidos([addDays(new Date(), -29), new Date()]) },
      { label: 'Mês atual', action: () => st.setPeriodoPedidos([startOfMonth(), endOfMonth()]) },
    ],
    [st]
  );

  const presetsConsigEnvio = useMemo(
    () => [
      { label: '7d', action: () => st.setPeriodoEnvio([addDays(new Date(), -6), new Date()]) },
      { label: '30d', action: () => st.setPeriodoEnvio([addDays(new Date(), -29), new Date()]) },
      { label: 'Mês atual', action: () => st.setPeriodoEnvio([startOfMonth(), endOfMonth()]) },
    ],
    [st]
  );

  const presetsConsigVenc = useMemo(
    () => [
      { label: 'Vence em 7d', action: () => st.setPeriodoVencimento([new Date(), addDays(new Date(), 7)]) },
      { label: 'Vence em 30d', action: () => st.setPeriodoVencimento([new Date(), addDays(new Date(), 30)]) },
    ],
    [st]
  );

  // Carregamentos condicionados
  const { depositos } = useDepositos({
    enabled: st.tipo === TIPO.ESTOQUE,
    toastRef,
  });

  const { loadingFiltrosPedidos, clientesOpts, parceirosOpts, vendedoresOpts } = usePedidosFiltros({
    enabled: st.tipo === TIPO.PEDIDOS,
    toastRef,
  });

  // AutoCompletes
  const { catSug, buscarCategorias, clearSug } = useCategoriaAutoComplete();
  const { prodSug, buscarProdutos } = useProdutoAutoComplete();

  // Fornecedor AutoComplete (NOVO)
  const { fornSug, buscarFornecedores, clearSug: clearFornSug } = useFornecedorAutoComplete();

  // Reset por tipo (espelha comportamento atual)
  useEffect(() => {
    if (!st.tipo) return;
    st.resetPorTipo(st.tipo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [st.tipo]);

  // Validação (mantém na página por ora)
  const validar = useCallback(() => {
    if (st.tipo === TIPO.PEDIDOS) {
      const [ini, fim] = Array.isArray(st.periodoPedidos) ? st.periodoPedidos : [];
      if (ini && fim && ini > fim) {
        toastRef.current?.show({
          severity: 'warn',
          summary: 'Período inválido',
          detail: 'A data inicial não pode ser maior que a final.',
        });
        return false;
      }
    }

    if (st.tipo === TIPO.CONSIG) {
      const [ei, ef] = Array.isArray(st.periodoEnvio) ? st.periodoEnvio : [];
      const [vi, vf] = Array.isArray(st.periodoVencimento) ? st.periodoVencimento : [];
      if (ei && ef && ei > ef) {
        toastRef.current?.show({
          severity: 'warn',
          summary: 'Período inválido',
          detail: 'Envio: início maior que fim.',
        });
        return false;
      }
      if (vi && vf && vi > vf) {
        toastRef.current?.show({
          severity: 'warn',
          summary: 'Período inválido',
          detail: 'Vencimento: início maior que fim.',
        });
        return false;
      }
    }

    return true;
  }, [st.tipo, st.periodoPedidos, st.periodoEnvio, st.periodoVencimento]);

  const { loading, baixarArquivo } = useRelatorioExport({
    tipo: st.tipo,
    filtros: st.filtros,
    toastRef,
    validar,
  });

  const onLimpar = useCallback(() => {
    if (!st.hasFilters) return;

    confirmDialog({
      header: 'Limpar filtros',
      message: 'Limpar todos os filtros deste relatório?',
      icon: 'pi pi-filter-slash',
      acceptLabel: 'Limpar',
      rejectLabel: 'Cancelar',
      closable: true,
      acceptClassName: 'p-button-danger',
      accept: () => {
        st.limparFiltrosPorTipo();
        toastRef.current?.show({ severity: 'info', summary: 'Filtros limpos', detail: 'Tudo resetado.' });
      },
    });
  }, [st]);

  return (
    <SakaiLayout>
      <Toast ref={toastRef} />
      <ConfirmDialog />
      <Tooltip target=".help-tip" position="top" />

      <div className="p-4">
        <Panel header="Relatórios">
          <RelatoriosHeader tipo={st.tipo} setTipo={st.setTipo} tiposRelatorio={tiposRelatorio} />

          <FiltrosChips filtrosAtivos={st.filtrosAtivos} />

          <Divider className="my-2" />

          <div className="formgrid grid">
            {st.tipo === TIPO.ESTOQUE && (
              <FiltrosEstoque
                depositos={depositos}
                depositoIds={st.depositoIds}
                setDepositoIds={st.setDepositoIds}
                somenteOutlet={st.somenteOutlet}
                setSomenteOutlet={st.setSomenteOutlet}
                somenteSemEstoque={st.somenteSemEstoque}
                setSomenteSemEstoque={st.setSomenteSemEstoque}
                categoria={st.categoria}
                setCategoria={st.setCategoria}
                catInput={st.catInput}
                setCatInput={st.setCatInput}
                catSug={catSug}
                buscarCategorias={buscarCategorias}
                onClearCategoria={() => {
                  st.setCategoria(null);
                  st.setCatInput('');
                  clearSug();
                }}
                produto={st.produto}
                setProduto={st.setProduto}
                prodSug={prodSug}
                buscarProdutos={buscarProdutos}
                fornecedor={st.fornecedor}
                setFornecedor={st.setFornecedor}
                fornInput={st.fornInput}
                setFornInput={st.setFornInput}
                fornSug={fornSug}
                buscarFornecedores={buscarFornecedores}
                onClearFornecedor={() => {
                  st.setFornecedor(null);
                  st.setFornInput('');
                  clearFornSug();
                }}
              />
            )}

            {st.tipo === TIPO.PEDIDOS && (
              <FiltrosPedidos
                periodoPedidos={st.periodoPedidos}
                setPeriodoPedidos={st.setPeriodoPedidos}
                presetsPedidos={presetsPedidos}
                loadingFiltrosPedidos={loadingFiltrosPedidos}
                clienteId={st.clienteId}
                setClienteId={st.setClienteId}
                parceiroId={st.parceiroId}
                setParceiroId={st.setParceiroId}
                vendedorId={st.vendedorId}
                setVendedorId={st.setVendedorId}
                statusPedido={st.statusPedido}
                setStatusPedido={st.setStatusPedido}
                statusPedidoOptions={OPCOES_STATUS_PEDIDO}
                clientesOpts={clientesOpts}
                parceirosOpts={parceirosOpts}
                vendedoresOpts={vendedoresOpts}
              />
            )}

            {st.tipo === TIPO.CONSIG && (
              <FiltrosConsignacoes
                periodoEnvio={st.periodoEnvio}
                setPeriodoEnvio={st.setPeriodoEnvio}
                presetsConsigEnvio={presetsConsigEnvio}
                periodoVencimento={st.periodoVencimento}
                setPeriodoVencimento={st.setPeriodoVencimento}
                presetsConsigVenc={presetsConsigVenc}
                statusConsig={st.statusConsig}
                setStatusConsig={st.setStatusConsig}
                consolidado={st.consolidado}
                setConsolidado={st.setConsolidado}
              />
            )}
          </div>

          <RelatoriosActionsBar
            tipo={st.tipo}
            hasFilters={st.hasFilters}
            loading={loading}
            loadingFiltrosPedidos={loadingFiltrosPedidos}
            onLimpar={onLimpar}
            onPdf={() => baixarArquivo('pdf')}
            onExcel={() => baixarArquivo('excel')}
          />
        </Panel>
      </div>
    </SakaiLayout>
  );
}
