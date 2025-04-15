import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

const CategoriaForm = ({ initialData = {}, onSubmit, onCancel }) => {
  const [categoria, setCategoria] = useState({
    nome: initialData.nome || '',
    descricao: initialData.descricao || '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setCategoria({ ...categoria, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(categoria);
    } catch (error) {
      console.error('Erro no processamento do formulário:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-fluid p-formgrid p-grid"
      style={{ gap: '1rem' }}
    >
      {/* Campo Nome */}
      <div className="p-field p-col-12 p-md-6">
        <label htmlFor="nome">Nome</label>
        <InputText
          id="nome"
          value={categoria.nome}
          onChange={(e) => handleChange('nome', e.target.value)}
        />
      </div>

      {/* Campo Descrição */}
      <div className="p-field p-col-12 p-md-6">
        <label htmlFor="descricao">Descrição</label>
        <InputText
          id="descricao"
          value={categoria.descricao}
          onChange={(e) => handleChange('descricao', e.target.value)}
        />
      </div>

      {/* Botões */}
      <div
        className="p-field p-col-12"
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: '0.5rem'
        }}
      >
        <Button label="Salvar" type="submit" icon="pi pi-check" loading={loading} className="p-mr-2" />
        <Button
          label="Cancelar"
          type="button"
          severity="secondary"
          icon="pi pi-times"
          style={{ marginLeft: '0.5rem' }}
          onClick={onCancel}
        />
      </div>
    </form>
  );
};

export default CategoriaForm;
