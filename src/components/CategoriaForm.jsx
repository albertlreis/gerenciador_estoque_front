import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

const CategoriaForm = ({ initialData = {}, onSubmit, onCancel }) => {
  const [categoria, setCategoria] = useState({
    nome: initialData.nome || '',
    descricao: initialData.descricao || '',
  });

  const handleChange = (field, value) => {
    setCategoria({ ...categoria, [field]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(categoria);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-field">
                <span className="p-float-label">
                    <InputText
                      id="nome"
                      value={categoria.nome}
                      onChange={(e) => handleChange('nome', e.target.value)}
                    />
                    <label htmlFor="nome">Nome</label>
                </span>
      </div>
      <div className="p-field">
                <span className="p-float-label">
                    <InputText
                      id="descricao"
                      value={categoria.descricao}
                      onChange={(e) => handleChange('descricao', e.target.value)}
                    />
                    <label htmlFor="descricao">Descrição</label>
                </span>
      </div>
      <div className="p-field" style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button label="Salvar" type="submit" className="p-mr-2" />
        <Button label="Cancelar" type="button" className="p-button-secondary" onClick={onCancel} />
      </div>
    </form>
  );
};

export default CategoriaForm;
