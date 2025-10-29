import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

import SakaiLayout from '../layouts/SakaiLayout';
import { useContasPagar } from '../hooks/useContasPagar';
import ContasPagarFiltro from '../components/contas/ContasPagarFiltro';
import ContaPagarForm from '../components/contas/ContaPagarForm';
import ContaPagarPagamentoDialog from '../components/contas/ContaPagarPagamentoDialog';
import ColumnSelector from '../components/ColumnSelector';
import apiFinanceiro from '../services/apiFinanceiro';
import { useAuth } from '../context/AuthContext';
import { PERMISSOES } from '../constants/permissoes';
import { formatarReal } from '../utils/formatters';
import { formatarDataIsoParaBR } from '../utils/formatarData';

export default function ContasPagarPage() {
  const toast = useRef(null);
  const { has } = useAuth();

  const [filtros, setFiltros] = useState({ texto: '', status: null, forma_pagamento: null, periodo: null, vencidas: false });
  const { lista, total, pagina, setPagina, loading, fetchContas } = useContasPagar(filtros);

  const [dialogFormVisivel, setDialogFormVisivel] = useState(false);
  const [contaEdicao, setContaEdicao] = useState(null);

  const [dialogPagVisivel, setDialogPagVisivel] = useState(false);
  const [contaPag, setContaPag] = useState(null);

  useEffect(() => { fetchContas(1, filtros); /* eslint-disable-next-line */ }, []);

  const onBuscar = (override) => fetchContas(1, mapFiltrosApi(override));

  const mapFiltrosApi = (f) => ({
    busca: f?.texto || undefined,
    status: f?.status || undefined,
    forma_pagamento: f?.forma_pagamento || undefined,
    data_ini: f?.periodo?.[0] || undefined,
    data_fim: f?.periodo?.[1] || undefined,
    vencidas: f?.vencidas || undefined,
  });

  const cols = useMemo(() => ([
    { field: 'id', header: '#', body: (r) => r.id },
    { field: 'descricao', header: 'Descrição' },
    { field: 'numero_documento', header: 'Nº Doc' },
    { field: 'data_vencimento', header: 'Vencimento', body: (r) => r.data_vencimento ? formatarDataIsoParaBR(r.data_vencimento) : '-' },
    { field: 'valor_bruto', header: 'Bruto', body: (r) => formatarReal(r.valor_bruto) },
    { field: 'valor_liquido', header: 'Líquido', body: (r) => formatarReal(r.valor_liquido) },
    { field: 'valor_pago', header: 'Pago', body: (r) => formatarReal(r.valor_pago) },
    { field: 'saldo_aberto', header: 'Saldo', body: (r) => formatarReal(r.saldo_aberto) },
    { field: 'status', header: 'Status', body: (r) => statusTag(r.status) },
  ]), []);

  const [colsVisiveis, setColsVisiveis] = useState(cols);

  const statusTag = (status) => {
    const map = {
      ABERTA: { label: 'Aberta', severity: 'info' },
      PARCIAL: { label: 'Parcial', severity: 'warning' },
      PAGA: { label: 'Paga', severity: 'success' },
      CANCELADA: { label: 'Cancelada', severity: 'danger' },
    };
    const cfg = map[status] || { label: status || '-', severity: 'secondary' };
    return <Tag value={cfg.label} severity={cfg.severity} className="text-xs" rounded/>;
  };

  const onPage = (e) => {
    const nova = Math.floor(e.first / 10) + 1;
    setPagina(nova);
    fetchContas(nova).catch(() => {});
  };

  const abrirNovo = () => { setContaEdicao(null); setDialogFormVisivel(true); };
  const editar = (row) => { setContaEdicao(row); setDialogFormVisivel(true); };
  const abrirPag = async (row) => {
    try {
      const { data } = await apiFinanceiro.get(`/contas-pagar/${row.id}`);
      setContaPag(data?.data || data);
      setDialogPagVisivel(true);
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: e?.response?.data?.message || e.message });
    }
  };

  const excluir = (row) => {
    confirmDialog({
      message: `Excluir conta #${row.id}?`,
      header: 'Confirmação', icon: 'pi pi-exclamation-triangle', acceptLabel: 'Sim', rejectLabel: 'Não',
      accept: async () => {
        try {
          await apiFinanceiro.delete(`/contas-pagar/${row.id}`);
          toast.current?.show({ severity: 'success', summary: 'Excluída' });
          await fetchContas(pagina);
        } catch (e) {
          toast.current?.show({ severity: 'error', summary: 'Erro', detail: e?.response?.data?.message || e.message });
        }
      }
    });
  };

  const podeCriar = has(PERMISSOES.FINANCEIRO.CONTAS_PAGAR.CRIAR);
  const podeEditar = has(PERMISSOES.FINANCEIRO.CONTAS_PAGAR.ATUALIZAR);
  const podeExcluir = has(PERMISSOES.FINANCEIRO.CONTAS_PAGAR.EXCLUIR);
  const podePagar = has(PERMISSOES.FINANCEIRO.CONTAS_PAGAR.PAGAR);
  const podeEstornar = has(PERMISSOES.FINANCEIRO.CONTAS_PAGAR.ESTORNAR);

  return (
    <SakaiLayout>
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="p-4">
        <div className="flex flex-wrap gap-3 justify-content-between align-items-end mb-3">
          <ContasPagarFiltro filtros={filtros} setFiltros={setFiltros} onBuscar={(f) => onBuscar(f)} />
          {podeCriar && (
            <Button label="Nova Conta" icon="pi pi-plus" onClick={abrirNovo} />
          )}
        </div>

        <h2 className="mb-3">Contas a Pagar</h2>

        <ColumnSelector columns={cols} value={colsVisiveis} onChange={setColsVisiveis} storageKey="colunasContasPagar" />

        <DataTable
          value={lista}
          paginator lazy rows={10} totalRecords={total} first={(pagina - 1) * 10}
          onPage={onPage} loading={loading} emptyMessage="Nenhuma conta encontrada." scrollable responsiveLayout="scroll" size="small"
        >
          {colsVisiveis.map((col) => (
            <Column key={col.field} field={col.field} header={col.header} body={col.body} style={{ minWidth: '140px' }} />
          ))}

          <Column header="Ações" body={(row) => (
            <div className="flex gap-2">
              <Button icon="pi pi-dollar" tooltip="Pagamentos" severity="success" outlined onClick={() => abrirPag(row)} disabled={!podePagar && !podeEstornar} />
              {podeEditar && <Button icon="pi pi-pencil" tooltip="Editar" onClick={() => editar(row)} />}
              {podeExcluir && <Button icon="pi pi-trash" tooltip="Excluir" severity="danger" outlined onClick={() => excluir(row)} />}
            </div>
          )} style={{ minWidth: 220 }} />
        </DataTable>
      </div>

      <ContaPagarForm
        visible={dialogFormVisivel}
        onHide={() => setDialogFormVisivel(false)}
        onSaved={() => fetchContas(pagina)}
        conta={contaEdicao}
      />

      {contaPag && (
        <ContaPagarPagamentoDialog
          visible={dialogPagVisivel}
          onHide={() => setDialogPagVisivel(false)}
          conta={contaPag}
          onAfterChange={async () => {
            setDialogPagVisivel(false);
            await fetchContas(pagina);
          }}
          podePagar={podePagar}
          podeEstornar={podeEstornar}
        />
      )}
    </SakaiLayout>
  );
}
