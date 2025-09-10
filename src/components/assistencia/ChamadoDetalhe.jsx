import React, { useEffect, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import { Timeline } from 'primereact/timeline';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

import ItemAcoes from './ItemAcoes';
import DialogAdicionarItem from './dialogs/DialogAdicionarItem';
import apiEstoque from '../../services/apiEstoque';
import PrazoTag from './tags/PrazoTag';
import { statusSeverity, statusLabel } from '../../utils/assistencia';

export default function ChamadoDetalhe({ chamadoId, onClose, onChanged }) {
  const toast = useRef(null);
  const [chamado, setChamado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dlgAddItem, setDlgAddItem] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const response = await apiEstoque.get(`/assistencias/chamados/${chamadoId}`);
      setChamado(response.data?.data || response.data);
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Erro ao carregar', detail: 'Falha ao obter chamado', life: 3000 });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [chamadoId]);

  const itens = chamado?.itens || [];
  const logs = chamado?.logs || [];

  function handleAnyChange() {
    load();
    onChanged?.();
  }

  return (
    <div className="surface-card p-3 border-round">
      <Toast ref={toast} />
      <div className="flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="m-0">Chamado {chamado?.numero}</h3>
          <div className="flex align-items-center gap-2 mt-2">
            <Tag value={statusLabel(chamado?.status)} severity={statusSeverity(chamado?.status)} />
            <Tag value={`Prioridade: ${chamado?.prioridade}`} />
            <PrazoTag dateStr={chamado?.prazo_max} />
          </div>
          <div className="text-500 mt-2">
            Origem: {chamado?.origem_tipo} #{chamado?.origem_id || '—'}
            · Cliente: {chamado?.cliente?.nome || '—'}
            · Assistência: {chamado?.assistencia?.nome || '—'}
            · Local do reparo: {chamado?.local_reparo || '—'}
            · Custo por: {chamado?.custo_responsavel || '—'}
          </div>

          {chamado?.pedido && (
            <div className="mt-2 p-2 border-round surface-border surface-100">
              <div><b>Pedido #</b>{chamado.pedido.numero} · <b>Data:</b> {new Date(chamado.pedido.data).toLocaleDateString()}</div>
              <div><b>Cliente:</b> {chamado.pedido.cliente || '—'}</div>

              {Array.isArray(chamado.pedido.pedidos_fabrica) && chamado.pedido.pedidos_fabrica.length > 0 && (
                <div className="mt-1">
                  {chamado.pedido.pedidos_fabrica.map((pf) => (
                    <div key={pf.id}>
                      <b>Pedido Fábrica:</b> #{pf.id}
                      {' · '}<b>Status:</b> {pf.status}
                      {' · '}<b>Previsto:</b> {pf.data_previsao_entrega ? new Date(pf.data_previsao_entrega).toLocaleDateString() : '—'}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button label="Adicionar item" icon="pi pi-plus" onClick={() => setDlgAddItem(true)} outlined />
          <Button label="Atualizar" icon="pi pi-refresh" onClick={load} outlined />
          <Button label="Fechar" icon="pi pi-times" onClick={onClose} />
        </div>
      </div>

      <Divider />
      <h4 className="mt-0">Itens</h4>
      <DataTable value={itens} loading={loading} paginator rows={5} responsiveLayout="scroll" emptyMessage="Sem itens">
        <Column field="id" header="#" style={{ width: 90 }} />
        <Column header="Produto" body={(r) => r.variacao?.nome_completo || '—'} />
        <Column header="Defeito" body={(r) => r.defeito?.descricao || '—'} />
        <Column header="Nota" body={(r) => r.nota_numero || '—'} />
        <Column header="Prazo" body={(r) => r.prazo_finalizacao ? new Date(r.prazo_finalizacao).toLocaleDateString() : '—'} />
        <Column header="Status" body={(r) => <Tag value={statusLabel(chamado?.status)} severity={statusSeverity(chamado?.status)} />} />
        <Column header="Envio" body={(r) => (r.data_envio ? new Date(r.data_envio).toLocaleDateString() : '—')} />
        <Column header="Retorno" body={(r) => (r.data_retorno ? new Date(r.data_retorno).toLocaleDateString() : '—')} />
        <Column header="Ações" body={(r) => (
          <ItemAcoes
            item={r}
            chamadoStatus={chamado?.status}
            chamadoLocal={chamado?.local_reparo}
            onChanged={handleAnyChange}
          />
        )} style={{ width: 320 }} />
      </DataTable>

      <Divider />
      <h4 className="mt-0">Timeline</h4>
      <Timeline
        value={logs}
        align="alternate"
        content={(e) => (
          <div className="p-2">
            <div className="font-bold">{e.mensagem}</div>
            <div className="text-500 text-sm">{e.status_de || '—'} → {e.status_para || '—'}</div>
            <div className="text-500 text-sm">{new Date(e.created_at).toLocaleString()}</div>
          </div>
        )}
        marker={(e) => (
          <span className={`p-avatar p-component p-avatar-circle p-overlay-badge bg-${statusSeverity(e.status_para)}`} style={{ width: '1rem', height: '1rem' }} />
        )}
      />

      <DialogAdicionarItem chamadoId={chamadoId} visible={dlgAddItem} onHide={() => setDlgAddItem(false)} onAdded={() => load()} />
    </div>
  );
}
