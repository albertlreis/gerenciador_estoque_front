import React, { useEffect, useMemo, useState } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';

import { listarPorEntidade } from '../../services/auditoriaService';
import { formatarDataHoraAuditoria, getAcaoSeverity } from '../../utils/auditoriaUtils';
import AuditoriaEventoDetalheDialog from './AuditoriaEventoDetalheDialog';

const ROWS_DEFAULT = 8;

export default function AuditoriaEntidadePanel({
  auditableType,
  auditableId,
  titulo = 'Historico de Auditoria',
  rows = ROWS_DEFAULT,
}) {
  const [loading, setLoading] = useState(false);
  const [eventos, setEventos] = useState([]);
  const [total, setTotal] = useState(0);
  const [first, setFirst] = useState(0);
  const [eventoSelecionado, setEventoSelecionado] = useState(null);

  const podeBuscar = useMemo(
    () => Boolean(auditableType && auditableId !== null && auditableId !== undefined),
    [auditableType, auditableId]
  );

  const carregar = async ({ nextFirst = first, nextRows = rows } = {}) => {
    if (!podeBuscar) {
      setEventos([]);
      setTotal(0);
      return;
    }

    setLoading(true);
    try {
      const page = Math.floor(nextFirst / nextRows) + 1;
      const response = await listarPorEntidade({
        type: auditableType,
        id: auditableId,
        page,
        per_page: nextRows,
      });

      const dados = response?.data?.data ?? [];
      const meta = response?.data?.meta ?? {};

      setEventos(Array.isArray(dados) ? dados : []);
      setTotal(Number(meta.total || 0));
    } catch {
      setEventos([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setFirst(0);
    carregar({ nextFirst: 0, nextRows: rows });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auditableType, auditableId, rows]);

  if (!podeBuscar) {
    return null;
  }

  return (
    <div className="surface-card border-1 surface-border border-round p-3">
      <div className="flex justify-content-between align-items-center mb-2">
        <h4 className="m-0">{titulo}</h4>
        <Button
          label="Atualizar"
          icon="pi pi-refresh"
          size="small"
          outlined
          onClick={() => carregar()}
          loading={loading}
        />
      </div>

      <DataTable
        value={eventos}
        dataKey="id"
        paginator
        lazy
        rows={rows}
        first={first}
        totalRecords={total}
        onPage={(e) => {
          setFirst(e.first);
          carregar({ nextFirst: e.first, nextRows: e.rows });
        }}
        loading={loading}
        responsiveLayout="scroll"
        emptyMessage="Nenhum evento de auditoria encontrado para esta entidade."
        size="small"
      >
        <Column
          field="created_at"
          header="Data/Hora"
          body={(row) => formatarDataHoraAuditoria(row.created_at)}
          style={{ minWidth: '170px' }}
        />
        <Column field="module" header="Modulo" style={{ width: '120px' }} />
        <Column
          field="action"
          header="Acao"
          body={(row) => <Tag value={row.action} severity={getAcaoSeverity(row.action)} />}
          style={{ width: '140px' }}
        />
        <Column field="actor_name" header="Usuario" style={{ minWidth: '160px' }} />
        <Column field="label" header="Descricao" style={{ minWidth: '280px' }} />
        <Column
          header=""
          body={(row) => (
            <Button
              icon="pi pi-search"
              text
              rounded
              aria-label="Ver detalhes"
              onClick={() => setEventoSelecionado(row.id)}
            />
          )}
          style={{ width: '70px', textAlign: 'center' }}
        />
      </DataTable>

      <AuditoriaEventoDetalheDialog
        visible={Boolean(eventoSelecionado)}
        eventoId={eventoSelecionado}
        onHide={() => setEventoSelecionado(null)}
      />
    </div>
  );
}
