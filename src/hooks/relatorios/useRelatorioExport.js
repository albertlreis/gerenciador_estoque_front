import { useCallback, useState } from 'react';
import { saveAs } from 'file-saver';

import api from '../../services/apiEstoque';
import { montarEndpoint } from '../../modules/relatorios/relatorios.endpoints';
import { buildParams } from '../../modules/relatorios/relatorios.params';

/**
 * @param {object} args
 * @param {string|null} args.tipo
 * @param {object} args.filtros
 * @param {React.RefObject<any>} args.toastRef
 * @param {function(): boolean} [args.validar] // opcional
 */
export function useRelatorioExport({ tipo, filtros, toastRef, validar }) {
  const [loading, setLoading] = useState(false);

  const baixarArquivo = useCallback(
    async (formato) => {
      try {
        const endpoint = montarEndpoint(tipo);
        if (!endpoint) return;
        if (validar && !validar()) return;

        const params = buildParams({ tipo, formato, filtros });

        setLoading(true);
        const res = await api.get(`${endpoint}?${params.toString()}`, { responseType: 'blob' });

        const timestamp = Date.now();
        const ext = formato === 'pdf' ? 'pdf' : 'xlsx';
        const nome = `relatorio-${tipo}-${timestamp}.${ext}`;

        const blob = new Blob([res.data], {
          type:
            formato === 'pdf'
              ? 'application/pdf'
              : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        saveAs(blob, nome);
        toastRef?.current?.show({
          severity: 'success',
          summary: 'Pronto!',
          detail: `Arquivo ${formato.toUpperCase()} gerado.`,
        });
      } catch (err) {
        console.error(err);
        toastRef?.current?.show({
          severity: 'error',
          summary: 'Erro',
          detail: `Erro ao gerar ${tipo} (${String(formato).toUpperCase()}).`,
        });
      } finally {
        setLoading(false);
      }
    },
    [tipo, filtros, toastRef, validar]
  );

  return { loading, baixarArquivo };
}
