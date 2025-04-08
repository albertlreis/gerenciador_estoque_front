import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputSwitch } from 'primereact/inputswitch';
import { Button } from 'primereact/button';

const UsuarioForm = ({ initialData = {}, onSubmit, onCancel }) => {
  // Na edição, para o campo senha normalmente é mantido em branco, para que o usuário possa decidir se quer atualizar
  const [usuario, setUsuario] = useState({
    nome: initialData.nome || '',
    email: initialData.email || '',
    senha: '',
    ativo: initialData.ativo !== undefined ? initialData.ativo : true,
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
          <InputText
            id="nome"
            value={usuario.nome}
            onChange={(e) => handleChange('nome', e.target.value)}
          />
          <label htmlFor="nome">Nome</label>
        </span>
      </div>

      <div className="p-field">
        <span className="p-float-label">
          <InputText
            id="email"
            value={usuario.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />
          <label htmlFor="email">Email</label>
        </span>
      </div>

      <div className="p-field">
        <span className="p-float-label">
          <InputText
            id="senha"
            type="password"
            value={usuario.senha}
            onChange={(e) => handleChange('senha', e.target.value)}
          />
          <label htmlFor="senha">Senha</label>
        </span>
      </div>

      <div className="p-field">
        <label htmlFor="ativo" style={{ marginRight: '.5rem' }}>Ativo</label>
        <InputSwitch
          id="ativo"
          checked={usuario.ativo}
          onChange={(e) => handleChange('ativo', e.value)}
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
