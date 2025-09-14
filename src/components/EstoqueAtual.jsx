import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';

/**
 * Tabela de Estoque Atual.
 * - Exibe a localização como:
 *   • código composto (ex.: "6-B1") quando houver localização física; OU
 *   • nome da área (ex.: "Assistência") quando estiver em área.
 * - O ícone de edição permanece sempre ao lado do texto, sem quebra de linha.
 * - RESTRIÇÃO: se quantidade === 0, não permite "Definir" localização (não exibe o botão).
 *
 * @param {Object}   props
 * @param {Array}    props.data
 * @param {boolean}  props.loading
 * @param {number}   props.total
 * @param {number}   props.first
 * @param {Function} props.onPage
 * @param {Function} props.onEditLocalizacao
 * @param {Function} props.verMovimentacoes
 */
const EstoqueAtual = ({ data, loading, total, first, onPage, onEditLocalizacao, verMovimentacoes }) => {
  const [sortField, setSortField] = useState('produto_nome');
  const [sortOrder, setSortOrder] = useState(1);
  const [rows, setRows] = useState(10);

  const quantidadeTemplate = (rowData) => (
    <span className={rowData.quantidade <= 5 ? 'text-red-500 font-bold' : ''}>
      {rowData.quantidade}
    </span>
  );

  /**
   * Renderiza a coluna de Localização:
   * - Se não houver localização e quantidade > 0: mostra botão "Definir".
   * - Se não houver localização e quantidade === 0: mostra apenas um traço (—).
   * - Se houver localização: mostra texto + ícone de edição, sempre lado a lado (sem quebra).
   */
  const localizacaoTemplate = (rowData) => {
    const loc = rowData.localizacao;
    const isZero = Number(rowData?.quantidade ?? 0) === 0;

    if (!loc) {
      if (isZero) {
        return <span className="text-500">—</span>;
      }
      return (
        <Button
          icon="pi pi-plus"
          label="Definir"
          className="p-button-text p-0"
          onClick={() => onEditLocalizacao(rowData.estoque_id, null)}
        />
      );
    }

    const codigo = loc.codigo_composto && loc.codigo_composto.trim() !== '' ? loc.codigo_composto : null;
    const area = loc.area?.nome || null;
    const display = codigo ?? area ?? '—';

    return (
      <span className="inline-flex items-center whitespace-nowrap max-w-full" style={{ overflow: 'hidden' }}>
        <span className="truncate">{display}</span>
        <Button
          icon="pi pi-pencil"
          className="p-button-text p-0 ml-2 flex-shrink-0"
          tooltip="Editar localização"
          onClick={() => onEditLocalizacao(rowData.estoque_id, rowData.localizacao?.id || null)}
        />
      </span>
    );
  };

  const handlePage = (e) => {
    setRows(e.rows);
    onPage({ ...e, sortField, sortOrder, rows: e.rows });
  };

  const handleSort = (e) => {
    setSortField(e.sortField);
    setSortOrder(e.sortOrder);
    onPage({ first, rows, sortField: e.sortField, sortOrder: e.sortOrder });
  };

  return (
    <div className="mb-5">
      <h3 className="mb-3">Estoque Atual por Produto e Depósito</h3>

      <Tooltip
        target="#tooltip-localizacao"
        content="Setor, Coluna e Nível. Áreas e dimensões são gerenciáveis."
        position="top"
      />

      <DataTable
        value={data}
        loading={loading}
        paginator
        first={first}
        rows={rows}
        rowsPerPageOptions={[10, 20, 50]}
        totalRecords={total}
        onPage={handlePage}
        onSort={handleSort}
        sortField={sortField}
        sortOrder={sortOrder}
        lazy
        responsiveLayout="scroll"
        emptyMessage="Nenhum item em estoque"
      >
        <Column field="produto_nome" header="Produto" sortable />
        <Column field="deposito_nome" header="Depósito" sortable />
        <Column field="quantidade" header="Quantidade" body={quantidadeTemplate} sortable />
        <Column
          header={
            <span>
              Localização{' '}
              <i id="tooltip-localizacao" className="pi pi-info-circle text-gray-500 ml-1" style={{ cursor: 'pointer' }} />
            </span>
          }
          body={localizacaoTemplate}
        />
        <Column
          header="Ações"
          body={(rowData) => (
            <Button
              icon="pi pi-eye"
              tooltip="Ver movimentações"
              className="p-button-sm"
              onClick={() => verMovimentacoes(rowData)}
            />
          )}
        />
      </DataTable>
    </div>
  );
};

export default EstoqueAtual;
