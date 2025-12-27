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

import { useLancamentosFinanceiros } from '../hooks/useLancamentosFinanceiros';
import LancamentosFiltro from '../components/financeiro/LancamentosFiltro';
import LancamentosTotaisCards from '../components/financeiro/LancamentosTotaisCards';
import LancamentoFormDialog from '../components/financeiro/LancamentoFormDialog';

import { formatDatePtBR } from '../utils/date/dateHelpers';

const fmtMoney = (v) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

const normEnum = (v) => {
  if (!v) return '';
  if (typeof v === 'object') return String(v.value ?? v.name ?? v.label ?? '');
  return String(v);
};

const tipoLabel = (tipo) => {
  const t = normEnum(tipo).toLowerCase();
  if (t === 'receita' || t === 'receita'.toLowerCase() || t === 'receita'.toUpperCase().toLowerCase()) return 'Receita';
  if (t === 'despesa' || t === 'despesa'.toLowerCase() || t === 'despesa'.toUpperCase().toLowerCase()) return 'Despesa';
  if (t === 'receita'.toLowerCase() || t === 'receita') return 'Receita';
  if (t === 'despesa'.toLowerCase() || t === 'despesa') return 'Despesa';
  if (t === 'receita'.toLowerCase()) return 'Receita';
  // casos: "RECEITA"/"DESPESA"
  if (normEnum(tipo).toUpperCase() === 'RECEITA') return 'Receita';
  if (normEnum(tipo).toUpperCase() === 'DESPESA') return 'Despesa';
  return normEnum(tipo) || '-';
};

const statusLabel = (status) => {
  const s = normEnum(status).toLowerCase();
  if (s === 'confirmado' || normEnum(status).toUpperCase() === 'CONFIRMADO') return 'Confirmado';
  if (s === 'cancelado' || normEnum(status).toUpperCase() === 'CANCELADO') return 'Cancelado';
  return normEnum(status) || '-';
};

