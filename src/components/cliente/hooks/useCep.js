import { useState } from 'react';
import { fetchViaCep } from '../services/cepService';
import { normalizeDigits } from '../helpers';

export function useCep({ toast, onFillEndereco, onCepNotFound, onError } = {}) {
  const [cepLoading, setCepLoading] = useState({});

  const buscarCep = async ({ index, cepValue }) => {
    const cep = normalizeDigits(cepValue);
    if (cep.length !== 8) return;

    setCepLoading((prev) => ({ ...prev, [index]: true }));

    try {
      const data = await fetchViaCep(cep);

      if (data?.erro) {
        toast?.current?.show?.({
          severity: 'error',
          summary: 'CEP inválido',
          detail: 'CEP não encontrado.',
          life: 3000,
        });
        onCepNotFound?.(index);
        return;
      }

      onFillEndereco?.(index, {
        endereco: data.logradouro || '',
        bairro: data.bairro || '',
        cidade: data.localidade || '',
        estado: data.uf || '',
      });
    } catch (err) {
      console.error('Erro ao buscar CEP:', err);
      toast?.current?.show?.({
        severity: 'error',
        summary: 'Erro ao buscar CEP',
        detail: 'Falha de conexão com o serviço.',
        life: 3000,
      });
      onError?.(err);
    } finally {
      setCepLoading((prev) => ({ ...prev, [index]: false }));
    }
  };

  return { cepLoading, buscarCep };
}
