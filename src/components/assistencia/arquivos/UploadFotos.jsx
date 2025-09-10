import React, { useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

const MAX_SIZE_MB = 3;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Uploader simples (input file nativo) com múltiplas imagens.
 * @param {{
 *  accept?: string,
 *  onUpload: (files: File[]) => Promise<void> | void,
 *  label?: string,
 * }} props
 */
export default function UploadFotos({ accept = 'image/*', onUpload, label = 'Enviar fotos' }) {
  const toast = useRef(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  /** Faz validação local (tipo + tamanho). */
  function validateFiles(files) {
    const errors = [];
    const valid = [];

    files.forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`Arquivo ${file.name} não é uma imagem válida (JPEG, PNG, WEBP).`);
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        errors.push(`Arquivo ${file.name} ultrapassa ${MAX_SIZE_MB}MB.`);
        return;
      }
      valid.push(file);
    });

    return { valid, errors };
  }

  async function handleChange(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const { valid, errors } = validateFiles(files);

    if (errors.length) {
      errors.forEach(msg => {
        toast.current?.show({ severity: 'warn', summary: 'Arquivo inválido', detail: msg, life: 4000 });
      });
    }

    if (!valid.length) {
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    setLoading(true);
    try {
      await onUpload?.(valid);
      toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Upload concluído', life: 2000 });
      if (inputRef.current) inputRef.current.value = '';
    } catch (err) {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Falha no upload', life: 3000 });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex align-items-center gap-2">
      <Toast ref={toast} />
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        className="hidden"
        onChange={handleChange}
      />
      <Button
        label={label}
        icon="pi pi-upload"
        loading={loading}
        onClick={() => inputRef.current?.click()}
      />
    </div>
  );
}
