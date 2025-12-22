import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { Tag } from 'primereact/tag';
import { Tooltip } from 'primereact/tooltip';

/**
 * Exibe a listagem de itens lidos no modo de leitura de estoque.
 * - Mostra estoque atual (de origem no modo transferência)
 * - Destaca visualmente inconsistências de quantidade
 * - Validações de estoque_atual recebidas do back
 */
export default function TabelaItensLeitura({
                                             itens,
                                             alterarQuantidade,
                                             setQuantidade,
                                             removerItem,
                                             mode,
                                             depositoId,
                                             totalPecas,
                                           }) {
  /** 🔹 Renderiza a coluna de quantidade com botões */
  const quantidadeBody = (row) => {
    const estoque =
      row.estoque_atual ??
      row.estoque?.quantidade ??
      row.estoque_total ??
      0;

    const excedeu = row.quantidade > estoque && ['transfer', 'saida'].includes(mode);

    return (
      <div className="flex align-items-center gap-2 justify-content-center">
        <Button
          icon="pi pi-minus"
          rounded
          text
          severity="secondary"
          onClick={() => alterarQuantidade(row.variacao_id, -1)}
        />

        <Tooltip target={`.qtd-${row.variacao_id}`} />
        <InputNumber
          value={row.quantidade}
          onValueChange={(e) => setQuantidade(row.variacao_id, e.value)}
          min={1}
          max={99999}
          inputClassName={`w-6rem text-center ${excedeu ? 'p-invalid' : ''} qtd-${row.variacao_id}`}
          tooltip={excedeu ? `Saldo disponível: ${estoque} un.` : null}
        />

        <Button
          icon="pi pi-plus"
          rounded
          text
          severity="secondary"
          onClick={() => alterarQuantidade(row.variacao_id, +1)}
        />
      </div>
    );
  };

  /** 🔹 Renderiza a coluna de estoque com cores conforme saldo */
  const estoqueBody = (row) => {
    const estoque =
      row.estoque_atual ??
      row.estoque?.quantidade ??
      row.estoque_total ??
      0;

    const cor =
      estoque === 0
        ? 'danger'
        : estoque <= 3
          ? 'warning'
          : 'success';

    return (
      <Tag
        severity={cor}
        value={`${estoque} un.`}
        className="text-sm px-2 py-1"
        tooltip={`Saldo atual: ${estoque} un.`}
      />
    );
  };

  /** 🔹 Renderiza coluna de ações */
  const acoesBody = (row) => (
    <Button
      icon="pi pi-trash"
      rounded
      text
      severity="danger"
      tooltip="Remover item"
      onClick={() => removerItem(row.variacao_id)}
    />
  );

  /** 🔹 Renderiza o nome e referência do produto */
  const nomeBody = (row) => (
    <div className="flex flex-column">
      <div className="font-semibold text-sm">{row.nome}</div>
      {row.referencia && (
        <small className="text-500">Ref: {row.referencia}</small>
      )}
    </div>
  );

  return (
    <>
      <DataTable
        value={itens}
        emptyMessage="Nenhum item lido"
        stripedRows
        size="small"
        responsiveLayout="scroll"
        showGridlines
        scrollable
        scrollHeight="65vh"
      >
        <Column
          field="codigo_barras"
          header="Código"
          style={{ minWidth: 140 }}
        />
        <Column
          field="referencia"
          header="Referência"
          style={{ minWidth: 120 }}
        />
        <Column
          field="nome"
          header="Produto / Variação"
          style={{ minWidth: 320 }}
          body={nomeBody}
        />
        <Column
          field="estoque_atual"
          header={mode === 'transfer' ? 'Estoque (Origem)' : 'Estoque atual'}
          style={{ width: 150, textAlign: 'center' }}
          body={estoqueBody}
        />
        <Column
          header="Qtd"
          body={quantidadeBody}
          style={{ width: 200, textAlign: 'center' }}
        />
        <Column
          body={acoesBody}
          header="Ações"
          style={{ width: 100, textAlign: 'center' }}
        />
      </DataTable>

      <div className="flex justify-content-end mt-3">
        <div className="text-lg font-semibold">
          Total de peças: {totalPecas}
        </div>
      </div>
    </>
  );
}
