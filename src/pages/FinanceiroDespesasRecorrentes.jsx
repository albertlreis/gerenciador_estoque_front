import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

import SakaiLayout from '../layouts/SakaiLayout';
import { useAuth } from '../context/AuthContext';
import { PERMISSOES } from '../constants/permissoes';
import apiFinanceiro from '../services/apiFinanceiro';

import { useDespesasRecorrentes } from '../hooks/useDespesasRecorrentes';
import { useFinanceiroCatalogos } from '../hooks/useFinanceiroCatalogos';
import DespesaRecorrenteFiltro from '../components/financeiro/DespesaRecorrenteFiltro';
import DespesaRecorrenteFormDialog from '../components/financeiro/DespesaRecorrenteFormDialog';
import DespesaRecorrenteExecutarDialog from '../components/financeiro/DespesaRecorrenteExecutarDialog';

const fmtMoney = (v) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

export default function FinanceiroDespesasRecorrentes() {
  const toast = useRef(null);
  const { has } = useAuth();

  const [filtros, setFiltros] = useState({
    q: '',
    status: null,
    tipo: null,
    frequencia: null,
    fornecedor_id: null,
    categoria_id: null,
    centro_custo_id: null,
    per_page: 25,
  });

  const { lista, meta, loading, fetchDespesas } = useDespesasRecorrentes(filtros);

  const [dialogForm, setDialogForm] = useState(false);
  const [dialogExec, setDialogExec] = useState(false);
  const [editando, setEditando] = useState(null);
  const [executando, setExecutando] = useState(null);

  const { loadCategorias } = useFinanceiroCatalogos();
  const [categoriasMap, setCategoriasMap] = useState(new Map());
  const [centrosMap, setCentrosMap] = useState(new Map());

  useEffect(() => {
    (async () => {
      try {
        const cats = await loadCategorias({ ativo: true, tree: false });
        const map = new Map();
        (cats || []).forEach((c) => map.set(c.value, c.label));
        setCategoriasMap(map);
      } catch {
        setCategoriasMap(new Map());
      }

      try {
        const res = await apiFinanceiro.get('/financeiro/centros-custo', { params: { ativo: true } });
        const list = res?.data?.data || [];
        const map = new Map();
        list.forEach((c) => map.set(c.id, c.nome));
        setCentrosMap(map);
      } catch {
        setCentrosMap(new Map());
      }
    })();
    // eslint-disable-next-line
  }, []);

  const podeCriar = has(PERMISSOES.FINANCEIRO.DESPESAS_RECORRENTES.CRIAR);
  const podeEditar = has(PERMISSOES.FINANCEIRO.DESPESAS_RECORRENTES.EDITAR);
  const podeExecutar = has(PERMISSOES.FINANCEIRO.DESPESAS_RECORRENTES.EXECUTAR);
  const podeCancelar = has(PERMISSOES.FINANCEIRO.DESPESAS_RECORRENTES.CANCELAR);

  useEffect(() => {
    fetchDespesas(1, filtros).catch(() => {});
    // eslint-disable-next-line
  }, []);

  const onBuscar = async (f) => {
    try {
      await fetchDespesas(1, f);
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: e?.response?.data?.message || e.message });
    }
  };

  const onPage = async (e) => {
    const page = Math.floor(e.first / meta.per_page) + 1;
    try {
      await fetchDespesas(page, filtros);
    } catch (err) {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: err?.response?.data?.message || err.message });
    }
  };

  const statusTag = (row) => {
    const map = {
      ATIVA: { label: 'Ativa', severity: 'success' },
      PAUSADA: { label: 'Pausada', severity: 'warning' },
      CANCELADA: { label: 'Cancelada', severity: 'danger' },
    };
    const cfg = map[row.status] || { label: row.status || '-', severity: 'info' };
    return <Tag value={cfg.label} severity={cfg.severity} className="text-xs" rounded />;
  };

  const abrirNovo = () => {
    setEditando(null);
    setDialogForm(true);
  };

  const editar = (row) => {
    setEditando(row);
    setDialogForm(true);
  };

  const executar = (row) => {
    setExecutando(row);
    setDialogExec(true);
  };

  const alterarStatus = (row, acao) => {
    const map = {
      pausar: { endpoint: 'pausar', label: 'Pausar', next: 'PAUSADA' },
      ativar: { endpoint: 'ativar', label: 'Ativar', next: 'ATIVA' },
      cancelar: { endpoint: 'cancelar', label: 'Cancelar', next: 'CANCELADA' },
    };
    const cfg = map[acao];

    confirmDialog({
      message: `${cfg.label} a despesa recorrente #${row.id}?`,
      header: 'Confirmação',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: async () => {
        try {
          await apiFinanceiro.patch(`/financeiro/despesas-recorrentes/${row.id}/${cfg.endpoint}`);
          toast.current?.show({ severity: 'success', summary: 'Atualizado' });
          await fetchDespesas(meta.page, filtros);
        } catch (e) {
          toast.current?.show({ severity: 'error', summary: 'Erro', detail: e?.response?.data?.message || e.message });
        }
      }
    });
  };

  const cols = useMemo(() => ([
    { field: 'id', header: '#', body: (r) => r.id },
    { field: 'descricao', header: 'Descrição' },
    { field: 'tipo', header: 'Tipo', body: (r) => <Tag value={r.tipo} className="text-xs" rounded /> },
    { field: 'frequencia', header: 'Frequência', body: (r) => <Tag value={r.frequencia} className="text-xs" rounded /> },
    { field: 'valor_bruto', header: 'Valor', body: (r) => `R$ ${fmtMoney(r.valor_bruto)}` },
    { field: 'categoria_id', header: 'Categoria', body: (r) => categoriasMap.get(r.categoria_id) || '-' },
    { field: 'centro_custo_id', header: 'Centro de Custo', body: (r) => centrosMap.get(r.centro_custo_id) || '-' },
    { field: 'dia_vencimento', header: 'Dia venc.', body: (r) => r.dia_vencimento ?? '-' },
    { field: 'status', header: 'Status', body: (r) => statusTag(r) },
  ]), [categoriasMap, centrosMap]);

  return (
    <SakaiLayout>
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="p-4">
        <div className="flex flex-wrap gap-2 mb-3 align-items-center justify-content-between">
          <div>
            <h2 className="m-0">Despesas Recorrentes</h2>
            <small className="text-600">Cadastre regras recorrentes e gere Contas a Pagar manualmente.</small>
          </div>
          {podeCriar && <Button icon="pi pi-plus" label="Nova" onClick={abrirNovo} />}
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <DespesaRecorrenteFiltro filtros={filtros} setFiltros={setFiltros} onBuscar={onBuscar} />
        </div>

        <DataTable
          value={lista}
          paginator
          lazy
          rows={meta.per_page}
          totalRecords={meta.total}
          first={(meta.page - 1) * meta.per_page}
          onPage={onPage}
          loading={loading}
          emptyMessage="Nenhuma despesa recorrente encontrada."
          scrollable
          responsiveLayout="scroll"
          size="small"
        >
          {cols.map((col) => (
            <Column
              key={col.field}
              field={col.field}
              header={col.header}
              body={col.body}
              style={{ minWidth: '140px' }}
            />
          ))}

          <Column
            header="Ações"
            body={(row) => (
              <div className="flex gap-2">
                {podeEditar && <Button icon="pi pi-pencil" tooltip="Editar" onClick={() => editar(row)} />}
                {podeExecutar && row.status === 'ATIVA' && (
                  <Button icon="pi pi-play" tooltip="Executar" severity="success" outlined onClick={() => executar(row)} />
                )}
                {row.status === 'ATIVA' && <Button icon="pi pi-pause" tooltip="Pausar" outlined onClick={() => alterarStatus(row, 'pausar')} />}
                {row.status === 'PAUSADA' && <Button icon="pi pi-play" tooltip="Ativar" outlined onClick={() => alterarStatus(row, 'ativar')} />}
                {podeCancelar && row.status !== 'CANCELADA' && (
                  <Button icon="pi pi-times" tooltip="Cancelar" severity="danger" outlined onClick={() => alterarStatus(row, 'cancelar')} />
                )}
              </div>
            )}
            style={{ minWidth: 260 }}
          />
        </DataTable>
      </div>

      <DespesaRecorrenteFormDialog
        visible={dialogForm}
        onHide={() => setDialogForm(false)}
        despesa={editando}
        onSaved={async () => {
          await fetchDespesas(meta.page, filtros);
        }}
      />

      <DespesaRecorrenteExecutarDialog
        visible={dialogExec}
        onHide={() => setDialogExec(false)}
        despesa={executando}
        onExecuted={async () => {
          toast.current?.show({ severity: 'success', summary: 'Conta a pagar gerada' });
          await fetchDespesas(meta.page, filtros);
        }}
      />
    </SakaiLayout>
  );
}
