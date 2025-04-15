import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import { Button } from 'primereact/button';

const PerfilForm = ({ initialData = {}, permissoesOptions = [], onSubmit, onCancel }) => {
  const initialPermissoes = initialData.permissoes ? initialData.permissoes.map(p => p.id) : [];

  const [perfil, setPerfil] = useState({
    nome: initialData.nome || '',
    descricao: initialData.descricao || '',
    permissoes: initialPermissoes
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setPerfil({ ...perfil, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(perfil);
    } catch (error) {
      console.error('Erro no processamento do formulário:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-fluid p-formgrid p-grid" style={{ gap: '1rem' }}>
      {/* Campo Nome */}
      <div className="p-field p-col-12">
        <label htmlFor="nome">Nome</label>
        <InputText
          id="nome"
          value={perfil.nome}
          onChange={(e) => handleChange('nome', e.target.value)}
        />
      </div>

      {/* Campo Descrição */}
      <div className="p-field p-col-12">
        <label htmlFor="descricao">Descrição</label>
        <InputText
          id="descricao"
          value={perfil.descricao}
          onChange={(e) => handleChange('descricao', e.target.value)}
        />
      </div>

      {/* Campo Permissões */}
      <div className="p-field p-col-12">
        <label htmlFor="permissoes">Permissões</label>
        <MultiSelect
          id="permissoes"
          value={perfil.permissoes}
          options={permissoesOptions}
          onChange={(e) => handleChange('permissoes', e.value)}
          optionLabel="nome"
          optionValue="id"
          placeholder="Selecione as permissões"
          display="chip"
        />
      </div>

      {/* Botões */}
      <div className="p-field p-col-12" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
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
          className="p-button-secondary"
          icon="pi pi-times"
          style={{ marginLeft: '0.5rem' }}
          onClick={onCancel}
        />
      </div>
    </form>
  );
};

export default PerfilForm;
