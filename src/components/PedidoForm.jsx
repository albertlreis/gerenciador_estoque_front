import React, { useState } from 'react';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';

const PedidoForm = ({ initialData = {}, clientes = [], statusOptions = [], onSubmit, onCancel }) => {
  const [pedido, setPedido] = useState({
    id_cliente: initialData.id_cliente || null,
    data: initialData.data ? new Date(initialData.data) : new Date(),
    status: initialData.status || (statusOptions.length > 0 ? statusOptions[0] : ''),
    total: initialData.total || 0,
  });

  const handleChange = (field, value) => {
    setPedido({ ...pedido, [field]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(pedido);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Cliente */}
      <div className="p-field">
        <label htmlFor="cliente">Cliente</label>
        <Dropdown
          id="cliente"
          value={pedido.id_cliente}
          options={clientes}
          onChange={(e) => handleChange('id_cliente', e.value)}
          optionLabel="nome"      // Exibe o nome do cliente
          placeholder="Selecione um cliente"
        />
      </div>

      {/* Data */}
      <div className="p-field">
        <label htmlFor="data">Data do Pedido</label>
        <Calendar
          id="data"
          value={pedido.data}
          onChange={(e) => handleChange('data', e.value)}
          dateFormat="dd/mm/yy"
        />
      </div>

      {/* Status */}
      <div className="p-field">
        <label htmlFor="status">Status</label>
        <Dropdown
          id="status"
          value={pedido.status}
          options={statusOptions.map((s) => ({ label: s, value: s }))}
          onChange={(e) => handleChange('status', e.value)}
          placeholder="Selecione o status"
        />
      </div>

      {/* Total */}
      <div className="p-field">
        <span className="p-float-label">
          <InputNumber
            id="total"
            value={pedido.total}
            onValueChange={(e) => handleChange('total', e.value)}
            mode="currency"
            currency="BRL"
            locale="pt-BR"
          />
          <label htmlFor="total">Total</label>
        </span>
      </div>

      {/* Ações */}
      <div className="p-field" style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button label="Salvar" type="submit" className="p-mr-2" />
        <Button label="Cancelar" type="button" className="p-button-secondary" onClick={onCancel} />
      </div>
    </form>
  );
};

export default PedidoForm;
