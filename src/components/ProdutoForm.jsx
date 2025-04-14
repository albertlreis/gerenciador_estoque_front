import React, { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputSwitch } from 'primereact/inputswitch';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { FileUpload } from 'primereact/fileupload';
import apiEstoque from '../services/apiEstoque';

const ProdutoForm = ({ initialData = {}, onSubmit, onCancel }) => {
  // Se estiver em modo edição, tenta usar o objeto da categoria, se disponível, senão usa o id
  const [idCategoria, setIdCategoria] = useState(
    initialData.categoria ? initialData.categoria : initialData.id_categoria || null
  );
  const [nome, setNome] = useState(initialData.nome || '');
  const [descricao, setDescricao] = useState(initialData.descricao || '');
  const [preco, setPreco] = useState(initialData.preco || 0);
  const [ativo, setAtivo] = useState(
    initialData.ativo !== undefined
      ? (initialData.ativo === true || initialData.ativo === 1 || initialData.ativo === "1")
      : true
  );
  const [categorias, setCategorias] = useState([]);
  const [existingImages, setExistingImages] = useState(initialData.imagens || []);
  const [loading, setLoading] = useState(false);

  // Busca as categorias ao montar o componente
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await apiEstoque.get('/categorias');
        setCategorias(response.data);
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
      }
    };
    fetchCategorias();
  }, []);

  // Quando as categorias estiverem carregadas, se o estado de idCategoria estiver como número,
  // vamos procurar o objeto correspondente na lista e atualizar o estado.
  useEffect(() => {
    if (categorias.length > 0 && typeof idCategoria === 'number') {
      const catObj = categorias.find((c) => c.id === idCategoria);
      if (catObj) {
        setIdCategoria(catObj);
      }
    }
  }, [categorias, idCategoria]);

  // Handler para upload das imagens usando o FileUpload
  const uploadHandler = async (event) => {
    const files = event.files; // Array de arquivos selecionados
    for (const file of files) {
      const formData = new FormData();
      formData.append('image', file);
      // Ajuste conforme sua lógica de imagem principal
      formData.append('principal', false);

      try {
        // Este fluxo só ocorre se o produto já foi criado (edição)
        const response = await apiEstoque.post(`/produtos/${initialData.id}/imagens`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setExistingImages(prevImages => [...prevImages, response.data]);
      } catch (error) {
        console.error('Erro ao enviar imagem:', error);
        alert('Erro ao enviar imagem');
      }
    }
  };

  // Exclusão de imagem cadastrada
  const handleDeleteImage = async (imageId) => {
    try {
      await apiEstoque.delete(`/produtos/${initialData.id}/imagens/${imageId}`);
      setExistingImages(existingImages.filter(img => img.id !== imageId));
    } catch (error) {
      console.error('Erro ao deletar imagem:', error);
      alert('Erro ao deletar imagem');
    }
  };

  // Envio do formulário
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Aqui, garantimos que o valor enviado é o id presente no objeto selecionado
    const productData = {
      nome,
      descricao,
      id_categoria: idCategoria && idCategoria.id ? idCategoria.id : null,
      ativo,
      preco
    };
    onSubmit(productData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-fluid p-formgrid p-grid" style={{ gap: '1rem' }}>
      {/* Campo Nome */}
      <div className="p-field p-col-12">
        <label htmlFor="nome">Nome</label>
        <InputText id="nome" value={nome} onChange={(e) => setNome(e.target.value)} />
      </div>

      {/* Campo Descrição */}
      <div className="p-field p-col-12">
        <label htmlFor="descricao">Descrição</label>
        <InputTextarea id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3} />
      </div>

      {/* Campo Categoria */}
      <div className="p-field p-col-12 p-md-6">
        <label htmlFor="categoria">Categoria</label>
        <Dropdown
          id="categoria"
          value={idCategoria}
          options={categorias}
          onChange={(e) => setIdCategoria(e.value)}
          optionLabel="nome"
          placeholder="Selecione a categoria"
        />
      </div>

      {/* Campo Preço */}
      <div className="p-field p-col-12 p-md-6">
        <label htmlFor="preco">Preço</label>
        <InputNumber
          id="preco"
          value={preco}
          onValueChange={(e) => setPreco(e.value)}
          mode="currency"
          currency="BRL"
          locale="pt-BR"
        />
      </div>

      {/* Campo Ativo */}
      <div className="p-field p-col-12 p-md-6">
        <label htmlFor="ativo">Ativo</label>
        <InputSwitch
          id="ativo"
          checked={ativo}
          style={{ marginTop: '0.5rem' }}
          onChange={(e) => setAtivo(e.value)}
        />
      </div>

      {/* Se o produto já foi criado: Imagens */}
      {initialData.id && (
        <>
          <div className="p-field p-col-12">
            <h4>Imagens Cadastradas</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {existingImages.map((img) => (
                <div key={img.id} style={{ margin: '0.5rem', position: 'relative' }}>
                  <img src={img.url} alt="produto" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                  <Button
                    icon="pi pi-times"
                    className="p-button-rounded p-button-danger"
                    style={{ position: 'absolute', top: 0, right: 0 }}
                    onClick={() => handleDeleteImage(img.id)}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="p-field p-col-12">
            <h4>Adicionar Imagens</h4>
            <FileUpload
              name="files"
              customUpload
              auto
              chooseLabel="Selecionar Imagens"
              uploadHandler={uploadHandler}
              multiple
              accept="image/*"
            />
          </div>
        </>
      )}

      {/* Botões */}
      <div className="p-field p-col-12" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
        <Button label="Salvar" type="submit" icon="pi pi-check" loading={loading} className="p-mr-2" />
        <Button
          label="Cancelar"
          type="button"
          className="p-button-secondary"
          style={{ marginLeft: '0.5rem' }}
          onClick={onCancel}
        />
      </div>
    </form>
  );
};

export default ProdutoForm;
