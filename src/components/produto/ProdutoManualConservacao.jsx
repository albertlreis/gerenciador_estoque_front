import React, { useRef } from 'react';
import { FileUpload } from 'primereact/fileupload';
import { Button } from 'primereact/button';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

const ProdutoManualConservacao = ({
                                    produto,
                                    manualArquivo,
                                    setManualArquivo,
                                    toastRef
                                  }) => {
  const fileUploadRef = useRef(null);
  const backendUrl = process.env.REACT_APP_BASE_URL_ESTOQUE;

  const manualUrl = (() => {
    const raw = produto?.manual_conservacao;
    if (!raw) return null;
    const cleaned = String(raw).trim();
    if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) return cleaned;
    if (
      cleaned.startsWith('/storage') ||
      cleaned.startsWith('storage/') ||
      cleaned.startsWith('/uploads') ||
      cleaned.startsWith('uploads/')
    ) {
      const path = cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
      return backendUrl ? `${backendUrl}${path}` : path;
    }
    const legacy = `/uploads/manuais/${cleaned.replace(/^\/+/, '')}`;
    return backendUrl ? `${backendUrl}${legacy}` : legacy;
  })();

  const confirmDelete = () => {
    confirmDialog({
      message: 'Deseja remover o manual atual?',
      header: 'Confirmação',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      pt: {
        acceptButton: { root: { type: 'button' } },
        rejectButton: { root: { type: 'button' } }
      },
      accept: () => {
        setManualArquivo(null);
        toastRef.current?.show({
          severity: 'info',
          summary: 'Removido',
          detail: 'O arquivo será removido após salvar',
          life: 3000
        });
      }
    });
  };

  const uploadHandler = async ({ files }) => {
    const file = files[0];

    if (!file || file.type !== 'application/pdf') {
      toastRef.current?.show({
        severity: 'warn',
        summary: 'Arquivo inválido',
        detail: 'Apenas arquivos PDF são permitidos.',
        life: 3000
      });
      fileUploadRef.current?.clear();
      return;
    }

    setManualArquivo(file);
    toastRef.current?.show({
      severity: 'info',
      summary: 'Selecionado',
      detail: file.name,
      life: 3000
    });

    fileUploadRef.current?.clear(); // limpa preview do FileUpload
  };

  return (
    <div className="field col-12">
      <label className="font-bold mb-2 block">Manual de Conservação (PDF)</label>

      {manualArquivo ? (
        <div className="flex align-items-center gap-3 mb-2">
          <i className="pi pi-file-pdf text-2xl text-primary" />
          <span>{manualArquivo.name}</span>
          <Button
            type="button"
            icon="pi pi-times"
            className="p-button-rounded p-button-danger p-button-sm"
            onClick={confirmDelete}
            tooltip="Remover arquivo"
          />
        </div>
      ) : manualUrl ? (
        <div className="flex align-items-center gap-3 mb-2">
          <i className="pi pi-file-pdf text-2xl text-primary" />
          <a href={manualUrl} target="_blank" rel="noopener noreferrer">
            Ver manual atual
          </a>
          <Button
            type="button"
            icon="pi pi-times"
            className="p-button-rounded p-button-danger p-button-sm"
            onClick={confirmDelete}
            tooltip="Remover arquivo"
          />
        </div>
      ) : (
        <p className="text-color-secondary mb-2">Nenhum manual enviado ainda.</p>
      )}

      <FileUpload
        ref={fileUploadRef}
        name="files"
        customUpload
        auto
        uploadHandler={uploadHandler}
        multiple={false}
        accept="application/pdf"
        maxFileSize={5 * 1024 * 1024}
        chooseLabel="Selecionar Manual (PDF)"
        className="w-full"
        mode="advanced"
        emptyTemplate={<p className="m-0">Arraste o PDF ou clique para selecionar</p>}
      />

    </div>
  );
};

export default ProdutoManualConservacao;
