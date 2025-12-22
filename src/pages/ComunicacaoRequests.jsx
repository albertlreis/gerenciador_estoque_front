import React, { useEffect, useMemo, useRef, useState } from 'react';
import SakaiLayout from '../layouts/SakaiLayout';
import { Panel } from 'primereact/panel';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useNavigate } from 'react-router-dom';

import { comms } from '../services/apiComunicacaoAdmin';
import { ensureArray } from '../utils/array/ensureArray';
import {addDays, formatDateTimePtBR, toIsoDate} from '../utils/date/dateHelpers';
import { StatusTag } from '../components/comunicacao/Tags';

export default function ComunicacaoRequests() {
  const toastRef = useRef(null);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);

  const [periodo, setPeriodo] = useState([addDays(new Date(), -6), new Date()]);
  const [q, setQ] = useState('');

  const params = useMemo(() => {
    const [ini, fim] = Array.isArray(periodo) ? periodo : [];
    return {
      from: ini ? toIsoDate(ini) : undefined,
      to: fim ? toIsoDate(fim) : undefined,
      q: q || undefined,
      per_page: 2000,
    };
  }, [periodo, q]);

  async function load() {
    setLoading(true);
    try {
      const res = await comms.requestsIndex(params);
      const rows = ensureArray(res?.data?.data ?? res?.data ?? []);
      setRows(rows);
    } catch (e) {
      console.error(e);
      toastRef.current?.show({ severity: 'error', summary: 'Erro', detail: e?.message || 'Falha ao carregar requests.' });
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.from, params.to, params.q]);

  return (
    <SakaiLayout>
      <Toast ref={toastRef} />

      <div className="p-4">
        <Panel
          header="Comunicação • Requests"
          headerTemplate={() => (
            <div className="flex align-items-center justify-content-between w-full">
              <div className="font-semibold">Comunicação • Requests</div>
              <Button label="Atualizar" icon="pi pi-refresh" className="p-button-sm" onClick={load} loading={loading} />
            </div>
          )}
        >
          <div className="grid mb-3">
            <div className="col-12 md:col-4">
              <label className="block mb-1">Período</label>
              <Calendar
                value={periodo}
                onChange={(e) => setPeriodo(e.value)}
                selectionMode="range"
                readOnlyInput
                className="w-full"
                dateFormat="dd/mm/yy"
              />
            </div>
            <div className="col-12 md:col-6">
              <label className="block mb-1">Buscar</label>
              <span className="p-input-icon-left w-full">
                <i className="pi pi-search" />
                <InputText className="w-full" value={q} onChange={(e) => setQ(e.target.value)} placeholder="id, correlation_id, template_key, recipient..." />
              </span>
            </div>
            <div className="col-12 md:col-2 flex align-items-end justify-content-end">
              <Button className="p-button-text" label="Limpar" icon="pi pi-filter-slash" onClick={() => { setQ(''); setPeriodo([addDays(new Date(), -6), new Date()]); }} />
            </div>
          </div>

          <DataTable value={rows} loading={loading} paginator rows={25} responsiveLayout="scroll" emptyMessage="Nenhum request encontrado.">
            <Column field="id" header="ID" style={{ width: 90 }} />
            <Column header="Data" body={(r) => formatDateTimePtBR(r?.created_at)}/>
            <Column field="status" header="Status" body={(r) => <StatusTag value={r.status} />} style={{ width: 140 }} />
            <Column field="template_key" header="Template" />
            <Column field="recipient" header="Destinatário" />
            <Column
              header="Ações"
              body={(r) => (
                <Button
                  label="Abrir"
                  icon="pi pi-external-link"
                  className="p-button-sm"
                  onClick={() => navigate(`/comunicacao/requests/${r.id}`)}
                />
              )}
              style={{ width: 140 }}
            />
          </DataTable>
        </Panel>
      </div>
    </SakaiLayout>
  );
}
