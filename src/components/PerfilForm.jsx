import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { MultiSelect } from 'primereact/multiselect';
import { Button } from 'primereact/button';

const PerfilForm = ({ initialData = {}, permissoesOptions = [], onSubmit, onCancel }) => {
  const [perfil, setPerfil] = useState({
    nome: initialData.nome || '',
    descricao: initialData.descricao || '',
    permissoes: initialData.permissoes || []
  });

  const handleChange = (field, value) => {
    setPerfil({ ...perfil, [field]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(perfil);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-field">
        <span className="p-float-label">
          <InputText value={perfil.nome} onChange={(e) => handleChange('nome', e.target.value)} />
          <label>Nome</label>
        </span>
      </div>
      <div className="p-field">
        <span className="p-float-label">
          <InputTextarea value={perfil.descricao} onChange={(e) => handleChange('descricao', e.target.value)} rows={3} />
          <label>Descrição</label>
        </span>
      </div>
      <div className="p-field">
        <label>Permissões</label>
        <MultiSelect
          value={perfil.permissoes}
          options={permissoesOptions}
          onChange={(e) => handleChange('permissoes', e.value)}
          optionLabel="nome"
          placeholder="Selecione as permissões"
        />
      </div>
      <div className="p-field" style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button label="Salvar" type="submit" className="p-mr-2" />
        <Button label="Cancelar" type="button" className="p-button-secondary" onClick={onCancel} />
      </div>
    </form>
  );
};

export default PerfilForm;
