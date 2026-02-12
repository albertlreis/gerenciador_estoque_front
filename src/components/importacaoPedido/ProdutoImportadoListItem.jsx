import React from 'react';
import { Checkbox } from 'primereact/checkbox';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';

export default function ProdutoImportadoListItem({
                                                   item = {},
                                                   index,
                                                   depositos = [],
                                                   selecionado = false,
                                                   onToggleSelecionado,
                                                   onChangeItem,
                                                   onRemove,
                                                 }) {
  const quantidade = Number(item.quantidade) || 0;
  const custoUnitario = Number(item.custo_unitario ?? item.preco_unitario ?? 0) || 0;
  const valorUnitario = Number(item.valor ?? item.preco_unitario ?? 0) || 0;
  const totalItem = valorUnitario * quantidade;

  const totalFormatado = totalItem.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const depositosOptions = (depositos || []).map((d) => ({
    label: d.nome,
    value: Number(d.id),
  }));

  const atributos = item.atributos || {};
  const fixos = item.fixos || {};

  return (
    <div className="flex flex-column border-1 surface-border border-round p-3 mb-2 bg-green-50">
      <div className="flex align-items-start justify-content-between gap-3">
        {/* Seleção + Info principal */}
        <div className="flex align-items-start gap-3 flex-1">
          <div className="mt-1">
            <Checkbox
              inputId={`sel-${index}`}
              checked={selecionado}
              onChange={(e) => onToggleSelecionado?.(e.checked)}
            />
          </div>

          <div className="flex flex-column gap-1 flex-1">
            <div className="flex align-items-center gap-2">
              <span className="font-semibold text-sm">
                {item.nome_completo || item.nome || item.descricao || 'Produto'}
              </span>
            </div>

            <div className="text-xs text-color-secondary">
              <span className="mr-3">
                <strong>Ref:</strong> {item.ref || '-'}
              </span>
              {item.categoria && (
                <span className="mr-3">
                  <strong>Categoria:</strong> {item.categoria}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Totais + Remover */}
        <div className="flex flex-column align-items-end gap-2">
          <span className="text-sm font-semibold">Total: {totalFormatado}</span>

          <Button
            icon="pi pi-trash"
            className="p-button-danger p-button-text p-button-sm"
            onClick={() => onRemove?.(index)}
            tooltip="Remover item"
          />
        </div>
      </div>

      {/* Linha com quantidade e depósito */}
      <div className="grid mt-3">
        <div className="col-12 md:col-3">
          <label className="block text-xs mb-1">Quantidade</label>
          <InputNumber
            value={quantidade}
            onValueChange={(e) => onChangeItem(index, 'quantidade', e.value)}
            min={0.01}
            className="w-full p-inputtext-sm"
          />
        </div>

        <div className="col-12 md:col-3">
          <label className="block text-xs mb-1">Custo unitário</label>
          <InputNumber
            value={custoUnitario}
            mode="currency"
            currency="BRL"
            locale="pt-BR"
            onValueChange={(e) => onChangeItem(index, 'custo_unitario', e.value ?? 0)}
            className="w-full p-inputtext-sm"
          />
        </div>

        <div className="col-12 md:col-3">
          <label className="block text-xs mb-1">Preço de venda</label>
          <InputNumber
            value={valorUnitario}
            mode="currency"
            currency="BRL"
            locale="pt-BR"
            onValueChange={(e) => {
              onChangeItem(index, 'valor', e.value ?? 0);
            }}
            className="w-full p-inputtext-sm"
          />
        </div>

        <div className="col-12 md:col-3">
          <label className="block text-xs mb-1">Depósito</label>
          <Dropdown
            value={item.id_deposito || null}
            options={depositosOptions}
            placeholder="Selecione"
            className="w-full p-inputtext-sm"
            filter
            showClear
            onChange={(e) => onChangeItem(index, 'id_deposito', e.value)}
          />
        </div>
      </div>

      {/* Dimensões e atributos (somente leitura) */}
      <div className="mt-3 text-xs">
        {(fixos.largura || fixos.altura || fixos.profundidade) && (
          <div className="mb-2">
            <strong>Dimensões:</strong>{' '}
            {[
              fixos.largura ? `Largura: ${fixos.largura}` : null,
              fixos.altura ? `Altura: ${fixos.altura}` : null,
              fixos.profundidade ? `Profundidade: ${fixos.profundidade}` : null,
            ]
              .filter(Boolean)
              .join(' | ')}
          </div>
        )}

        {atributos && Object.keys(atributos).length > 0 && (
          <div>
            <strong>Atributos:</strong>{' '}
            {Object.entries(atributos)
              .filter(([_, v]) => v !== null && String(v).trim() !== '')
              .map(([k, v]) => `${k}: ${v}`)
              .join(' | ')}
          </div>
        )}
      </div>
    </div>
  );
}

