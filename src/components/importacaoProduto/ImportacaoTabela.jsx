import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Toolbar } from 'primereact/toolbar';
import { confirmDialog } from 'primereact/confirmdialog';

import CategoriaAutoComplete from './CategoriaAutoComplete';
import PedidoAutoComplete from './PedidoAutoComplete';
import apiEstoque from '../../services/apiEstoque';

export default function ImportacaoTabela({ produtos, setProdutos, onEditAtributos }) {
  const [selected, setSelected] = useState([]);
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    apiEstoque.get('/categorias').then(({ data }) => {
      setCategorias((data || []).map(c => ({ label: c.nome, value: c.id })));
    });
  }, []);

  const updateItem = (rowIndex, patch) => {
    setProdutos(prev => {
      const nova = [...prev];
      nova[rowIndex] = { ...nova[rowIndex], ...patch };
      return nova;
    });
  };

  const updateSelected = patch => {
    setProdutos(prev =>
      prev.map(p => (selected.some(s => s.__key === p.__key) ? { ...p, ...patch } : p))
    );
  };

  const handleCreateCategoria = async nome => {
    try {
      const { data } = await apiEstoque.post('/categorias', { nome });
      const nova = { label: data.nome, value: data.id };
      setCategorias(prev => [...prev, nova]);
      return nova;
    } catch (e) {
      console.error('Erro ao criar categoria:', e);
      return null;
    }
  };

  const removerSelecionados = () => {
    if (!selected.length) return;
    confirmDialog({
      message: `Remover ${selected.length} produto(s) da lista?`,
      header: 'Confirmar remoção',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: () => {
        setProdutos(prev => prev.filter(p => !selected.some(s => s.__key === p.__key)));
        setSelected([]);
      },
    });
  };

  const statusTemplate = row => {
    const vinculado = row.variacao_id || row.variacao_id_manual;
    return <Tag value={vinculado ? 'Vinculado' : 'Novo'} severity={vinculado ? 'success' : 'warning'} />;
  };

  const totalTemplate = row => ((row.quantidade || 0) * (row.custo_unitario || 0)).toFixed(2);

  const atributosTemplate = rowData => (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        label={rowData.atributos?.length ? `${rowData.atributos.length} atributo(s)` : 'Nenhum'}
        icon="pi pi-pencil"
        className="p-button-text p-button-sm"
        onClick={() => onEditAtributos(rowData)}
        tooltip="Editar atributos"
      />
    </div>
  );

  const toolbarLeft = (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        label="Remover selecionados"
        icon="pi pi-trash"
        className="p-button-danger p-button-sm"
        disabled={!selected.length}
        onClick={removerSelecionados}
      />
      <CategoriaAutoComplete
        placeholder="Aplicar categoria..."
        options={categorias}
        onCreate={handleCreateCategoria}
        onChange={val => val && updateSelected({ id_categoria: val })}
      />
      <PedidoAutoComplete
        placeholder="Aplicar pedido..."
        onChange={sel => sel && updateSelected({ pedido_id: sel.id, pedido_obj: sel })}
      />
    </div>
  );

  return (
    <div className="p-4">
      <h3 className="mb-3 text-lg font-semibold">Produtos extraídos ({produtos.length})</h3>

      <Toolbar left={toolbarLeft} className="mb-3 p-2 border-round surface-100" />

      <DataTable
        value={produtos}
        responsiveLayout="scroll"
        selection={selected}
        onSelectionChange={e => setSelected(e.value)}
        dataKey="__key"
        scrollable
        scrollHeight="calc(100vh - 340px)"
        className="text-sm"
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
        <Column header="Status" body={statusTemplate} style={{ width: '8rem' }} />

        <Column
          header="Ref. (cProd)"
          body={(rowData, { rowIndex }) => (
            <InputText
              value={rowData.referencia || ''}
              onChange={e => updateItem(rowIndex, { referencia: e.target.value })}
              className="w-full sm:w-12rem"
            />
          )}
        />

        <Column
          header="Descrição"
          body={(rowData, { rowIndex }) => (
            <InputText
              value={rowData.descricao_final || ''}
              onChange={e => updateItem(rowIndex, { descricao_final: e.target.value })}
              className="w-full sm:w-[30rem] md:w-[40rem] lg:w-[56rem]"
            />
          )}
          style={{ minWidth: '28rem' }}
        />

        <Column
          header="Categoria"
          body={(rowData, { rowIndex }) => (
            <CategoriaAutoComplete
              value={rowData.id_categoria}
              onChange={val => updateItem(rowIndex, { id_categoria: val })}
              onCreate={handleCreateCategoria}
            />
          )}
          style={{ minWidth: '16rem' }}
        />

        <Column
          header="Preço"
          body={(rowData, { rowIndex }) => (
            <InputNumber
              value={rowData.preco || 0}
              onValueChange={e => updateItem(rowIndex, { preco: e.value })}
              mode="decimal"
              minFractionDigits={2}
              inputClassName="w-full"
              className="w-full sm:w-10rem"
            />
          )}
        />

        <Column
          header="Custo (XML)"
          body={(rowData, { rowIndex }) => (
            <InputNumber
              value={rowData.custo_unitario || 0}
              onValueChange={e => updateItem(rowIndex, { custo_unitario: e.value })}
              mode="decimal"
              minFractionDigits={2}
              inputClassName="w-full"
              className="w-full sm:w-10rem"
            />
          )}
        />

        <Column
          header="Qtd"
          body={(rowData, { rowIndex }) => (
            <InputNumber
              value={rowData.quantidade || 0}
              onValueChange={e => updateItem(rowIndex, { quantidade: e.value })}
              mode="decimal"
              minFractionDigits={2}
              inputClassName="w-full"
              className="w-full sm:w-8rem"
            />
          )}
        />

        <Column header="Total" body={totalTemplate} style={{ width: '8rem', textAlign: 'right' }} />
        <Column header="Atributos" body={atributosTemplate} style={{ width: '12rem' }} />

        <Column
          header="Pedido"
          body={(rowData, { rowIndex }) => (
            <PedidoAutoComplete
              value={rowData.pedido_obj || rowData.pedido_id}
              onChange={sel =>
                updateItem(rowIndex, {
                  pedido_id: sel?.id,
                  pedido_obj: sel,
                })
              }
            />
          )}
          style={{ minWidth: '14rem' }}
        />
      </DataTable>
    </div>
  );
}
