import React, { useEffect, useMemo, useRef, useState } from 'react';
import SakaiLayout from '../layouts/SakaiLayout';
import { Panel } from 'primereact/panel';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useNavigate } from 'react-router-dom';

import { comms } from '../services/apiComunicacaoAdmin';
import { ensureArray } from '../utils/array/ensureArray';
import { ChannelTag } from '../components/comunicacao/Tags';
import { Tag } from 'primereact/tag';
import {formatDateTimePtBR} from "../utils/date/dateHelpers";

export default function ComunicacaoTemplates() {
  const toastRef = useRef(null);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);

  const [q, setQ] = useState('');
  const [channel, setChannel] = useState(null);
  const [active, setActive] = useState(null);

  const params = useMemo(
    () => ({
      q: q || undefined,
      channel: channel || undefined,
      active: active === null ? undefined : active,
      per_page: 2000,
    }),
    [q, channel, active]
  );

  async function load() {
    setLoading(true);
    try {
      const res = await comms.templatesIndex(params);

      // ✅ nova API: paginator { data: [...] }
      const list = res?.data?.data ?? res?.data ?? [];
      setRows(ensureArray(list));
    } catch (e) {
      console.error(e);
      toastRef.current?.show({ severity: 'error', summary: 'Erro', detail: e?.message || 'Falha ao carregar templates.' });
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.q, params.channel, params.active]);

  const channelOptions = [
    { label: 'Todos', value: null },
    { label: 'WhatsApp', value: 'whatsapp' },
    { label: 'Email', value: 'email' },
    { label: 'SMS', value: 'sms' },
  ];

  const activeOptions = [
    { label: 'Todos', value: null },
    { label: 'Ativos', value: true },
    { label: 'Inativos', value: false },
  ];

  const ActiveTag = ({ value }) => (
    <Tag severity={value ? 'success' : 'secondary'} value={value ? 'ativo' : 'inativo'} />
  );

  return (
    <SakaiLayout>
      <Toast ref={toastRef} />

      <div className="p-4">
        <Panel
          header="Comunicação • Templates"
          headerTemplate={() => (
            <div className="flex align-items-center justify-content-between w-full">
              <div className="font-semibold">Comunicação • Templates</div>
              <div className="flex gap-2">
                <Button label="Novo" icon="pi pi-plus" className="p-button-sm" onClick={() => navigate('/comunicacao/templates/novo')} />
                <Button label="Atualizar" icon="pi pi-refresh" className="p-button-sm p-button-secondary" onClick={load} loading={loading} />
              </div>
            </div>
          )}
        >
          <div className="grid mb-3">
            <div className="col-12 md:col-6">
              <span className="p-input-icon-left w-full">
                <i className="pi pi-search" />
                <InputText
                  className="w-full"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar por code, name..."
                />
              </span>
            </div>

            <div className="col-12 md:col-3">
              <Dropdown className="w-full" value={channel} options={channelOptions} onChange={(e) => setChannel(e.value)} placeholder="Canal" />
            </div>

            <div className="col-12 md:col-3">
              <Dropdown className="w-full" value={active} options={activeOptions} onChange={(e) => setActive(e.value)} placeholder="Status" />
            </div>

            <div className="col-12 flex justify-content-end">
              <Button
                label="Limpar"
                icon="pi pi-filter-slash"
                className="p-button-text"
                onClick={() => { setQ(''); setChannel(null); setActive(null); }}
              />
            </div>
          </div>

          <DataTable value={rows} loading={loading} paginator rows={25} responsiveLayout="scroll" emptyMessage="Nenhum template encontrado.">
            <Column field="id" header="ID" style={{ width: 90 }} />
            <Column field="code" header="Code" />
            <Column field="name" header="Nome" />
            <Column field="channel" header="Canal" body={(r) => <ChannelTag value={r.channel} />} style={{ width: 140 }} />
            <Column field="active" header="Status" body={(r) => <ActiveTag value={!!r.active} />} style={{ width: 120 }} />
            <Column header="Versão" body={(r) => r?.currentVersion?.version ?? '-'} style={{ width: 110 }} />
            <Column header="Atualizado" body={(r) => formatDateTimePtBR(r?.updated_at)}/>

            <Column
              header="Ações"
              body={(r) => (
                <div className="flex gap-2">
                  <Button label="Editar" icon="pi pi-pencil" className="p-button-sm" onClick={() => navigate(`/comunicacao/templates/${r.id}`)} />
                </div>
              )}
              style={{ width: 160 }}
            />
          </DataTable>
        </Panel>
      </div>
    </SakaiLayout>
  );
}
