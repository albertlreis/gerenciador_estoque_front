import React, { useEffect, useMemo, useRef, useState } from 'react';
import SakaiLayout from '../layouts/SakaiLayout';
import { Panel } from 'primereact/panel';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { comms } from '../services/apiComunicacaoAdmin';
import { ensureArray } from '../utils/array/ensureArray';
import { addDays, formatDatePtBR, formatDateTimePtBR } from '../utils/date/dateHelpers';
import { StatusTag, ChannelTag } from '../components/comunicacao/Tags';

function Card({ title, value, icon }) {
  return (
    <div className="col-12 md:col-3">
      <div className="p-3 border-1 surface-border border-round">
        <div className="flex align-items-center justify-content-between">
          <div>
            <div className="text-500">{title}</div>
            <div className="text-2xl font-semibold">{value}</div>
          </div>
          <i className={`pi ${icon} text-2xl text-500`} />
        </div>
      </div>
    </div>
  );
}

export default function ComunicacaoDashboard() {
  const toastRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [requests, setRequests] = useState([]);
  const [range, setRange] = useState([addDays(new Date(), -6), new Date()]);

  const params = useMemo(() => {
    const [ini, fim] = range || [];
    return {
      from: ini ? formatDatePtBR(ini) : undefined,
      to: fim ? formatDatePtBR(fim) : undefined,
      per_page: 5000,
    };
  }, [range]);

  const counters = useMemo(() => {
    const byStatus = {};
    const byChannel = {};
    for (const m of ensureArray(messages)) {
      const s = String(m.status || 'unknown').toLowerCase();
      const c = String(m.channel || 'unknown').toLowerCase();
      byStatus[s] = (byStatus[s] || 0) + 1;
      byChannel[c] = (byChannel[c] || 0) + 1;
    }
    return { byStatus, byChannel };
  }, [messages]);

  const listFromPaginator = (res) => ensureArray(res?.data?.data ?? res?.data ?? []);

  async function load() {
    setLoading(true);
    try {
      const [resMsg, resReq] = await Promise.all([
        comms.messagesIndex(params),
        comms.requestsIndex(params),
      ]);

      setMessages(listFromPaginator(resMsg));
      setRequests(listFromPaginator(resReq));
    } catch (e) {
      console.error(e);
      toastRef.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: e?.message || 'Falha ao carregar dashboard de comunicação.',
      });
      setMessages([]);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.from, params.to]);

  const recent = useMemo(() => ensureArray(messages).slice(0, 30), [messages]);

  return (
    <SakaiLayout>
      <Toast ref={toastRef} />

      <div className="p-4">
        <Panel
          header="Comunicação • Dashboard"
          headerTemplate={() => (
            <div className="flex align-items-center justify-content-between w-full">
              <div className="flex align-items-center gap-2">
                <span className="font-semibold">Comunicação • Dashboard</span>
                <span className="text-500 text-sm">
                  {params.from} → {params.to}
                </span>
              </div>
              <Button
                label="Atualizar"
                icon="pi pi-refresh"
                onClick={load}
                loading={loading}
                className="p-button-sm"
              />
            </div>
          )}
        >
          {loading ? (
            <div className="flex justify-content-center p-5">
              <ProgressSpinner />
            </div>
          ) : (
            <>
              <div className="grid mb-3">
                <Card title="Requests" value={ensureArray(requests).length} icon="pi-send" />
                <Card title="Mensagens" value={ensureArray(messages).length} icon="pi-inbox" />
                <Card title="Falhas" value={counters.byStatus.failed || 0} icon="pi-times-circle" />
                <Card title="Entregues" value={counters.byStatus.delivered || 0} icon="pi-check" />
              </div>

              <div className="grid mb-3">
                <Card title="WhatsApp" value={counters.byChannel.whatsapp || 0} icon="pi-comments" />
                <Card title="Email" value={counters.byChannel.email || 0} icon="pi-envelope" />
                <Card title="SMS" value={counters.byChannel.sms || 0} icon="pi-mobile" />
                <Card title="Bloqueadas" value={counters.byStatus.blocked || 0} icon="pi-ban" />
              </div>

              <div className="mt-3">
                <div className="text-600 mb-2 font-semibold">Últimas mensagens</div>
                <DataTable value={recent} paginator rows={10} responsiveLayout="scroll" emptyMessage="Sem mensagens.">
                  <Column field="id" header="ID" style={{ width: 90 }} />

                  {/* ✅ datetime pt-BR */}
                  <Column
                    header="Data"
                    body={(r) => formatDateTimePtBR(r?.created_at)}
                    style={{ width: 170 }}
                  />

                  <Column field="channel" header="Canal" body={(r) => <ChannelTag value={r.channel} />} />
                  <Column field="status" header="Status" body={(r) => <StatusTag value={r.status} />} />
                  <Column field="template_key" header="Template" />
                  <Column field="recipient" header="Destinatário" />
                </DataTable>
              </div>
            </>
          )}
        </Panel>
      </div>
    </SakaiLayout>
  );
}