export default function FinanceiroLancamentos() {
  const toast = useRef(null);
  const { has } = useAuth();

  const [filtros, setFiltros] = useState({
    q: '',
    tipo: null,
    status: null,
    categoria_id: null,
    conta_id: null,
    periodo: null, // range -> data_movimento
    order_by: 'data_movimento',
    order_dir: 'desc',
    per_page: 25,
  });

  const { lista, meta, loading, fetchLancamentos, mapFiltrosApi } = useLancamentosFinanceiros(filtros);

  const [totais, setTotais] = useState({
    receitas_confirmadas: 0,
    despesas_confirmadas: 0,
    saldo_confirmado: 0,
    cancelados: 0,
  });

  const [dialogVisivel, setDialogVisivel] = useState(false);
  const [editando, setEditando] = useState(null);

  const podeCriar = has(PERMISSOES.FINANCEIRO.LANCAMENTOS.CRIAR);
  const podeEditar = has(PERMISSOES.FINANCEIRO.LANCAMENTOS.EDITAR);
  const podeExcluir = has(PERMISSOES.FINANCEIRO.LANCAMENTOS.EXCLUIR);

  const carregarTotais = async (f = filtros) => {
    try {
      const params = mapFiltrosApi(f);
      const { data } = await apiFinanceiro.get('/financeiro/lancamentos/totais', { params });

      setTotais(
        data?.data || {
          receitas_confirmadas: 0,
          despesas_confirmadas: 0,
          saldo_confirmado: 0,
          cancelados: 0,
        }
      );
    } catch (e) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro (Totais)',
        detail: e?.response?.data?.message || e.message,
      });
      setTotais({
        receitas_confirmadas: 0,
        despesas_confirmadas: 0,
        saldo_confirmado: 0,
        cancelados: 0,
      });
    }
  };

  useEffect(() => {
    fetchLancamentos(1, filtros).catch(() => {});
    carregarTotais(filtros).catch(() => {});
    // eslint-disable-next-line
  }, []);

  const onBuscar = async (f) => {
    try {
      await fetchLancamentos(1, f);
      await carregarTotais(f);
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: e?.response?.data?.message || e.message });
    }
  };

  const rows = Number(meta?.per_page) || 25;
  const page = Number(meta?.page) || 1;
  const first = (page - 1) * rows;

  const onPage = async (e) => {
    const nextPage = (e.page ?? 0) + 1;
    try {
      await fetchLancamentos(nextPage, filtros);
    } catch (err) {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: err?.response?.data?.message || err.message });
    }
  };

  const statusTag = (row) => {
    const st = statusLabel(row?.status).toLowerCase();
    const map = {
      confirmado: { label: 'Confirmado', severity: 'success' },
      cancelado: { label: 'Cancelado', severity: 'secondary' },
    };
    const cfg = map[st] || { label: statusLabel(row?.status), severity: 'info' };
    return <Tag value={cfg.label} severity={cfg.severity} className="text-xs" rounded />;
  };

  const tipoTag = (tipo) => {
    const t = String(tipo || '').toUpperCase();
    const isReceita = t === 'RECEITA';
    return (
      <Tag
        value={isReceita ? 'Receita' : 'Despesa'}
        severity={isReceita ? 'success' : 'danger'}
        className="text-xs"
        rounded
      />
    );
  };

  const abrirNovo = () => {
    setEditando(null);
    setDialogVisivel(true);
  };

  const editar = (row) => {
    setEditando(row);
    setDialogVisivel(true);
  };

  const excluir = (row) => {
    confirmDialog({
      message: `Excluir lançamento #${row.id}?`,
      header: 'Confirmação',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: async () => {
        try {
          await apiFinanceiro.delete(`/financeiro/lancamentos/${row.id}`);
          toast.current?.show({ severity: 'success', summary: 'Excluído' });
          await fetchLancamentos(meta.page, filtros);
          await carregarTotais(filtros);
        } catch (e) {
          toast.current?.show({ severity: 'error', summary: 'Erro', detail: e?.response?.data?.message || e.message });
        }
      },
    });
  };

  const cols = useMemo(
    () => [
      { field: 'id', header: '#', body: (r) => r.id },
      { field: 'tipo', header: 'Tipo', body: (r) => tipoTag(r.tipo) },
      { field: 'descricao', header: 'Descrição' },

      // Mostra categoria/conta quando vier do resource
      { field: 'categoria', header: 'Categoria', body: (r) => r?.categoria?.nome || '-' },
      { field: 'conta', header: 'Conta', body: (r) => r?.conta?.nome || '-' },

      {
        field: 'data_movimento',
        header: 'Movimento',
        body: (r) => formatDatePtBR(r.data_movimento || r.data_vencimento) || '-',
      },
      { field: 'competencia', header: 'Competência', body: (r) => formatDatePtBR(r.competencia) || '-' },
      { field: 'valor', header: 'Valor', body: (r) => `R$ ${fmtMoney(r.valor)}` },
      { field: 'status', header: 'Status', body: (r) => statusTag(r) },
    ],
    []
  );

  return (
    <SakaiLayout>
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="p-4">
        <LancamentosTotaisCards totais={totais} />

        <div className="flex flex-wrap gap-2 mb-3">
          <LancamentosFiltro filtros={filtros} setFiltros={setFiltros} onBuscar={onBuscar} />
          {podeCriar && <Button icon="pi pi-plus" label="Novo Lançamento" onClick={abrirNovo} />}
        </div>

        <h2 className="mb-3">Lançamentos Financeiros</h2>

        <DataTable
          value={lista}
          dataKey="id"
          paginator
          lazy
          rows={rows}
          totalRecords={Number(meta?.total) || 0}
          first={Number.isFinite(first) ? first : 0}
          onPage={onPage}
          loading={loading}
          emptyMessage="Nenhum lançamento encontrado."
          scrollable
          responsiveLayout="scroll"
          size="small"
        >
          {cols.map((col) => (
            <Column key={col.field} field={col.field} header={col.header} body={col.body} style={{ minWidth: '140px' }} />
          ))}

          <Column
            header="Ações"
            body={(row) => (
              <div className="flex gap-2">
                {podeEditar && <Button icon="pi pi-pencil" tooltip="Editar" onClick={() => editar(row)} />}
                {podeExcluir && (
                  <Button icon="pi pi-trash" tooltip="Excluir" severity="danger" outlined onClick={() => excluir(row)} />
                )}
              </div>
            )}
            style={{ minWidth: 180 }}
          />
        </DataTable>
      </div>

      <LancamentoFormDialog
        visible={dialogVisivel}
        onHide={() => setDialogVisivel(false)}
        onSaved={async () => {
          await fetchLancamentos(meta.page, filtros);
          await carregarTotais(filtros);
        }}
        lancamento={editando}
      />
    </SakaiLayout>
  );
}
