import React, { useEffect, useState } from 'react';
import UploadFotos from './UploadFotos';
import ArquivosGrid from './ArquivosGrid';
import {
  getChamadoArquivos,
  uploadChamadoArquivos,
  deleteArquivo,
} from '../../../services/assistenciaArquivos';

/**
 * Seção de arquivos de um Chamado.
 * @param {{
 *   chamadoId: number|string,
 *   tipo?: string,
 *   onChanged?: ()=>void
 * }} props
 */
export default function ArquivosChamado({ chamadoId, tipo = 'foto', onChanged }) {
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);

  async function load() {
    setBusy(true);
    try {
      const list = await getChamadoArquivos(chamadoId);
      setItems(list);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => { if (chamadoId) load(); }, [chamadoId]);

  async function handleUpload(files) {
    await uploadChamadoArquivos(chamadoId, files, tipo);
    await load();
    onChanged?.();
  }

  async function handleDelete(id) {
    await deleteArquivo(id);
    await load();
    onChanged?.();
  }

  return (
    <div className="mt-3">
      <div className="flex justify-content-between align-items-center mb-2">
        <h4 className="m-0">Fotos do Chamado</h4>
        <UploadFotos onUpload={handleUpload} />
      </div>
      <div className={busy ? 'opacity-70 pointer-events-none' : ''}>
        <ArquivosGrid items={items} onDelete={handleDelete} />
      </div>
    </div>
  );
}
