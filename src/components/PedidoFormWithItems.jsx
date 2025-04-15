import React, { useState } from 'react';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import apiEstoque from '../services/apiEstoque';

const PedidoFormWithItems = ({
                               initialData = {},
                               clientes = [],
                               produtos = [],
                               statusOptions = [],
                               onSubmit,
                               onCancel
                             }) => {
  const [pedido, setPedido] = useState({
    id_cliente: initialData.id_cliente || null,
    data_pedido: initialData.data_pedido ? new Date(initialData.data_pedido) : new Date(),
    status: initialData.status || (statusOptions.length > 0 ? statusOptions[0] : ''),
    observacoes: initialData.observacoes || '',
    itens: initialData.itens || []
  });
  const [loading, setLoading] = useState(false);

  const handleChangeHeader = (field, value) => {
    setPedido({ ...pedido, [field]: value });
  };

  const handleItemChange = (index, field, value) => {
    const itens = [...pedido.itens];
    itens[index][field] = value;
    setPedido({ ...pedido, itens });
  };

  const handleAddItem = () => {
    const newItem = { id_produto: null, quantidade: 1, preco_unitario: 0 };
    setPedido({ ...pedido, itens: [...pedido.itens, newItem] });
  };

  const handleRemoveItem = (index) => {
    const itens = [...pedido.itens];
    itens.splice(index, 1);
    setPedido({ ...pedido, itens });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const orderPayload = {
        id_cliente: pedido.id_cliente.id,
        data_pedido: pedido.data_pedido,
        status: pedido.status,
        observacoes: pedido.observacoes
      };
      const response = await apiEstoque.post('/pedidos', orderPayload);
      const createdPedido = response.data;
      const pedidoId = createdPedido.id;

      if (pedido.itens && pedido.itens.length > 0) {
        for (const item of pedido.itens) {
          await apiEstoque.post(`/pedidos/${pedidoId}/itens`, item);
        }
      }

      onSubmit({ ...createdPedido, itens: pedido.itens });
    } catch (error) {
      console.error('Erro ao salvar pedido:', error.response?.data || error.message);
      alert('Erro ao salvar pedido!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="formgrid grid">
      <h3 className="col-12">Detalhes do Pedido</h3>

      <div className="field col-12 md:col-4">
        <label htmlFor="id_cliente">Cliente</label>
        <Dropdown
          id="id_cliente"
          value={pedido.id_cliente}
          options={clientes}
          onChange={(e) => handleChangeHeader('id_cliente', e.value)}
          optionLabel="nome"
          placeholder="Selecione um cliente"
          className="w-full"
        />
      </div>

      <div className="field col-12 md:col-4">
        <label htmlFor="data_pedido">Data do Pedido</label>
        <Calendar
          id="data_pedido"
          value={pedido.data_pedido}
          onChange={(e) => handleChangeHeader('data_pedido', e.value)}
          dateFormat="dd/mm/yy"
          className="w-full"
        />
      </div>

      <div className="field col-12 md:col-4">
        <label htmlFor="status">Status</label>
        <Dropdown
          id="status"
          value={pedido.status}
          options={statusOptions.map((s) => ({ label: s, value: s }))}
          onChange={(e) => handleChangeHeader('status', e.value)}
          placeholder="Selecione o status"
          className="w-full"
        />
      </div>

      <div className="field col-12">
        <label htmlFor="observacoes">Observações</label>
        <InputTextarea
          id="observacoes"
          value={pedido.observacoes}
          onChange={(e) => handleChangeHeader('observacoes', e.target.value)}
          rows={3}
          className="w-full"
        />
      </div>

      <h3 className="col-12">Itens do Pedido</h3>

      {pedido.itens.map((item, index) => (
        <div key={index} className="col-12 border-1 surface-border border-round p-3 mb-3">
          <div className="formgrid grid">
            <div className="field col-12 md:col-4">
              <label htmlFor={`item-${index}-produto`}>Produto</label>
              <Dropdown
                id={`item-${index}-produto`}
                value={item.id_produto}
                options={produtos}
                onChange={(e) => handleItemChange(index, 'id_produto', e.value)}
                optionLabel="nome"
                placeholder="Selecione o produto"
                optionValue="id"
                className="w-full"
              />
            </div>

            <div className="field col-12 md:col-4">
              <label htmlFor={`item-${index}-quantidade`}>Quantidade</label>
              <InputNumber
                id={`item-${index}-quantidade`}
                value={item.quantidade}
                onValueChange={(e) => handleItemChange(index, 'quantidade', e.value)}
                integerOnly
                min={1}
                className="w-full"
              />
            </div>

            <div className="field col-12 md:col-4">
              <label htmlFor={`item-${index}-preco`}>Preço Unitário</label>
              <InputNumber
                id={`item-${index}-preco`}
                value={item.preco_unitario}
                onValueChange={(e) => handleItemChange(index, 'preco_unitario', e.value)}
                mode="currency"
                currency="BRL"
                locale="pt-BR"
                className="w-full"
              />
            </div>

            <div className="field col-12" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                label=""
                icon="pi pi-times"
                className="p-button-danger"
                onClick={() => handleRemoveItem(index)}
              />
            </div>
          </div>
        </div>
      ))}

      <div className="field col-12">
        <Button
          label="Adicionar Produto"
          icon="pi pi-plus"
          className="p-button-success"
          onClick={handleAddItem}
        />
      </div>

      <div className="field col-12 flex justify-content-end gap-2 mt-2">
        <Button
          label="Salvar Pedido"
          onClick={handleSubmit}
          icon="pi pi-check"
          loading={loading}
          className="p-button-primary"
        />
        <Button
          label="Cancelar"
          type="button"
          className="p-button-secondary"
          onClick={onCancel}
        />
      </div>
    </div>
  );
};

export default PedidoFormWithItems;
