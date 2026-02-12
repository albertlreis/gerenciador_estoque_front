import React from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Checkbox } from 'primereact/checkbox';

function parseDate(value) {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;

  const raw = String(value).trim();
  if (!raw) return null;

  let match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const [, y, m, d] = match;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }

  match = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match) {
    const [, d, m, y] = match;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

const PREVISAO_OPTIONS = [
  { label: 'Data exata', value: 'DATA' },
  { label: 'Dias úteis', value: 'DIAS_UTEIS' },
  { label: 'Dias corridos', value: 'DIAS_CORRIDOS' },
];

/**
 * Formulário de informações principais do pedido importado via PDF.
 */
export default function FormularioPedido({
  pedido = {},
  vendedores = [],
  parceiros = [],
  onChange,
  entregaPrevistaPreview = null,
}) {
  const handleChange = (field, value) => {
    if (typeof onChange === 'function') {
      onChange(field, value);
    }
  };

  const entregue = Boolean(pedido.entregue);
  const previsaoTipo = pedido.previsao_tipo ?? null;

  return (
    <div className="formgrid grid p-fluid">
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

      <div className="field col-12 md:col-4">
        <label className="block font-medium text-sm mb-1">Data do pedido</label>
        <Calendar
          value={parseDate(pedido.data_pedido)}
          onChange={(e) => handleChange('data_pedido', e.value)}
          dateFormat="dd/mm/yy"
          showIcon
          className="w-full"
        />
      </div>

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

      <div className="field col-12 md:col-4 flex align-items-end gap-2">
        <Checkbox
          inputId="pedido_entregue"
          checked={entregue}
          onChange={(e) => handleChange('entregue', Boolean(e.checked))}
        />
        <label htmlFor="pedido_entregue" className="font-medium text-sm">
          Pedido já foi entregue?
        </label>
      </div>

      <div className="field col-12 md:col-4">
        <label className="block font-medium text-sm mb-1">Data de entrega</label>
        <Calendar
          value={parseDate(pedido.data_entrega)}
          onChange={(e) => handleChange('data_entrega', e.value)}
          dateFormat="dd/mm/yy"
          showIcon
          disabled={!entregue}
          className="w-full"
        />
      </div>

      <div className="field col-12 md:col-4">
        <label className="block font-medium text-sm mb-1">Previsão de entrega</label>
        <Dropdown
          value={previsaoTipo}
          options={PREVISAO_OPTIONS}
          placeholder="Sem previsão"
          showClear
          onChange={(e) => handleChange('previsao_tipo', e.value ?? null)}
          className="w-full"
        />
      </div>

      {previsaoTipo === 'DATA' && (
        <div className="field col-12 md:col-4">
          <label className="block font-medium text-sm mb-1">Data prevista</label>
          <Calendar
            value={parseDate(pedido.data_prevista)}
            onChange={(e) => handleChange('data_prevista', e.value)}
            dateFormat="dd/mm/yy"
            showIcon
            className="w-full"
          />
        </div>
      )}

      {previsaoTipo === 'DIAS_UTEIS' && (
        <div className="field col-12 md:col-4">
          <label className="block font-medium text-sm mb-1">Dias úteis previstos</label>
          <InputNumber
            value={Number(pedido.dias_uteis_previstos) || 0}
            min={0}
            onValueChange={(e) => handleChange('dias_uteis_previstos', e.value ?? null)}
            className="w-full"
          />
        </div>
      )}

      {previsaoTipo === 'DIAS_CORRIDOS' && (
        <div className="field col-12 md:col-4">
          <label className="block font-medium text-sm mb-1">Dias corridos previstos</label>
          <InputNumber
            value={Number(pedido.dias_corridos_previstos) || 0}
            min={0}
            onValueChange={(e) => handleChange('dias_corridos_previstos', e.value ?? null)}
            className="w-full"
          />
        </div>
      )}

      <div className="field col-12">
        <small className="text-color-secondary">
          Entrega prevista (prévia): <strong>{entregaPrevistaPreview || '—'}</strong>
        </small>
      </div>

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
