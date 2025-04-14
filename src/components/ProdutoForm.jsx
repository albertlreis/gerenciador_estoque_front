import React, {useState, useEffect} from 'react';
import {InputText} from 'primereact/inputtext';
import {InputSwitch} from 'primereact/inputswitch';
import {Dropdown} from 'primereact/dropdown';
import {Button} from 'primereact/button';
import {FileUpload} from 'primereact/fileupload';
import apiEstoque from '../services/apiEstoque';

const ProdutoForm = ({initialData = {}, onSubmit, onCancel}) => {
  const [nome, setNome] = useState(initialData.nome || '');
  const [descricao, setDescricao] = useState(initialData.descricao || '');
  const [idCategoria, setIdCategoria] = useState(initialData.id_categoria || null);
  const [ativo, setAtivo] = useState(initialData.ativo !== undefined ? initialData.ativo : true);
  const [categorias, setCategorias] = useState([]);
  const [existingImages, setExistingImages] = useState(initialData.imagens || []);

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

  // Handler para o upload das imagens usando o FileUpload
  const uploadHandler = async (event) => {
    const files = event.files; // Array de arquivos selecionados
    // Envia cada arquivo para o endpoint de imagens para este produto
    for (const file of files) {
      const formData = new FormData();
      formData.append('image', file);
      // Você pode definir aqui se a imagem é principal – ajuste conforme sua lógica
      formData.append('principal', false);

      try {
        // O endpoint necessita do ID do produto; por isso, este fluxo só acontece em edição (produto já criado)
        const response = await apiEstoque.post(`/produtos/${initialData.id}/imagens`, formData, {
          headers: {'Content-Type': 'multipart/form-data'}
        });
        // Adiciona a nova imagem ao estado existente para exibição imediata
        setExistingImages(prevImages => [...prevImages, response.data]);
      } catch (error) {
        console.error('Erro ao enviar imagem:', error);
        alert('Erro ao enviar imagem');
      }
    }
  };

  // Exclusão de imagem já cadastrada
  const handleDeleteImage = async (imageId) => {
    try {
      await apiEstoque.delete(`/produtos/${initialData.id}/imagens/${imageId}`);
      setExistingImages(existingImages.filter(img => img.id !== imageId));
    } catch (error) {
      console.error('Erro ao deletar imagem:', error);
      alert('Erro ao deletar imagem');
    }
  };

  // Envio do formulário do produto (dados básicos)
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(idCategoria)
    const productData = {nome, descricao, id_categoria: idCategoria.id, ativo};
    onSubmit(productData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-field">
          <span className="p-float-label">
            <InputText value={nome} onChange={(e) => setNome(e.target.value)}/>
            <label>Nome</label>
          </span>
      </div>
      <div className="p-field">
          <span className="p-float-label">
            <InputText value={descricao} onChange={(e) => setDescricao(e.target.value)}/>
            <label>Descrição</label>
          </span>
      </div>
      <div className="p-field">
        <label>Categoria</label>
        <Dropdown
          value={idCategoria}
          options={categorias}
          onChange={(e) => setIdCategoria(e.value)}
          optionLabel="nome"
          placeholder="Selecione a categoria"
        />
      </div>
      <div className="p-field">
        <label>Ativo</label>
        <InputSwitch checked={ativo} onChange={(e) => setAtivo(e.value)}/>
      </div>

      {/* Se o produto já foi criado (possui ID), exibe a seção de imagens */}
      {initialData.id && (
        <>
          <div className="p-field">
            <h4>Imagens Cadastradas</h4>
            <div style={{display: 'flex', flexWrap: 'wrap'}}>
              {existingImages.map((img) => (
                <div key={img.id} style={{margin: '0.5rem', position: 'relative'}}>
                  <img
                    src={img.url}
                    alt="produto"
                    style={{width: '100px', height: '100px', objectFit: 'cover'}}
                  />
                  <Button
                    icon="pi pi-times"
                    className="p-button-rounded p-button-danger"
                    style={{position: 'absolute', top: 0, right: 0}}
                    onClick={() => handleDeleteImage(img.id)}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="p-field">
            <h4>Adicionar Imagens</h4>
            {/* Utilizamos o FileUpload para permitir múltiplos arquivos */}
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

      <div className="p-field" style={{display: 'flex', justifyContent: 'flex-end'}}>
        <Button label="Salvar Produto" type="submit" className="p-mr-2"/>
        <Button label="Cancelar" type="button" className="p-button-secondary" onClick={onCancel}/>
      </div>
    </form>
  );
};

export default ProdutoForm;
