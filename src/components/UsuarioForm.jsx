import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { InputSwitch } from 'primereact/inputswitch';
import { MultiSelect } from 'primereact/multiselect';
import { Button } from 'primereact/button';

const UsuarioForm = ({ initialData = {}, perfisOptions = [], onSubmit, onCancel }) => {
  const [usuario, setUsuario] = useState({
    nome: initialData.nome || '',
    email: initialData.email || '',
    senha: '', // Em edição, se vazio, pode significar que a senha não será alterada
    ativo: initialData.ativo !== undefined ? initialData.ativo : true,
    perfis: initialData.perfis || [] // Array de perfis associados (objetos ou IDs)
  });

  const handleChange = (field, value) => {
    setUsuario({ ...usuario, [field]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(usuario);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-field">
        <span className="p-float-label">
          <InputText value={usuario.nome} onChange={(e) => handleChange('nome', e.target.value)} />
          <label>Nome</label>
        </span>
      </div>
      <div className="p-field">
        <span className="p-float-label">
          <InputText value={usuario.email} onChange={(e) => handleChange('email', e.target.value)} />
          <label>Email</label>
        </span>
      </div>
      <div className="p-field">
        <span className="p-float-label">
          <Password value={usuario.senha} onChange={(e) => handleChange('senha', e.target.value)} feedback={false} />
          <label>Senha</label>
        </span>
      </div>
      <div className="p-field">
        <label htmlFor="ativo">Ativo:</label>
        <InputSwitch id="ativo" checked={usuario.ativo} onChange={(e) => handleChange('ativo', e.value)} />
      </div>
      <div className="p-field">
        <label>Perfis</label>
        <MultiSelect
          value={usuario.perfis}
          options={perfisOptions}
          onChange={(e) => handleChange('perfis', e.value)}
          optionLabel="nome"
          placeholder="Selecione os perfis"
        />
      </div>
      <div className="p-field" style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button label="Salvar" type="submit" className="p-mr-2" />
        <Button label="Cancelar" type="button" className="p-button-secondary" onClick={onCancel} />
      </div>
    </form>
  );
};

export default UsuarioForm;
