import React from 'react';
import { Button } from 'primereact/button';
import { FileUpload } from 'primereact/fileupload';
import { ProgressBar } from 'primereact/progressbar';
import { Tag } from 'primereact/tag';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import apiEstoque from '../../services/apiEstoque';
import { MAX_IMAGE_SIZE, IMAGES_FOLDER } from './constantes';

const ProdutoImagens = ({
                          produtoId,
                          existingImages,
                          setExistingImages,
                          toastRef,
                          fileUploadRef,
                          totalSize,
                          setTotalSize
                        }) => {
  const backendUrl = process.env.REACT_APP_BASE_URL_ESTOQUE;

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
      setExistingImages(existingImages.filter(img => img.id !== imageId));
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
          { headers: { 'Content-Type': 'multipart/form-data' } }
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
      <h4>Imagens do Produto</h4>

      <p className="text-sm text-color-secondary mb-2">
        As imagens são compartilhadas entre todas as variações do produto.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap' }} className="col-12">
        {existingImages.map((img) => (
          <div key={img.id} style={{ margin: '0.5rem', position: 'relative' }}>
            <img
              src={`${backendUrl}/${IMAGES_FOLDER}/${img.url}`}
              alt="produto"
              style={{ width: '100px', height: '100px', objectFit: 'cover' }}
            />
            <Button
              type="button"
              icon="pi pi-times"
              className="p-button-rounded p-button-danger"
              onClick={() => confirmDelete(img)}
            />
          </div>
        ))}
      </div>

      <FileUpload
        ref={fileUploadRef}
        name="files"
        customUpload
        auto
        uploadHandler={uploadHandler}
        multiple
        accept="image/*"
        maxFileSize={MAX_IMAGE_SIZE}
      />

      <div className="mt-3">
        <span className="block mb-1">Espaço ocupado:</span>
        <ProgressBar value={(totalSize / MAX_IMAGE_SIZE) * 100} showValue={false} style={{ height: '10px' }} />
        <Tag value={`${(totalSize / 1024).toFixed(1)} KB`} severity="info" className="mt-2" />
      </div>

      <ConfirmDialog />
    </div>
  );
};

export default ProdutoImagens;
