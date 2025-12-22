import React, { useEffect, useRef, useState } from 'react';
import SakaiLayout from '../layouts/SakaiLayout';
import { Panel } from 'primereact/panel';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { useNavigate, useParams } from 'react-router-dom';

import { comms } from '../services/apiComunicacaoAdmin';
import { StatusTag, ChannelTag } from '../components/comunicacao/Tags';
import JsonViewer from '../components/comunicacao/JsonViewer';

export default function ComunicacaoMessageShow() {
  const toastRef = useRef(null);
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const res = await comms.messagesShow(id);
      setMsg(res?.data ?? res);
    } catch (e) {
      console.error(e);
      toastRef.current?.show({ severity: 'error', summary: 'Erro', detail: e?.message || 'Falha ao carregar mensagem.' });
      setMsg(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function onRetry() {
    confirmDialog({
      header: 'Reprocessar mensagem',
      message: 'Deseja reprocessar esta mensagem agora?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Reprocessar',
      rejectLabel: 'Cancelar',
      acceptClassName: 'p-button-warning',
      accept: async () => {
        try {
          await comms.messagesRetry(id);
          toastRef.current?.show({ severity: 'success', summary: 'OK', detail: 'Reprocessamento solicitado.' });
          load();
        } catch (e) {
          console.error(e);
          toastRef.current?.show({ severity: 'error', summary: 'Erro', detail: e?.message || 'Falha ao reprocessar.' });
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
          header={`Comunicação • Mensagem #${id}`}
          headerTemplate={() => (
            <div className="flex align-items-center justify-content-between w-full">
              <div className="font-semibold">Mensagem #{id}</div>
              <div className="flex gap-2">
                <Button label="Voltar" icon="pi pi-arrow-left" className="p-button-text" onClick={() => navigate('/comunicacao/messages')} />
                <Button label="Retry" icon="pi pi-refresh" className="p-button-sm p-button-warning" onClick={onRetry} disabled={loading} />
                <Button label="Atualizar" icon="pi pi-sync" className="p-button-sm p-button-secondary" onClick={load} loading={loading} />
              </div>
            </div>
          )}
        >
          {!msg ? (
            <div className="text-500">Mensagem não encontrada.</div>
          ) : (
            <>
              <div className="grid mb-3">
                <div className="col-12 md:col-3">
                  <div className="text-500">Status</div>
                  <div className="mt-1"><StatusTag value={msg.status} /></div>
                </div>
                <div className="col-12 md:col-3">
                  <div className="text-500">Canal</div>
                  <div className="mt-1"><ChannelTag value={msg.channel} /></div>
                </div>
                <div className="col-12 md:col-3">
                  <div className="text-500">Template</div>
                  <div className="mt-1 font-semibold">{msg.template_key || '-'}</div>
                </div>
                <div className="col-12 md:col-3">
                  <div className="text-500">Destinatário</div>
                  <div className="mt-1">{msg.recipient || '-'}</div>
                </div>
              </div>

              <div className="mb-3">
                <div className="text-600 mb-2 font-semibold">Detalhes / Payload</div>
                <JsonViewer value={msg} />
              </div>
            </>
          )}
        </Panel>
      </div>
    </SakaiLayout>
  );
}
