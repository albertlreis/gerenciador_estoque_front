import React from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';

export default function FormularioPedido({ pedido, vendedores, parceiros, onChange }) {
  const handleChange = (field, value) => {
    onChange(field, value);
  };

  return (
    <div className="formgrid grid p-fluid">
      <div className="field col-12 md:col-4">
        <label htmlFor="numero_externo">Número</label>
        <InputText id="numero_externo" value={pedido.numero_externo || ''} onChange={(e) => handleChange('numero_externo', e.target.value)} />
      </div>
      <div className="field col-12 md:col-4">
        <label htmlFor="id_vendedor">Vendedor</label>
        <Dropdown id="id_vendedor" value={pedido.id_vendedor || null} options={vendedores} optionLabel="nome" optionValue="id" placeholder="Selecione" onChange={(e) => handleChange('id_vendedor', e.value)} filter />
      </div>
      <div className="field col-12 md:col-4">
        <label htmlFor="id_parceiro">Parceiro</label>
        <Dropdown id="id_parceiro" value={pedido.id_parceiro || null} options={parceiros} optionLabel="nome" optionValue="id" placeholder="Selecione" onChange={(e) => handleChange('id_parceiro', e.value)} filter />
      </div>
      <div className="field col-12 md:col-4">
        <label htmlFor="total">Valor Total</label>
        <InputNumber id="total" value={pedido.total || 0} mode="currency" currency="BRL" locale="pt-BR" disabled />
      </div>
      <div className="field col-12">
        <label htmlFor="observacoes">Observações</label>
        <InputTextarea id="observacoes" value={pedido.observacoes || ''} onChange={(e) => handleChange('observacoes', e.target.value)} rows={3} />
      </div>
    </div>
  );
}
