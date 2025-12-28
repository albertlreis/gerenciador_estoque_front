import React from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';

/**
 * Formulário de informações principais do pedido.
 * Inclui número, vendedor, parceiro, total e observações.
 */
export default function FormularioPedido({ pedido = {}, vendedores = [], parceiros = [], onChange }) {
  const handleChange = (field, value) => {
    if (typeof onChange === 'function') {
      onChange(field, value);
    }
  };

  return (
    <div className="formgrid grid p-fluid">
      {/* Tipo do Pedido */}
      <div className="field col-12 md:col-4">
        <label className="block font-medium text-sm mb-1">Tipo</label>
        <Dropdown
          value={pedido.tipo ?? 'venda'}
          options={[
            { label: 'Venda (Cliente)', value: 'venda' },
            { label: 'Reposição (Estoque)', value: 'reposicao' },
          ]}
          onChange={(e) => handleChange('tipo', e.value)}
          className="w-full"
        />
      </div>

      {/* Número do Pedido */}
      <div className="field col-12 md:col-4">
        <label htmlFor="numero_externo" className="block font-medium text-sm mb-1">
          Número
        </label>
        <InputText
          id="numero_externo"
          value={pedido.numero_externo || ''}
          onChange={(e) => handleChange('numero_externo', e.target.value)}
          className="w-full"
          placeholder="Ex: 12345"
        />
      </div>

      {/* Vendedor */}
      <div className="field col-12 md:col-4">
        <label htmlFor="id_vendedor" className="block font-medium text-sm mb-1">
          Vendedor
        </label>
        <Dropdown
          id="id_vendedor"
          value={pedido.id_vendedor ?? null}
          options={Array.isArray(vendedores) ? vendedores : []}
          optionLabel="nome"
          optionValue="id"
          placeholder="Selecione"
          onChange={(e) => handleChange('id_vendedor', e.value)}
          filter
          showClear
          className="w-full"
          emptyMessage="Nenhum vendedor encontrado"
        />
      </div>

      {/* Parceiro */}
      <div className="field col-12 md:col-4">
        <label htmlFor="id_parceiro" className="block font-medium text-sm mb-1">
          Parceiro
        </label>
        <Dropdown
          id="id_parceiro"
          value={pedido.id_parceiro ?? null}
          options={Array.isArray(parceiros) ? parceiros : []}
          optionLabel="nome"
          optionValue="id"
          placeholder="Selecione"
          onChange={(e) => handleChange('id_parceiro', e.value)}
          filter
          showClear
          className="w-full"
          emptyMessage="Nenhum parceiro encontrado"
        />
      </div>

      {/* Valor Total */}
      <div className="field col-12 md:col-4">
        <label htmlFor="total" className="block font-medium text-sm mb-1">
          Valor Total
        </label>
        <InputNumber
          id="total"
          value={Number(pedido.total) || 0}
          mode="currency"
          currency="BRL"
          locale="pt-BR"
          disabled
          className="w-full text-right"
        />
      </div>

      {/* Observações */}
      <div className="field col-12">
        <label htmlFor="observacoes" className="block font-medium text-sm mb-1">
          Observações
        </label>
        <InputTextarea
          id="observacoes"
          value={pedido.observacoes || ''}
          onChange={(e) => handleChange('observacoes', e.target.value)}
          rows={3}
          autoResize
          className="w-full"
          placeholder="Observações gerais do pedido..."
        />
      </div>
    </div>
  );
}
