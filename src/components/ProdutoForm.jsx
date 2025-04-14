import React, { useState, useEffect, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputSwitch } from 'primereact/inputswitch';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { ProgressBar } from 'primereact/progressbar';
import { Tag } from 'primereact/tag';
import apiEstoque from '../services/apiEstoque';

const ProdutoForm = ({ initialData = {}, onSubmit, onCancel }) => {
  const backendUrl = process.env.REACT_APP_BASE_URL_ESTOQUE;
  const productImagesFolder = process.env.REACT_APP_PRODUCT_IMAGES_FOLDER || 'uploads/produtos';

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
  const [totalSize, setTotalSize] = useState(0);
  const [isFileSelectionValid, setIsFileSelectionValid] = useState(true);

  // Referências do Toast e do FileUpload
  const toastRef = useRef(null);
  const fileUploadRef = useRef(null);

  // Busca categorias assim que o componente for montado
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await apiEstoque.get('/categorias');
        setCategorias(response.data);
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        toastRef.current.show({
          severity: 'error',
          summary: 'Ops!',
          detail: 'Erro ao buscar categorias',
          life: 3000
        });
      }
    };
    fetchCategorias();
  }, []);

  // Se idCategoria estiver como número, converte para o objeto da categoria
  useEffect(() => {
    if (categorias.length > 0 && typeof idCategoria === 'number') {
      const catObj = categorias.find((c) => c.id === idCategoria);
      if (catObj) {
        setIdCategoria(catObj);
      }
    }
  }, [categorias, idCategoria]);

  // onTemplateSelect realiza a validação prévia dos arquivos
  const onTemplateSelect = (e) => {
    const validFiles = [];
    let invalidFound = false;

    e.files.forEach(file => {
      if (file.type && file.type.startsWith("image/")) {
        validFiles.push(file);
      } else {
        invalidFound = true;
        toastRef.current.show({
          severity: 'error',
          summary: 'Formato inválido',
          detail: 'Apenas arquivos de imagem são permitidos.',
          life: 3000
        });
      }
    });

    // Se algum arquivo for inválido, seta a flag e limpa a seleção para evitar envio
    if (invalidFound) {
      setIsFileSelectionValid(false);
      if (fileUploadRef && fileUploadRef.current) {
        fileUploadRef.current.clear();
      }
      return;
    } else {
      setIsFileSelectionValid(true);
    }

    // Atualiza o total de tamanho somente com arquivos válidos
    let _totalSize = 0;
    validFiles.forEach(file => {
      _totalSize += file.size || 0;
    });
    setTotalSize(_totalSize);
  };

  // Quando o upload terminar, exibe mensagem de sucesso e reseta o total
  const onTemplateUpload = (e) => {
    let _totalSize = 0;
    e.files.forEach((file) => {
      _totalSize += file.size || 0;
    });
    setTotalSize(_totalSize);
    toastRef.current.show({
      severity: 'info',
      summary: 'Sucesso',
      detail: 'Imagem(s) enviada(s)',
      life: 3000
    });
    // Limpa a fila após o upload
    if (fileUploadRef && fileUploadRef.current) {
      fileUploadRef.current.clear();
    }
  };

  const onTemplateRemove = (file, callback) => {
    setTotalSize(totalSize - (file.size || 0));
    callback();
  };

  const onTemplateClear = () => {
    setTotalSize(0);
  };

  // Header template para o FileUpload (mostra botões e progresso)
  const headerTemplate = (options) => {
    const { className, chooseButton, uploadButton, cancelButton } = options;
    // Cálculo do percentual: (tamanho total / 2MB) convertido em porcentagem
    const value = (totalSize / 2097152) * 100;
    const formatedValue =
      fileUploadRef && fileUploadRef.current ? fileUploadRef.current.formatSize(totalSize) : '0 B';

    return (
      <div
        className={className}
        style={{ backgroundColor: 'transparent', display: 'flex', alignItems: 'center' }}
      >
        {chooseButton}
        {uploadButton}
        {cancelButton}
        <div className="flex align-items-center gap-3 ml-auto">
          <span>{formatedValue} / 2 MB</span>
          <ProgressBar value={value} showValue={false} style={{ width: '10rem', height: '12px' }}></ProgressBar>
        </div>
      </div>
    );
  };

  // Template para cada arquivo em upload
  const itemTemplate = (file, props) => {
    return (
      <div className="flex align-items-center flex-wrap">
        <div className="flex align-items-center" style={{ width: '40%' }}>
          <img
            alt={file.name}
            role="presentation"
            src={file.objectURL}
            width={100}
          />
          <span className="flex flex-column text-left ml-3">
            {file.name}
            <small>{new Date().toLocaleDateString()}</small>
          </span>
        </div>
        <Tag value={props.formatSize} severity="warning" className="px-3 py-2" />
        <Button
          type="button"
          icon="pi pi-times"
          className="p-button-outlined p-button-rounded p-button-danger ml-auto"
          onClick={() => onTemplateRemove(file, props.onRemove)}
        />
      </div>
    );
  };

  // Template para exibir uma mensagem quando não há arquivos
  const emptyTemplate = () => {
    return (
      <div className="flex align-items-center flex-column">
        <i
          className="pi pi-image mt-3 p-5"
          style={{
            fontSize: '5em',
            borderRadius: '50%',
            backgroundColor: 'var(--surface-b)',
            color: 'var(--surface-d)'
          }}
        ></i>
        <span style={{ fontSize: '1.2em', color: 'var(--text-color-secondary)' }} className="my-5">
          Arraste e solte a imagem aqui
        </span>
      </div>
    );
  };

  // Opções para os botões personalizados (choose, upload, clear)
  const chooseOptions = { icon: 'pi pi-fw pi-images', iconOnly: true, className: 'custom-choose-btn p-button-rounded p-button-outlined' };
  const uploadOptions = { icon: 'pi pi-fw pi-cloud-upload', iconOnly: true, className: 'custom-upload-btn p-button-success p-button-rounded p-button-outlined' };
  const cancelOptions = { icon: 'pi pi-fw pi-times', iconOnly: true, className: 'custom-cancel-btn p-button-danger p-button-rounded p-button-outlined' };

  const uploadHandler = async (event) => {
    // Validação extra: filtra os arquivos de imagem
    const validFiles = event.files.filter(file => file.type && file.type.startsWith("image/"));

    // Se houver diferença no número de arquivos, significa que existem arquivos inválidos
    if (validFiles.length !== event.files.length) {
      if (fileUploadRef && fileUploadRef.current) {
        fileUploadRef.current.clear();
      }
      return;
    }

    // Continua com o upload dos arquivos válidos
    for (const file of validFiles) {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('principal', false);

      try {
        const response = await apiEstoque.post(
          `/produtos/${initialData.id}/imagens`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        setExistingImages(prevImages => [...prevImages, response.data]);
        toastRef.current.show({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Imagem enviada com sucesso',
          life: 3000
        });
      } catch (error) {
        console.error('Erro ao enviar imagem:', error);
        toastRef.current.show({
          severity: 'error',
          summary: 'Ops!',
          detail: 'Erro ao enviar imagem',
          life: 3000
        });
      }
    }

    // Limpa a seleção dos arquivos após o upload
    if (fileUploadRef && fileUploadRef.current) {
      fileUploadRef.current.clear();
    }
  };


  // Handler para exclusão de imagem (permanece igual)
  const handleDeleteImage = async (imageId) => {
    try {
      await apiEstoque.delete(`/produtos/${initialData.id}/imagens/${imageId}`);
      setExistingImages(existingImages.filter(img => img.id !== imageId));
      toastRef.current.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Imagem removida',
        life: 3000
      });
    } catch (error) {
      console.error('Erro ao deletar imagem:', error);
      toastRef.current.show({
        severity: 'error',
        summary: 'Ops!',
        detail: 'Erro ao deletar imagem',
        life: 3000
      });
    }
  };

  // Envio do formulário principal
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const productData = {
        nome,
        descricao,
        id_categoria: idCategoria && idCategoria.id ? idCategoria.id : null,
        ativo,
        preco
      };
      await onSubmit(productData);
    } catch (error) {
      console.error('Erro no submit:', error);
      toastRef.current.show({
        severity: 'error',
        summary: 'Ops!',
        detail: 'Erro ao salvar produto',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast ref={toastRef} position="top-center" />
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

        {/* Se o produto já foi criado: Exibir imagens e permitir upload */}
        {initialData.id && (
          <>
            <div className="p-field p-col-12">
              <h4>Imagens Cadastradas</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {existingImages.map((img) => (
                  <div key={img.id} style={{ margin: '0.5rem', position: 'relative' }}>
                    <img
                      src={`${backendUrl}/${productImagesFolder}/${img.url}`}
                      alt="produto"
                      style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                    />
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
                ref={fileUploadRef}
                name="files"
                customUpload
                auto
                onSelect={onTemplateSelect}
                onUpload={onTemplateUpload}
                onError={onTemplateClear}
                onClear={onTemplateClear}
                uploadHandler={uploadHandler}
                multiple
                accept="image/*"
                maxFileSize={2097152} // 2 MB em bytes
                invalidFileSizeMessageSummary="Arquivo muito grande!"
                invalidFileSizeMessageDetail="O tamanho máximo permitido é 2 MB."
                invalidFileSizeMessage="Cada imagem deve ter no máximo 2MB"
                headerTemplate={headerTemplate}
                itemTemplate={itemTemplate}
                emptyTemplate={emptyTemplate}
                chooseOptions={chooseOptions}
                uploadOptions={uploadOptions}
                cancelOptions={cancelOptions}
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
    </>
  );
};

export default ProdutoForm;
