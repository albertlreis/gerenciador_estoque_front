import React, { useEffect, useMemo, useRef, useState } from 'react';
import SakaiLayout from '../layouts/SakaiLayout';
import { Panel } from 'primereact/panel';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useNavigate } from 'react-router-dom';

import { comms } from '../services/apiComunicacaoAdmin';
import { ensureArray } from '../utils/array/ensureArray';
import {addDays, formatDateTimePtBR, toIsoDate} from '../utils/date/dateHelpers';
import { StatusTag, ChannelTag } from '../components/comunicacao/Tags';

export default function ComunicacaoMessages() {
  const toastRef = useRef(null);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);

  const [periodo, setPeriodo] = useState([addDays(new Date(), -6), new Date()]);
  const [q, setQ] = useState('');
  const [channel, setChannel] = useState(null);
  const [status, setStatus] = useState(null);

  const params = useMemo(() => {
    const [ini, fim] = Array.isArray(periodo) ? periodo : [];
    return {
      from: ini ? toIsoDate(ini) : undefined,
      to: fim ? toIsoDate(fim) : undefined,
      q: q || undefined,
      channel: channel || undefined,
      status: status || undefined,
      per_page: 2000,
    };
  }, [periodo, q, channel, status]);

  async function load() {
    setLoading(true);
    try {
      const res = await comms.messagesIndex(params);
      setRows(ensureArray(res?.data));
    } catch (e) {
      console.error(e);
      toastRef.current?.show({ severity: 'error', summary: 'Erro', detail: e?.message || 'Falha ao carregar mensagens.' });
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.from, params.to, params.q, params.channel, params.status]);

  const channelOptions = [
    { label: 'Todos', value: null },
    { label: 'WhatsApp', value: 'whatsapp' },
    { label: 'Email', value: 'email' },
    { label: 'SMS', value: 'sms' },
  ];

  const statusOptions = [
    { label: 'Todos', value: null },
    { label: 'queued', value: 'queued' },
    { label: 'sending', value: 'sending' },
    { label: 'sent', value: 'sent' },
    { label: 'delivered', value: 'delivered' },
    { label: 'read', value: 'read' },
    { label: 'failed', value: 'failed' },
    { label: 'blocked', value: 'blocked' },
    { label: 'canceled', value: 'canceled' },
  ];

  return (
    <SakaiLayout>
      <Toast ref={toastRef} />

      <div className="p-4">
        <Panel
          header="Comunicação • Mensagens"
          headerTemplate={() => (
            <div className="flex align-items-center justify-content-between w-full">
              <div className="font-semibold">Comunicação • Mensagens</div>
              <Button label="Atualizar" icon="pi pi-refresh" className="p-button-sm" onClick={load} loading={loading} />
            </div>
          )}
        >
          <div className="grid mb-3">
            <div className="col-12 md:col-4">
              <label className="block mb-1">Período</label>
              <Calendar value={periodo} onChange={(e) => setPeriodo(e.value)} selectionMode="range" readOnlyInput className="w-full" dateFormat="dd/mm/yy" />
            </div>

            <div className="col-12 md:col-3">
              <label className="block mb-1">Canal</label>
              <Dropdown className="w-full" value={channel} options={channelOptions} onChange={(e) => setChannel(e.value)} />
            </div>

            <div className="col-12 md:col-3">
              <label className="block mb-1">Status</label>
              <Dropdown className="w-full" value={status} options={statusOptions} onChange={(e) => setStatus(e.value)} />
            </div>

            <div className="col-12 md:col-2 flex align-items-end justify-content-end">
              <Button className="p-button-text" label="Limpar" icon="pi pi-filter-slash" onClick={() => {
                setQ(''); setChannel(null); setStatus(null); setPeriodo([addDays(new Date(), -6), new Date()]);
              }} />
            </div>

            <div className="col-12">
              <label className="block mb-1">Buscar</label>
              <span className="p-input-icon-left w-full">
                <i className="pi pi-search" />
                <InputText className="w-full" value={q} onChange={(e) => setQ(e.target.value)} placeholder="id, request_id, template_key, recipient, provider..." />
              </span>
            </div>
          </div>

          <DataTable value={rows} loading={loading} paginator rows={25} responsiveLayout="scroll" emptyMessage="Nenhuma mensagem encontrada.">
            <Column field="id" header="ID" style={{ width: 90 }} />
            <Column header="Data" body={(r) => formatDateTimePtBR(r?.created_at)}/>
            <Column field="channel" header="Canal" body={(r) => <ChannelTag value={r.channel} />} style={{ width: 140 }} />
            <Column field="status" header="Status" body={(r) => <StatusTag value={r.status} />} style={{ width: 140 }} />
            <Column
              header="Template"
              body={(r) => r?.template?.code || r?.template?.name || r?.template_key || '-'}
            />

            <Column
              header="Destinatário"
              body={(r) => r?.recipient || r?.to_email || r?.to_phone || '-'}
            />

            <Column
              header="Ações"
              body={(r) => (
                <Button label="Abrir" icon="pi pi-external-link" className="p-button-sm" onClick={() => navigate(`/comunicacao/messages/${r.id}`)} />
              )}
              style={{ width: 140 }}
            />
          </DataTable>
        </Panel>
      </div>
    </SakaiLayout>
  );
}
