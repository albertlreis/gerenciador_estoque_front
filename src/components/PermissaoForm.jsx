import React, { useEffect, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

const PermissaoForm = ({ initialData = {}, onSubmit, onCancel, saving = false }) => {
  const [permissao, setPermissao] = useState({
    nome: initialData.nome || '',
    descricao: initialData.descricao || ''
  });

  useEffect(() => {
    setPermissao({
      nome: initialData.nome || '',
      descricao: initialData.descricao || '',
    });
  }, [initialData]);

  const handleChange = (field, value) => setPermissao((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit?.(permissao);
  };

  return (
    <form onSubmit={handleSubmit} className="p-fluid p-formgrid p-grid" style={{ gap: '1rem' }}>
      <div className="field">
        <label htmlFor="nome">Nome</label>
        <InputText id="nome" value={permissao.nome} disabled={saving} onChange={(e) => handleChange('nome', e.target.value)} />
      </div>

      <div className="field">
        <label htmlFor="descricao">Descrição</label>
        <InputText id="descricao" value={permissao.descricao} disabled={saving} onChange={(e) => handleChange('descricao', e.target.value)} />
      </div>

      <div className="field" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
        <Button label="Salvar" type="submit" icon="pi pi-check" loading={saving} />
        <Button label="Cancelar" type="button" className="p-button-secondary" style={{ marginLeft: '0.5rem' }} onClick={onCancel} disabled={saving} />
      </div>
    </form>
  );
};

export default PermissaoForm;
