import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';
import { Button } from 'primereact/button';

const ProdutoForm = ({ initialData = {}, categorias, onSubmit, onCancel }) => {
  const [produto, setProduto] = useState({
    nome: initialData.nome || '',
    descricao: initialData.descricao || '',
    id_categoria: initialData.id_categoria || null,
    ativo: initialData.ativo !== undefined ? initialData.ativo : true,
  });

  const handleChange = (field, value) => {
    setProduto({ ...produto, [field]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(produto);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-field">
        <span className="p-float-label">
          <InputText
            id="nome"
            value={produto.nome}
            onChange={(e) => handleChange('nome', e.target.value)}
          />
          <label htmlFor="nome">Nome</label>
        </span>
      </div>
      <div className="p-field">
        <span className="p-float-label">
          <InputText
            id="descricao"
            value={produto.descricao}
            onChange={(e) => handleChange('descricao', e.target.value)}
          />
          <label htmlFor="descricao">Descrição</label>
        </span>
      </div>
      <div className="p-field">
        <label htmlFor="categoria">Categoria</label>
        <Dropdown
          id="categoria"
          value={produto.id_categoria}
          options={categorias}
          onChange={(e) => handleChange('id_categoria', e.value)}
          optionLabel="nome"
          placeholder="Selecione a categoria"
        />
      </div>
      <div className="p-field">
        <label htmlFor="ativo" style={{ marginRight: '.5rem' }}>Ativo</label>
        <InputSwitch
          id="ativo"
          checked={produto.ativo}
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

export default ProdutoForm;
