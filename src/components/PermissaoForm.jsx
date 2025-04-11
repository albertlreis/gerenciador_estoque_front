import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';

const PermissaoForm = ({ initialData = {}, onSubmit, onCancel }) => {
  const [permissao, setPermissao] = useState({
    nome: initialData.nome || '',
    descricao: initialData.descricao || ''
  });

  const handleChange = (field, value) => {
    setPermissao({ ...permissao, [field]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(permissao);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-field">
        <span className="p-float-label">
          <InputText value={permissao.nome} onChange={(e) => handleChange('nome', e.target.value)} />
          <label>Nome</label>
        </span>
      </div>
      <div className="p-field">
        <span className="p-float-label">
          <InputTextarea value={permissao.descricao} onChange={(e) => handleChange('descricao', e.target.value)} rows={3} />
          <label>Descrição</label>
        </span>
      </div>
      <div className="p-field" style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button label="Salvar" type="submit" className="p-mr-2" />
        <Button label="Cancelar" type="button" className="p-button-secondary" onClick={onCancel} />
      </div>
    </form>
  );
};

export default PermissaoForm;
