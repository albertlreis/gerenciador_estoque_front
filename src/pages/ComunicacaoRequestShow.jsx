import React, { useEffect, useRef, useState } from 'react';
import SakaiLayout from '../layouts/SakaiLayout';
import { Panel } from 'primereact/panel';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useNavigate, useParams } from 'react-router-dom';

import { comms } from '../services/apiComunicacaoAdmin';
import { ensureArray } from '../utils/array/ensureArray';
import { StatusTag, ChannelTag } from '../components/comunicacao/Tags';
import JsonViewer from '../components/comunicacao/JsonViewer';

export default function ComunicacaoRequestShow() {
  const toastRef = useRef(null);
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [req, setReq] = useState(null);
  const [messages, setMessages] = useState([]);

  async function load() {
    setLoading(true);
    try {
      const res = await comms.requestsShow(id);
      const data = res?.data ?? res;

      setReq(data);

      // se sua API já retornar messages dentro do request, usa direto
      const embedded = ensureArray(data?.messages);
      if (embedded.length) {
        setMessages(embedded);
      } else {
        // fallback: buscar messages por request_id (se sua API suportar)
        const resMsg = await comms.messagesIndex({ request_id: id, per_page: 2000 });
        setMessages(ensureArray(resMsg?.data));
      }
    } catch (e) {
      console.error(e);
      toastRef.current?.show({ severity: 'error', summary: 'Erro', detail: e?.message || 'Falha ao carregar request.' });
      setReq(null);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function onCancel() {
    confirmDialog({
      header: 'Cancelar request',
      message: 'Cancelar este request? (apenas se ainda estiver pendente)',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Cancelar request',
      rejectLabel: 'Voltar',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await comms.requestsCancel(id);
          toastRef.current?.show({ severity: 'success', summary: 'Cancelado', detail: 'Request cancelado.' });
          load();
        } catch (e) {
          console.error(e);
          toastRef.current?.show({ severity: 'error', summary: 'Erro', detail: e?.message || 'Falha ao cancelar.' });
        }
      },
    });
  }

  return (
    <SakaiLayout>
      <Toast ref={toastRef} />
      <ConfirmDialog />

      <div className="p-4">
        <Panel
          header={`Comunicação • Request #${id}`}
          headerTemplate={() => (
            <div className="flex align-items-center justify-content-between w-full">
              <div className="font-semibold">Request #{id}</div>
              <div className="flex gap-2">
                <Button label="Voltar" icon="pi pi-arrow-left" className="p-button-text" onClick={() => navigate('/comunicacao/requests')} />
                <Button label="Cancelar" icon="pi pi-ban" className="p-button-sm p-button-danger" onClick={onCancel} disabled={loading} />
                <Button label="Atualizar" icon="pi pi-refresh" className="p-button-sm p-button-secondary" onClick={load} loading={loading} />
              </div>
            </div>
          )}
        >
          {!req ? (
            <div className="text-500">Request não encontrado.</div>
          ) : (
            <>
              <div className="grid mb-3">
                <div className="col-12 md:col-3">
                  <div className="text-500">Status</div>
                  <div className="mt-1"><StatusTag value={req.status} /></div>
                </div>
                <div className="col-12 md:col-3">
                  <div className="text-500">Template</div>
                  <div className="mt-1 font-semibold">{req.template_key || '-'}</div>
                </div>
                <div className="col-12 md:col-3">
                  <div className="text-500">Destinatário</div>
                  <div className="mt-1">{req.recipient || '-'}</div>
                </div>
                <div className="col-12 md:col-3">
                  <div className="text-500">Criado em</div>
                  <div className="mt-1">{req.created_at || '-'}</div>
                </div>
              </div>

              <div className="mb-3">
                <div className="text-600 mb-2 font-semibold">Metadata / Payload</div>
                <JsonViewer value={req} />
              </div>

              <div>
                <div className="text-600 mb-2 font-semibold">Mensagens</div>
                <DataTable value={messages} responsiveLayout="scroll" paginator rows={15} emptyMessage="Sem mensagens vinculadas.">
                  <Column field="id" header="ID" style={{ width: 90 }} />
                  <Column field="created_at" header="Data" />
                  <Column field="channel" header="Canal" body={(r) => <ChannelTag value={r.channel} />} style={{ width: 140 }} />
                  <Column field="status" header="Status" body={(r) => <StatusTag value={r.status} />} style={{ width: 140 }} />
                  <Column field="recipient" header="Destinatário" />
                  <Column
                    header="Abrir"
                    body={(r) => (
                      <Button
                        label="Detalhe"
                        icon="pi pi-external-link"
                        className="p-button-sm"
                        onClick={() => navigate(`/comunicacao/messages/${r.id}`)}
                      />
                    )}
                    style={{ width: 160 }}
                  />
                </DataTable>
              </div>
            </>
          )}
        </Panel>
      </div>
    </SakaiLayout>
  );
}
