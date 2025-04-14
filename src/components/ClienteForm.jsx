import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

const ClienteForm = ({ initialData = {}, onSubmit, onCancel }) => {
  const [cliente, setCliente] = useState({
    nome: initialData.nome || '',
    documento: initialData.documento || '',
    email: initialData.email || '',
    telefone: initialData.telefone || '',
    endereco: initialData.endereco || '',
    ativo: initialData.ativo !== undefined ? initialData.ativo : true,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setCliente({ ...cliente, [field]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    onSubmit(cliente);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-fluid p-formgrid p-grid"
      style={{ gap: '1rem' }}
    >
      {/* Campo Nome */}
      <div className="p-field p-col-12">
        <label htmlFor="nome">Nome</label>
        <InputText
          id="nome"
          value={cliente.nome}
          onChange={(e) => handleChange('nome', e.target.value)}
        />
      </div>

      {/* Campo Documento */}
      <div className="p-field p-col-12 p-md-6">
        <label htmlFor="documento">Documento</label>
        <InputText
          id="documento"
          value={cliente.documento}
          onChange={(e) => handleChange('documento', e.target.value)}
        />
      </div>

      {/* Campo Email */}
      <div className="p-field p-col-12 p-md-6">
        <label htmlFor="email">Email</label>
        <InputText
          id="email"
          value={cliente.email}
          onChange={(e) => handleChange('email', e.target.value)}
        />
      </div>

      {/* Campo Telefone */}
      <div className="p-field p-col-12 p-md-6">
        <label htmlFor="telefone">Telefone</label>
        <InputText
          id="telefone"
          value={cliente.telefone}
          onChange={(e) => handleChange('telefone', e.target.value)}
        />
      </div>

      {/* Campo Endereço */}
      <div className="p-field p-col-12 p-md-6">
        <label htmlFor="endereco">Endereço</label>
        <InputText
          id="endereco"
          value={cliente.endereco}
          onChange={(e) => handleChange('endereco', e.target.value)}
        />
      </div>

      {/* Botões */}
      <div
        className="p-field p-col-12"
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: '0.5rem',
        }}
      >
        <Button
          label="Salvar"
          type="submit"
          icon="pi pi-check"
          loading={loading}
          className="p-mr-2"
        />
        <Button
          label="Cancelar"
          type="button"
          severity="secondary"
          icon="pi pi-times"
          style={{marginLeft: '0.5rem'}}
          onClick={onCancel}
        />
      </div>
    </form>
  );
};

export default ClienteForm;
