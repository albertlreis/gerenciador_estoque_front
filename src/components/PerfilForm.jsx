import React, { useEffect, useMemo, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import { Button } from 'primereact/button';

const PerfilForm = ({ initialData = {}, permissoesOptions = [], onSubmit, onCancel, saving = false }) => {
  const initialPermissoes = useMemo(
    () => (initialData?.permissoes ? initialData.permissoes.map(p => p.id) : []),
    [initialData]
  );

  const [perfil, setPerfil] = useState({
    nome: initialData.nome || '',
    descricao: initialData.descricao || '',
    permissoes: initialPermissoes
  });

  useEffect(() => {
    setPerfil({
      nome: initialData.nome || '',
      descricao: initialData.descricao || '',
      permissoes: initialPermissoes,
    });
  }, [initialData, initialPermissoes]);

  const handleChange = (field, value) => setPerfil((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit?.(perfil);
  };

  return (
    <form onSubmit={handleSubmit} className="p-fluid p-formgrid p-grid" style={{ gap: '1rem' }}>
      <div className="field">
        <label htmlFor="nome">Nome</label>
        <InputText id="nome" value={perfil.nome} disabled={saving} onChange={(e) => handleChange('nome', e.target.value)} />
      </div>

      <div className="field">
        <label htmlFor="descricao">Descrição</label>
        <InputText id="descricao" value={perfil.descricao} disabled={saving} onChange={(e) => handleChange('descricao', e.target.value)} />
      </div>

      <div className="field">
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
          disabled={saving}
        />
      </div>

      <div className="field" style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button label="Salvar" type="submit" icon="pi pi-check" loading={saving} className="p-mr-2" />
        <Button label="Cancelar" type="button" className="p-button-secondary" icon="pi pi-times" style={{ marginLeft: '0.5rem' }} onClick={onCancel} disabled={saving} />
      </div>
    </form>
  );
};

export default PerfilForm;
