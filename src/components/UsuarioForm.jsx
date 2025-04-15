import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { InputSwitch } from 'primereact/inputswitch';
import { MultiSelect } from 'primereact/multiselect';
import { Button } from 'primereact/button';

const UsuarioForm = ({ initialData = {}, perfisOptions = [], onSubmit, onCancel }) => {
  const isEditMode = Boolean(initialData.id);

  const [usuario, setUsuario] = useState({
    nome: initialData.nome || '',
    email: initialData.email || '',
    senha: '',
    ativo: initialData.ativo !== undefined ? !!initialData.ativo : true,
    perfis: initialData.perfis ? initialData.perfis.map(perfil => perfil.id) : []
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setUsuario({ ...usuario, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(usuario);
    } catch (error) {
      console.error('Erro no processamento do formulário:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-fluid">
      {/* Campo Nome */}
      <div className="p-field p-grid">
        <label className="p-col-12 p-md-3">Nome</label>
        <div className="p-col-12 p-md-9">
          <InputText
            value={usuario.nome}
            onChange={(e) => handleChange('nome', e.target.value)}
          />
        </div>
      </div>

      {/* Campo Email */}
      <div className="p-field p-grid">
        <label className="p-col-12 p-md-3">Email</label>
        <div className="p-col-12 p-md-9">
          <InputText
            value={usuario.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />
        </div>
      </div>

      {/* Campo Senha: exibido no cadastro; para edição, se mantiver vazio, não altera */}
      {!isEditMode && (
        <div className="p-field p-grid">
          <label className="p-col-12 p-md-3">Senha</label>
          <div className="p-col-12 p-md-9">
            <Password
              value={usuario.senha}
              onChange={(e) => handleChange('senha', e.target.value)}
              feedback={false}
              minLength={6}
            />
          </div>
        </div>
      )}

      {/* Campo Ativo */}
      <div className="p-field p-grid">
        <label className="p-col-12 p-md-3">Ativo</label>
        <div className="p-col-12 p-md-9">
          <InputSwitch
            checked={usuario.ativo}
            onChange={(e) => handleChange('ativo', e.value)}
          />
        </div>
      </div>

      {/* Campo Perfis: permite vincular e desvincular perfis em cadastro e edição */}
      <div className="p-field p-grid">
        <label className="p-col-12 p-md-3">Perfis</label>
        <div className="p-col-12 p-md-9">
          <MultiSelect
            value={usuario.perfis}
            options={perfisOptions}
            onChange={(e) => handleChange('perfis', e.value)}
            optionLabel="nome"
            optionValue="id"  // Define que o valor utilizado é o ID do perfil
            placeholder="Selecione os perfis"
            display="chip"
          />
        </div>
      </div>

      {/* Botões Salvar/Cancelar */}
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

export default UsuarioForm;
