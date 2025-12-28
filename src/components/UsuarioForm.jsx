import React, { useEffect, useMemo, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { InputSwitch } from 'primereact/inputswitch';
import { MultiSelect } from 'primereact/multiselect';
import { Button } from 'primereact/button';

const UsuarioForm = ({ initialData = {}, perfisOptions = [], onSubmit, onCancel, saving = false }) => {
  const isEditMode = Boolean(initialData?.id);

  const initialPerfis = useMemo(
    () => (initialData?.perfis ? initialData.perfis.map((p) => p.id) : []),
    [initialData]
  );

  const [usuario, setUsuario] = useState({
    nome: initialData.nome || '',
    email: initialData.email || '',
    senha: '',
    ativo: initialData.ativo !== undefined ? !!initialData.ativo : true,
    perfis: initialPerfis
  });

  useEffect(() => {
    setUsuario({
      nome: initialData.nome || '',
      email: initialData.email || '',
      senha: '',
      ativo: initialData.ativo !== undefined ? !!initialData.ativo : true,
      perfis: initialPerfis,
    });
  }, [initialData, initialPerfis]);

  const handleChange = (field, value) => setUsuario((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = { ...usuario };
    if (!payload.senha) delete payload.senha; // evita mandar senha vazia

    await onSubmit?.(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="p-fluid">
      <div className="field">
        <label className="p-col-12 p-md-3">Nome</label>
        <div className="p-col-12 p-md-9">
          <InputText
            value={usuario.nome}
            disabled={saving}
            className="text-base text-color surface-overlay p-2 border-2 border-solid border-round focus:border-primary w-full"
            onChange={(e) => handleChange('nome', e.target.value)}
          />
        </div>
      </div>

      <div className="field">
        <label className="p-col-12 p-md-3">Email</label>
        <div className="p-col-12 p-md-9">
          <InputText
            value={usuario.email}
            disabled={saving}
            className="text-base text-color surface-overlay p-2 border-2 border-solid border-round focus:border-primary w-full"
            onChange={(e) => handleChange('email', e.target.value)}
          />
        </div>
      </div>

      {!isEditMode && (
        <div className="field">
          <label className="p-col-12 p-md-3">Senha</label>
          <div className="p-col-12 p-md-9">
            <Password
              value={usuario.senha}
              disabled={saving}
              onChange={(e) => handleChange('senha', e.target.value)}
              className="text-base text-color surface-overlay border-1 border-solid border-round focus:border-primary w-full"
              feedback={false}
              minLength={6}
            />
          </div>
        </div>
      )}

      <div className="field">
        <label className="p-col-12 p-md-3">Perfis</label>
        <div className="p-col-12 p-md-9">
          <MultiSelect
            value={usuario.perfis}
            options={perfisOptions}
            disabled={saving}
            onChange={(e) => handleChange('perfis', e.value)}
            optionLabel="nome"
            optionValue="id"
            placeholder="Selecione os perfis"
            display="chip"
            className="text-base text-color surface-overlay p-1 border-2 border-solid border-round focus:border-primary w-full"
          />
        </div>
      </div>

      <div className="field">
        <label className="p-col-12 p-md-3">Ativo</label>
        <div className="p-col-12 p-md-9">
          <InputSwitch checked={usuario.ativo} disabled={saving} onChange={(e) => handleChange('ativo', e.value)} />
        </div>
      </div>

      <div className="p-field p-col-12" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
        <Button label="Salvar" type="submit" icon="pi pi-check" loading={saving} className="p-mr-2" />
        <Button label="Cancelar" type="button" className="p-button-secondary" icon="pi pi-times" style={{ marginLeft: '0.5rem' }} onClick={onCancel} disabled={saving} />
      </div>
    </form>
  );
};

export default UsuarioForm;
