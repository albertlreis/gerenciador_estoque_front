import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

const PermissaoForm = ({ initialData = {}, onSubmit, onCancel }) => {
  const [permissao, setPermissao] = useState({
    nome: initialData.nome || '',
    descricao: initialData.descricao || ''
  });
  const [loading, setLoading] = useState(false)

  const handleChange = (field, value) => {
    setPermissao({ ...permissao, [field]: value });
  };

  const handleSubmit = (e) => {
    setLoading(true);
    e.preventDefault();
    onSubmit(permissao);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-fluid p-formgrid p-grid"
      style={{gap: '1rem'}}
    >
      {/* Campo Nome */}
      <div className="p-field p-col-12">
        <label htmlFor="nome">Nome</label>
        <InputText
          id="nome"
          value={permissao.nome}
          onChange={(e) => handleChange('nome', e.target.value)}
        />
      </div>

      {/* Campo Descrição */}
      <div className="p-field p-col-12">
        <label htmlFor="descricao">Descrição</label>
        <InputText
          id="descricao"
          value={permissao.descricao}
          onChange={(e) => handleChange('descricao', e.target.value)}
        />
      </div>

      {/* Botões: alinhados à direita */}
      <div
        className="p-field p-col-12"
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: '0.5rem'
        }}
      >
        <Button label="Salvar" type="submit" icon="pi pi-check" loading={loading}/>
        <Button
          label="Cancelar"
          type="button"
          className="p-button-secondary"
          style={{marginLeft: '0.5rem'}}
          onClick={onCancel}
        />
      </div>
    </form>
  );
};

export default PermissaoForm;
