import { useRef, useState } from 'react';
import { normalizeDigits } from '../helpers';
import { checkDocumentoDuplicado } from '../services/clientesService';

export function useDocumentoDuplicado({ toast } = {}) {
  const timerRef = useRef(null);
  const [docInvalido, setDocInvalido] = useState(false);

  const check = async ({ documento, clienteId, setFieldErrors }) => {
    const docDigits = normalizeDigits(documento);
    if (!docDigits) return;

    try {
      const existe = await checkDocumentoDuplicado(docDigits, clienteId);
      if (existe) {
        setDocInvalido(true);
        toast?.current?.show?.({ severity: 'warn', summary: 'Duplicado', detail: 'Documento já cadastrado!' });

        if (setFieldErrors) {
          setFieldErrors((prev) => ({ ...(prev || {}), documento: 'Documento já cadastrado.' }));
        }
      }
    } catch (err) {
      console.error('Erro ao verificar documento', err);
      // sem toast para não “poluir” UX
    }
  };

  const debounce = (fn, ms = 350) => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(fn, ms);
  };

  const onDocumentoChange = ({ documento, clienteId, setFieldErrors }) => {
    setDocInvalido(false);
    debounce(() => check({ documento, clienteId, setFieldErrors }), 350);
  };

  return { docInvalido, setDocInvalido, checkDocumento: check, onDocumentoChange };
}
