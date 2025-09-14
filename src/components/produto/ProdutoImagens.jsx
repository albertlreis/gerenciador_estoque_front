import React from 'react';
import {Button} from 'primereact/button';
import {FileUpload} from 'primereact/fileupload';
import {Tag} from 'primereact/tag';
import {ConfirmDialog, confirmDialog} from 'primereact/confirmdialog';
import apiEstoque from '../../services/apiEstoque';
import {MAX_IMAGE_SIZE, IMAGES_FOLDER} from './constantes';

const ProdutoImagens = ({
                          produtoId,
                          existingImages,
                          setExistingImages,
                          toastRef,
                          fileUploadRef
                        }) => {
  const backendUrl = process.env.REACT_APP_BASE_URL_ESTOQUE;

  const getImageSrc = (url) =>
    url.startsWith('http') ? url : `${backendUrl}/storage/${IMAGES_FOLDER}/${url}`;

  const confirmDelete = (img) => {
    confirmDialog({
      message: 'Tem certeza que deseja excluir esta imagem?',
      header: 'Confirmação',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => handleDeleteImage(img.id)
    });
  };

  const handleDeleteImage = async (imageId) => {
    try {
      await apiEstoque.delete(`/produtos/${produtoId}/imagens/${imageId}`);
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
      toastRef.current?.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Imagem removida',
        life: 3000
      });
    } catch {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao remover imagem',
        life: 3000
      });
    }
  };

  const handleSetPrincipal = async (imageId) => {
    try {
      await apiEstoque.post(`/produtos/${produtoId}/imagens/${imageId}/definir-principal`);
      const updated = existingImages.map(img => ({
        ...img,
        principal: img.id === imageId
      }));
      setExistingImages(updated);
      toastRef.current?.show({
        severity: 'success',
        summary: 'Imagem principal atualizada',
        life: 3000
      });
    } catch {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao definir imagem principal',
        life: 3000
      });
    }
  };

  const uploadHandler = async (event) => {
    const validFiles = event.files.filter(file => file.type?.startsWith('image/'));

    if (validFiles.length !== event.files.length) {
      fileUploadRef.current?.clear();
      return;
    }

    for (const file of validFiles) {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('principal', false);

      try {
        const response = await apiEstoque.post(
          `/produtos/${produtoId}/imagens`,
          formData,
          {headers: {'Content-Type': 'multipart/form-data'}}
        );

        setExistingImages(prev => [...prev, response.data]);
        toastRef.current?.show({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Imagem enviada',
          life: 3000
        });
      } catch {
        toastRef.current?.show({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro no upload',
          life: 3000
        });
      }
    }

    fileUploadRef.current?.clear();
  };

  return (
    <div className="field col-12">
      {existingImages.length === 0 ? (
        <div className="mb-3 text-color-secondary border-1 border-dashed surface-border border-round p-4 text-center">
          Nenhuma imagem enviada ainda.
        </div>
      ) : (
        <div className="flex flex-wrap gap-3 mb-3">
          {existingImages.map((img) => (
            <div
              key={img.id}
              className="relative border-1 surface-border border-round p-1"
              style={{width: '100px', height: '100px'}}
            >
              <img
                src={img.url_completa}
                alt="Imagem do produto"
                className="w-full h-full object-cover border-round"
              />

              {img.principal && (
                <Tag
                  value="Principal"
                  severity="info"
                  className="absolute top-0 left-0 m-1"
                  style={{fontSize: '10px'}}
                />
              )}

              <Button
                type="button"
                icon="pi pi-times"
                className="p-button-rounded p-button-danger p-button-sm absolute"
                style={{top: '-8px', right: '-8px'}}
                onClick={() => confirmDelete(img)}
                tooltip="Remover imagem"
              />

              {!img.principal && (
                <Button
                  type="button"
                  icon="pi pi-star"
                  className="p-button-rounded p-button-warning p-button-sm absolute"
                  style={{bottom: '-8px', right: '-8px'}}
                  onClick={() => handleSetPrincipal(img.id)}
                  tooltip="Definir como principal"
                />
              )}
            </div>
          ))}
        </div>
      )}

      <FileUpload
        ref={fileUploadRef}
        name="files"
        customUpload
        auto
        uploadHandler={uploadHandler}
        multiple
        accept="image/*"
        maxFileSize={MAX_IMAGE_SIZE}
        chooseLabel="Enviar Imagens"
        className="w-full"
        mode="advanced"
        emptyTemplate={
          <p className="m-0">Arraste e solte as imagens aqui ou clique para selecionar</p>
        }
      />

      <ConfirmDialog/>
    </div>
  );
};

export default ProdutoImagens;
