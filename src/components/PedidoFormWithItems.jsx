import React, { useState } from 'react';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';

const PedidoFormWithItems = ({ initialData = {}, clientes = [], variacoes = [], statusOptions = [], onSubmit, onCancel }) => {
  // Dados do cabeçalho e itens do pedido
  const [pedido, setPedido] = useState({
    id_cliente: initialData.id_cliente || null,
    data_pedido: initialData.data_pedido ? new Date(initialData.data_pedido) : new Date(),
    status: initialData.status || (statusOptions.length > 0 ? statusOptions[0] : ''),
    observacoes: initialData.observacoes || '',
    itens: initialData.itens || []  // Cada item: { id_variacao, quantidade, preco_unitario }
  });

  // Atualiza campos do cabeçalho
  const handleChangeHeader = (field, value) => {
    setPedido({ ...pedido, [field]: value });
  };

  // Atualiza os campos de um item específico
  const handleItemChange = (index, field, value) => {
    const itens = [...pedido.itens];
    itens[index][field] = value;
    setPedido({ ...pedido, itens });
  };

  // Adiciona um novo item (com valores padrão)
  const handleAddItem = () => {
    const newItem = { id_variacao: null, quantidade: 1, preco_unitario: 0 };
    setPedido({ ...pedido, itens: [...pedido.itens, newItem] });
  };

  // Remove um item da lista
  const handleRemoveItem = (index) => {
    const itens = [...pedido.itens];
    itens.splice(index, 1);
    setPedido({ ...pedido, itens });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(pedido);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Detalhes do Pedido</h3>

      {/* Cliente */}
      <div className="p-field">
        <label htmlFor="id_cliente">Cliente</label>
        <Dropdown
          id="id_cliente"
          value={pedido.id_cliente}
          options={clientes}
          onChange={(e) => handleChangeHeader('id_cliente', e.value)}
          optionLabel="nome"
          placeholder="Selecione um cliente"
        />
      </div>

      {/* Data do Pedido */}
      <div className="p-field">
        <label htmlFor="data_pedido">Data do Pedido</label>
        <Calendar
          id="data_pedido"
          value={pedido.data_pedido}
          onChange={(e) => handleChangeHeader('data_pedido', e.value)}
          dateFormat="dd/mm/yy"
        />
      </div>

      {/* Status */}
      <div className="p-field">
        <label htmlFor="status">Status</label>
        <Dropdown
          id="status"
          value={pedido.status}
          options={statusOptions.map(s => ({ label: s, value: s }))}
          onChange={(e) => handleChangeHeader('status', e.value)}
          placeholder="Selecione o status"
        />
      </div>

      {/* Observações */}
      <div className="p-field">
        <label htmlFor="observacoes">Observações</label>
        <InputTextarea
          id="observacoes"
          value={pedido.observacoes}
          onChange={(e) => handleChangeHeader('observacoes', e.target.value)}
          rows={3}
          cols={30}
        />
      </div>

      <h3>Itens do Pedido</h3>
      {/* Lista os itens do pedido */}
      {pedido.itens.map((item, index) => (
        <div key={index} className="p-grid p-formgrid" style={{ marginBottom: '1rem', border: '1px solid #ccc', padding: '1rem' }}>
          {/* Variação (seleção da variação do produto) */}
          <div className="p-field p-col-12 p-md-4">
            <label htmlFor={`item-${index}-variacao`}>Variação</label>
            <Dropdown
              id={`item-${index}-variacao`}
              value={item.id_variacao}
              options={variacoes}
              onChange={(e) => handleItemChange(index, 'id_variacao', e.value)}
              optionLabel="nome"
              placeholder="Selecione a variação"
            />
          </div>

          {/* Quantidade */}
          <div className="p-field p-col-12 p-md-3">
            <label htmlFor={`item-${index}-quantidade`}>Quantidade</label>
            <InputNumber
              id={`item-${index}-quantidade`}
              value={item.quantidade}
              onValueChange={(e) => handleItemChange(index, 'quantidade', e.value)}
              integerOnly
              min={1}
            />
          </div>

          {/* Preço Unitário */}
          <div className="p-field p-col-12 p-md-3">
            <label htmlFor={`item-${index}-preco`}>Preço Unitário</label>
            <InputNumber
              id={`item-${index}-preco`}
              value={item.preco_unitario}
              onValueChange={(e) => handleItemChange(index, 'preco_unitario', e.value)}
              mode="currency"
              currency="BRL"
              locale="pt-BR"
            />
          </div>

          {/* Botão para remover o item */}
          <div className="p-field p-col-12 p-md-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Button label="Remover" icon="pi pi-times" className="p-button-danger" onClick={() => handleRemoveItem(index)} />
          </div>
        </div>
      ))}

      <Button label="Adicionar Item" icon="pi pi-plus" className="p-button-success p-mb-3" onClick={handleAddItem} />

      <div className="p-field" style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button label="Salvar Pedido" type="submit" className="p-mr-2" />
        <Button label="Cancelar" type="button" className="p-button-secondary" onClick={onCancel} />
      </div>
    </form>
  );
};

export default PedidoFormWithItems;
