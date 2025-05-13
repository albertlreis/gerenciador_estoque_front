import React, { useEffect, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import apiEstoque from "../services/apiEstoque";

const CategoriaForm = ({ initialData = {}, onSubmit, onCancel }) => {
  const [categoriasPai, setCategoriasPai] = useState([]);
  const [categoria, setCategoria] = useState({
    nome: initialData.nome || '',
    descricao: initialData.descricao || '',
    categoria_pai_id: initialData.categoria_pai_id || null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiEstoque.get('/categorias').then(res => {
      const outras = res.data.filter(cat => cat.id !== initialData?.id);
      setCategoriasPai(outras);
    });
  }, [initialData?.id]);

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
      <div className="field">
        <label htmlFor="nome">Nome</label>
        <InputText
          id="nome"
          value={categoria.nome}
          onChange={(e) => handleChange('nome', e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="descricao">Descrição</label>
        <InputText
          id="descricao"
          value={categoria.descricao}
          onChange={(e) => handleChange('descricao', e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="categoria_pai_id">Categoria Pai</label>
        <Dropdown
          id="categoria_pai_id"
          value={categoria.categoria_pai_id}
          options={categoriasPai}
          optionLabel="nome"
          optionValue="id"
          placeholder="Nenhuma (Categoria Raiz)"
          onChange={(e) => handleChange('categoria_pai_id', e.value)}
          showClear
        />
      </div>

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
