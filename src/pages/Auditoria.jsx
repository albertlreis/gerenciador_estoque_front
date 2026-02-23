import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';

import SakaiLayout from '../layouts/SakaiLayout';
import { listarEventos } from '../services/auditoriaService';
import {
  AUDITORIA_ACOES,
  AUDITORIA_MODULOS,
  AUDITORIA_TIPOS_ENTIDADE,
  formatarDataHoraAuditoria,
  getAcaoSeverity,
  toApiDate,
} from '../utils/auditoriaUtils';
import AuditoriaEventoDetalheDialog from '../components/auditoria/AuditoriaEventoDetalheDialog';
import { useDebouncedCallback } from '../hooks/useDebouncedCallback';

const FILTROS_INICIAIS = {
  periodo: null,
  module: null,
  action: null,
  auditable_type: null,
  auditable_id: '',
  actor_name: '',
  q: '',
};

const ROWS_DEFAULT = 20;

export default function Auditoria() {
  const toast = useRef(null);
  const [loading, setLoading] = useState(false);
  const [eventos, setEventos] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lazy, setLazy] = useState({ first: 0, rows: ROWS_DEFAULT });
  const [filtrosForm, setFiltrosForm] = useState(FILTROS_INICIAIS);
  const [filtrosAplicados, setFiltrosAplicados] = useState(FILTROS_INICIAIS);
  const [eventoSelecionado, setEventoSelecionado] = useState(null);

  const tiposEntidadeOptions = useMemo(() => {
    const map = new Map();

    AUDITORIA_TIPOS_ENTIDADE.forEach((item) => map.set(item.value, item));
    eventos.forEach((evento) => {
      if (!evento?.auditable_type) return;
      if (map.has(evento.auditable_type)) return;
      map.set(evento.auditable_type, {
        label: evento.auditable_type,
        value: evento.auditable_type,
      });
    });

    return Array.from(map.values());
  }, [eventos]);

  const carregarEventos = useCallback(async () => {
    setLoading(true);
    try {
      const [dateFrom, dateTo] = Array.isArray(filtrosAplicados.periodo)
        ? filtrosAplicados.periodo
        : [null, null];

      const params = {
        page: Math.floor(lazy.first / lazy.rows) + 1,
        per_page: lazy.rows,
        date_from: toApiDate(dateFrom) || undefined,
        date_to: toApiDate(dateTo) || undefined,
        module: filtrosAplicados.module || undefined,
        action: filtrosAplicados.action || undefined,
        auditable_type: filtrosAplicados.auditable_type || undefined,
        auditable_id: filtrosAplicados.auditable_id
          ? Number(filtrosAplicados.auditable_id)
          : undefined,
        actor_name: filtrosAplicados.actor_name || undefined,
        q: filtrosAplicados.q || undefined,
      };

      const response = await listarEventos(params);
      const dados = response?.data?.data ?? [];
      const meta = response?.data?.meta ?? {};

      setEventos(Array.isArray(dados) ? dados : []);
      setTotalRecords(Number(meta.total || 0));
    } catch (error) {
      setEventos([]);
      setTotalRecords(0);
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: error?.response?.data?.message || 'Nao foi possivel carregar os eventos de auditoria.',
      });
    } finally {
      setLoading(false);
    }
  }, [filtrosAplicados, lazy.first, lazy.rows]);

  useEffect(() => {
    carregarEventos();
  }, [carregarEventos]);

  const aplicarFiltros = () => {
    setLazy((prev) => ({ ...prev, first: 0 }));
    setFiltrosAplicados({ ...filtrosForm });
  };

  const limparFiltros = () => {
    setLazy((prev) => ({ ...prev, first: 0 }));
    setFiltrosForm(FILTROS_INICIAIS);
    setFiltrosAplicados(FILTROS_INICIAIS);
  };

  const debouncedQ = useDebouncedCallback((q) => {
    setLazy((prev) => ({ ...prev, first: 0 }));
    setFiltrosAplicados((prev) => ({ ...prev, q: q || '' }));
  }, 450);

  return (
    <SakaiLayout>
      <Toast ref={toast} />

      <div className="p-4">
        <div className="flex justify-content-between align-items-center mb-3">
          <h2 className="m-0">Auditoria (Global)</h2>
          <Button
            icon="pi pi-refresh"
            label="Atualizar"
            outlined
            onClick={carregarEventos}
            loading={loading}
          />
        </div>

        <div className="surface-100 border-round p-3 mb-3">
          <div className="grid formgrid">
            <div className="field col-12 md:col-4">
              <label htmlFor="filtro-periodo">Periodo</label>
              <Calendar
                id="filtro-periodo"
                selectionMode="range"
                value={filtrosForm.periodo}
                onChange={(e) => setFiltrosForm((prev) => ({ ...prev, periodo: e.value }))}
                dateFormat="dd/mm/yy"
                showIcon
                className="w-full"
                readOnlyInput
              />
            </div>

            <div className="field col-12 md:col-2">
              <label htmlFor="filtro-modulo">Modulo</label>
              <Dropdown
                id="filtro-modulo"
                value={filtrosForm.module}
                options={AUDITORIA_MODULOS}
                onChange={(e) => setFiltrosForm((prev) => ({ ...prev, module: e.value }))}
                placeholder="Todos"
                showClear
                className="w-full"
              />
            </div>

            <div className="field col-12 md:col-2">
              <label htmlFor="filtro-acao">Acao</label>
              <Dropdown
                id="filtro-acao"
                value={filtrosForm.action}
                options={AUDITORIA_ACOES}
                onChange={(e) => setFiltrosForm((prev) => ({ ...prev, action: e.value }))}
                placeholder="Todas"
                showClear
                className="w-full"
              />
            </div>

            <div className="field col-12 md:col-2">
              <label htmlFor="filtro-tipo">Tipo entidade</label>
              <Dropdown
                id="filtro-tipo"
                value={filtrosForm.auditable_type}
                options={tiposEntidadeOptions}
                onChange={(e) => setFiltrosForm((prev) => ({ ...prev, auditable_type: e.value }))}
                placeholder="Todos"
                showClear
                className="w-full"
              />
            </div>

            <div className="field col-12 md:col-2">
              <label htmlFor="filtro-id-entidade">ID entidade</label>
              <InputText
                id="filtro-id-entidade"
                value={filtrosForm.auditable_id}
                onChange={(e) => setFiltrosForm((prev) => ({ ...prev, auditable_id: e.target.value }))}
                placeholder="Ex.: 123"
                keyfilter="pint"
              />
            </div>

            <div className="field col-12 md:col-4">
              <label htmlFor="filtro-usuario">Usuario</label>
              <InputText
                id="filtro-usuario"
                value={filtrosForm.actor_name}
                onChange={(e) => setFiltrosForm((prev) => ({ ...prev, actor_name: e.target.value }))}
                placeholder="Nome do usuario"
              />
            </div>

            <div className="field col-12 md:col-8">
              <label htmlFor="filtro-q">Texto livre</label>
              <InputText
                id="filtro-q"
                value={filtrosForm.q}
                onChange={(e) => {
                  const nextQ = e.target.value;
                  setFiltrosForm((prev) => ({ ...prev, q: nextQ }));
                  debouncedQ(nextQ);
                }}
                placeholder="Buscar em label, usuario e metadata"
              />
            </div>

            <div className="col-12 flex justify-content-end gap-2 mt-2">
              <Button label="Buscar" icon="pi pi-search" onClick={aplicarFiltros} />
              <Button
                label="Limpar"
                icon="pi pi-times"
                outlined
                severity="secondary"
                onClick={limparFiltros}
              />
            </div>
          </div>
        </div>

        <DataTable
          value={eventos}
          dataKey="id"
          loading={loading}
          paginator
          lazy
          rows={lazy.rows}
          first={lazy.first}
          totalRecords={totalRecords}
          rowsPerPageOptions={[10, 20, 50]}
          onPage={(e) => setLazy({ first: e.first, rows: e.rows })}
          responsiveLayout="scroll"
          emptyMessage="Nenhum evento de auditoria encontrado."
          size="small"
        >
          <Column
            field="created_at"
            header="Data/Hora"
            body={(row) => formatarDataHoraAuditoria(row.created_at)}
            style={{ minWidth: '170px' }}
          />
          <Column field="module" header="Modulo" style={{ minWidth: '120px' }} />
          <Column
            field="action"
            header="Acao"
            body={(row) => <Tag value={row.action || '-'} severity={getAcaoSeverity(row.action)} />}
            style={{ minWidth: '130px' }}
          />
          <Column
            header="Entidade"
            body={(row) => `${row.auditable_type || '-'} #${row.auditable_id ?? '-'}`}
            style={{ minWidth: '180px' }}
          />
          <Column
            header="Usuario"
            body={(row) => row.actor_name || row.actor_type || '-'}
            style={{ minWidth: '160px' }}
          />
          <Column field="label" header="Label" style={{ minWidth: '280px' }} />
          <Column
            field="mudancas_count"
            header="Mudancas"
            body={(row) => Number(row.mudancas_count || 0)}
            style={{ width: '100px', textAlign: 'center' }}
          />
          <Column
            header=""
            body={(row) => (
              <Button
                icon="pi pi-search"
                text
                rounded
                aria-label="Ver evento"
                onClick={() => setEventoSelecionado(row.id)}
              />
            )}
            style={{ width: '70px', textAlign: 'center' }}
          />
        </DataTable>
      </div>

      <AuditoriaEventoDetalheDialog
        visible={Boolean(eventoSelecionado)}
        eventoId={eventoSelecionado}
        onHide={() => setEventoSelecionado(null)}
      />
    </SakaiLayout>
  );
}
