import React, { useEffect, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { Toolbar } from 'primereact/toolbar';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';

import SakaiLayout from '../layouts/SakaiLayout';
import apiEstoque from '../services/apiEstoque';

import { PRIORIDADES, STATUS_OPTIONS, statusSeverity, statusLabel } from '../utils/assistencia';
import PrazoTag from '../components/assistencia/tags/PrazoTag';
import CriarChamadoDialog from '../components/assistencia/dialogs/CriarChamadoDialog';
import ChamadoDetalhe from '../components/assistencia/ChamadoDetalhe';
import EditarChamadoDialog from '../components/assistencia/dialogs/EditarChamadoDialog';

const DEFAULT_PAGE_SIZE = 10;

const Assistencias = () => {
  const toast = useRef(null);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [filters, setFilters] = useState({ busca: '', status: '', prioridade: '', assistencia_id: '' });
  const [dlgCriar, setDlgCriar] = useState(false);
  const [detalheId, setDetalheId] = useState(null);

  // estado de edição
  const [editarId, setEditarId] = useState(null);
  const [dlgEditar, setDlgEditar] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const params = {
        per_page: perPage,
        page: page + 1,
        busca: filters.busca || undefined,
        status: filters.status || undefined,
        prioridade: filters.prioridade || undefined,
        assistencia_id: filters.assistencia_id || undefined,
      };
      const response = await apiEstoque.get('/assistencias/chamados', { params });
      const payload = response.data?.data ? response.data : { data: response.data, meta: { total: response.data?.length || 0 } };
      setRows(payload.data);
      setTotal(payload.meta?.total || payload.total || 0);
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Erro ao carregar', detail: 'Falha ao obter chamados', life: 3000 });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page, perPage]);

  function leftToolbarTemplate() {
    return <div className="flex gap-2"><Button label="Novo Chamado" icon="pi pi-plus" onClick={() => setDlgCriar(true)} /></div>;
  }

  function rightToolbarTemplate() {
    return (
      <div className="w-full flex items-center gap-2 justify-end">
        <span className="p-input-icon-left flex-1 min-w-[320px]">
          <InputText
            className="w-full"
            value={filters.busca}
            onChange={(e) => setFilters((f) => ({ ...f, busca: e.target.value }))}
            placeholder="Buscar nº do chamado/pedido ou nome do cliente"
          />
        </span>

        <Dropdown
          value={filters.status}
          options={STATUS_OPTIONS}
          optionLabel="label"
          optionValue="value"
          onChange={(e) => setFilters((f) => ({ ...f, status: e.value }))}
          placeholder="Status"
          showClear
        />
        <Dropdown
          value={filters.prioridade}
          options={PRIORIDADES}
          onChange={(e) => setFilters((f) => ({ ...f, prioridade: e.value }))}
          placeholder="Prioridade"
          showClear
        />
        <Button label="Filtrar" icon="pi pi-filter" outlined onClick={() => { setPage(0); load(); }} />
        <Button
          label="Limpar"
          icon="pi pi-times"
          text
          onClick={() => {
            setFilters({ busca: '', status: '', prioridade: '', assistencia_id: '' });
            setPage(0); load();
          }}
        />
      </div>
    );
  }

  const acoesTemplate = (r) => {
    const isLocked = ['entregue','cancelado'].includes(String(r.status || '').toLowerCase());
    return (
      <div className="flex gap-2">
        <Button size="small" label="Ver" icon="pi pi-eye" text onClick={() => setDetalheId(r.id)} />
        <Button
          size="small"
          label="Editar"
          icon="pi pi-pencil"
          outlined
          disabled={isLocked}
          onClick={() => { if (!isLocked) { setEditarId(r.id); setDlgEditar(true); } }}
        />
      </div>
    );
  };


  return (
    <SakaiLayout>
      <Toast ref={toast} position="top-center" />
      <ConfirmDialog />

      <div className="p-4">
        <div className="mb-3">
          <Toolbar
            className="tb-assistencias"
            left={leftToolbarTemplate}
            right={rightToolbarTemplate}
          />
        </div>

        <DataTable
          value={rows}
          loading={loading}
          paginator
          totalRecords={total}
          rows={perPage}
          first={page * perPage}
          onPage={(e) => {
            setPage(Math.floor(e.first / e.rows));
            setPerPage(e.rows);
          }}
          rowsPerPageOptions={[10, 20, 30, 50]}
          responsiveLayout="scroll"
          emptyMessage="Nenhum chamado encontrado"
        >
          <Column header="#" body={(r) => <Button text label={r.numero} onClick={() => setDetalheId(r.id)} />}/>
          <Column field="origem_tipo" header="Origem"/>
          <Column header="Cliente" body={(r) => r.pedido?.cliente || '—'} />
          <Column header="Assistência" body={(r) => r.assistencia?.nome || '—'}/>
          <Column
            header="Status"
            body={(r) => <Tag value={statusLabel(r.status)} severity={statusSeverity(r.status)} />}
          />
          <Column header="Prioridade" body={(r) => <Tag value={r.prioridade} />} />
          <Column
            header="Prazo"
            body={(r) => <PrazoTag dateStr={r.prazo_max} status={r.status} />}
          />
          <Column field="updated_at" header="Atualizado" body={(r) => new Date(r.updated_at).toLocaleString()} />
          <Column header="Ações" body={acoesTemplate} style={{ width: 180 }} />
        </DataTable>
      </div>

      <Dialog header="Detalhe do Chamado" visible={!!detalheId} style={{ width: '90vw', maxWidth: 1200 }} modal
              onHide={() => setDetalheId(null)}>
        {detalheId && (
          <ChamadoDetalhe
            chamadoId={detalheId}
            onClose={() => setDetalheId(null)}
            onChanged={() => {
              setPage((p) => p);
              load();
            }}
          />
        )}
      </Dialog>

      <Dialog header="Novo Chamado" visible={dlgCriar} style={{ width: 780 }} modal onHide={() => setDlgCriar(false)}>
        <CriarChamadoDialog
          visible={dlgCriar}
          onHide={() => setDlgCriar(false)}
          onCreated={() => { setPage(0); load(); }}
        />
      </Dialog>

      <Dialog header="Editar Chamado" visible={dlgEditar} style={{ width: 780 }} modal onHide={() => setDlgEditar(false)}>
        {editarId && (
          <EditarChamadoDialog
            chamadoId={editarId}
            onHide={() => setDlgEditar(false)}
            onSaved={() => { setDlgEditar(false); setPage(0); load(); }}
          />
        )}
      </Dialog>
    </SakaiLayout>
  );
};

export default Assistencias;
