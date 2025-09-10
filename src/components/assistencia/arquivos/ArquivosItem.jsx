import React, { useEffect, useState } from 'react';
import UploadFotos from './UploadFotos';
import ArquivosGrid from './ArquivosGrid';
import {
  getItemArquivos,
  uploadItemArquivos,
  deleteArquivo,
} from '../../../services/assistenciaArquivos';

/**
 * Seção de arquivos de um Item do Chamado.
 * @param {{
 *   itemId: number|string,
 *   tipo?: string,
 *   onChanged?: ()=>void
 * }} props
 */
export default function ArquivosItem({ itemId, tipo = 'foto', onChanged }) {
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);

  async function load() {
    setBusy(true);
    try {
      const list = await getItemArquivos(itemId);
      setItems(list);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => { if (itemId) load(); }, [itemId]);

  async function handleUpload(files) {
    await uploadItemArquivos(itemId, files, tipo);
    await load();
    onChanged?.();
  }

  async function handleDelete(id) {
    await deleteArquivo(id);
    await load();
    onChanged?.();
  }

  return (
    <div className="mt-2">
      <div className="flex justify-content-between align-items-center mb-2">
        <UploadFotos onUpload={handleUpload} />
      </div>
      <div className={busy ? 'opacity-70 pointer-events-none' : ''}>
        <ArquivosGrid items={items} onDelete={handleDelete} />
      </div>
    </div>
  );
}
