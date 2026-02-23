import React, { useEffect, useMemo, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';

import { obterEvento } from '../../services/auditoriaService';
import JsonViewer from '../comunicacao/JsonViewer';
import { formatarDataHoraAuditoria, formatarValorAuditoria, getAcaoSeverity, parseJsonSafe } from '../../utils/auditoriaUtils';

const valueTemplate = (rawValue) => (
  <pre
    style={{
      margin: 0,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      fontSize: '0.8rem',
      fontFamily: 'monospace',
    }}
  >
    {formatarValorAuditoria(rawValue)}
  </pre>
);

export default function AuditoriaEventoDetalheDialog({
  visible,
  eventoId,
  onHide,
}) {
  const [loading, setLoading] = useState(false);
  const [evento, setEvento] = useState(null);

  useEffect(() => {
    if (!visible || !eventoId) return;

    let ativo = true;
    setLoading(true);

    obterEvento(eventoId)
      .then((response) => {
        if (!ativo) return;
        setEvento(response?.data?.data ?? null);
      })
      .catch(() => {
        if (!ativo) return;
        setEvento(null);
      })
      .finally(() => {
        if (!ativo) return;
        setLoading(false);
      });

    return () => {
      ativo = false;
    };
  }, [visible, eventoId]);

  const metadata = useMemo(() => parseJsonSafe(evento?.metadata_json), [evento?.metadata_json]);

  return (
    <Dialog
      header={eventoId ? `Detalhe do Evento #${eventoId}` : 'Detalhe do Evento'}
      visible={visible}
      onHide={onHide}
      style={{ width: '78vw', maxWidth: '1200px' }}
      modal
    >
      {loading && <p>Carregando detalhes...</p>}
      {!loading && !evento && <p>Nao foi possivel carregar os detalhes do evento.</p>}

      {!loading && evento && (
        <div className="grid">
          <div className="col-12 md:col-6">
            <div><strong>Data/Hora:</strong> {formatarDataHoraAuditoria(evento.created_at)}</div>
            <div><strong>Modulo:</strong> {evento.module || '-'}</div>
            <div>
              <strong>Acao:</strong>{' '}
              <Tag value={evento.action || '-'} severity={getAcaoSeverity(evento.action)} />
            </div>
            <div><strong>Entidade:</strong> {evento.auditable_type || '-'} #{evento.auditable_id ?? '-'}</div>
            <div><strong>Usuario:</strong> {evento.actor_name || evento.actor_type || '-'}</div>
          </div>

          <div className="col-12 md:col-6">
            <div><strong>Origem:</strong> {evento.origin || '-'}</div>
            <div><strong>Metodo:</strong> {evento.method || '-'}</div>
            <div><strong>Rota:</strong> {evento.route || '-'}</div>
            <div><strong>IP:</strong> {evento.ip || '-'}</div>
            <div><strong>Request ID:</strong> {evento.request_id || '-'}</div>
          </div>

          <div className="col-12">
            <Divider align="left">Metadata</Divider>
            <JsonViewer value={metadata || {}} />
          </div>

          <div className="col-12">
            <Divider align="left">Mudancas</Divider>
            <DataTable
              value={Array.isArray(evento.mudancas) ? evento.mudancas : []}
              dataKey="id"
              paginator
              rows={8}
              rowsPerPageOptions={[8, 16, 24]}
              emptyMessage="Nenhuma mudanca registrada para este evento."
              size="small"
              responsiveLayout="scroll"
            >
              <Column field="field" header="Campo" style={{ minWidth: '180px' }} />
              <Column
                field="old_value"
                header="Antes"
                body={(row) => valueTemplate(row.old_value)}
                style={{ minWidth: '260px' }}
              />
              <Column
                field="new_value"
                header="Depois"
                body={(row) => valueTemplate(row.new_value)}
                style={{ minWidth: '260px' }}
              />
              <Column field="value_type" header="Tipo" style={{ width: '120px' }} />
            </DataTable>
          </div>
        </div>
      )}
    </Dialog>
  );
}
