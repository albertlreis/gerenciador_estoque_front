import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

const ClienteForm = ({ initialData = {}, onSubmit, onCancel }) => {
  const [cliente, setCliente] = useState({
    nome: initialData.nome || '',
    email: initialData.email || '',
    telefone: initialData.telefone || '',
    ativo: initialData.ativo !== undefined ? initialData.ativo : true,
  });

  const handleChange = (field, value) => {
    setCliente({ ...cliente, [field]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(cliente);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-field">
        <span className="p-float-label">
          <InputText
            id="nome"
            value={cliente.nome}
            onChange={(e) => handleChange('nome', e.target.value)}
          />
          <label htmlFor="nome">Nome</label>
        </span>
      </div>
      <div className="p-field">
        <span className="p-float-label">
          <InputText
            id="email"
            value={cliente.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />
          <label htmlFor="email">Email</label>
        </span>
      </div>
      <div className="p-field">
        <span className="p-float-label">
          <InputText
            id="telefone"
            value={cliente.telefone}
            onChange={(e) => handleChange('telefone', e.target.value)}
          />
          <label htmlFor="telefone">Telefone</label>
        </span>
      </div>
      <div className="p-field">
        <label htmlFor="ativo" style={{ marginRight: '.5rem' }}>Ativo:</label>
        <input
          id="ativo"
          type="checkbox"
          checked={cliente.ativo}
          onChange={(e) => handleChange('ativo', e.target.checked)}
        />
      </div>
      <div className="p-field" style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button label="Salvar" type="submit" className="p-mr-2" />
        <Button label="Cancelar" type="button" className="p-button-secondary" onClick={onCancel} />
      </div>
    </form>
  );
};

export default ClienteForm;
