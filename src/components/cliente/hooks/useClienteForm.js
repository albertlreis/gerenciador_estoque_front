import { useEffect, useMemo, useState } from 'react';
import {
  addEndereco,
  buildInitialCliente,
  clearFieldError,
  ensureOnePrincipalList,
  normalizeClientePayload,
  removeEndereco,
  setPrincipal,
} from '../helpers';
import { saveCliente } from '../services/clientesService';

export function useClienteForm({ initialData, onSaved, toast, extractApiError } = {}) {
  const [tipoSelecionado, setTipoSelecionado] = useState(initialData?.tipo || '');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [cliente, setCliente] = useState(() => buildInitialCliente(initialData || {}));

  useEffect(() => {
    setCliente(buildInitialCliente(initialData || {}));
    setTipoSelecionado(initialData?.tipo || '');
    setFieldErrors({});
    setFormError('');
  }, [initialData]);

  useEffect(() => {
    if (tipoSelecionado) {
      setCliente((prev) => ({ ...prev, tipo: tipoSelecionado }));
    }
  }, [tipoSelecionado]);

  const tipoOptions = useMemo(
    () => [
      { label: 'Pessoa Física', value: 'pf' },
      { label: 'Pessoa Jurídica', value: 'pj' },
    ],
    []
  );

  const handleChange = (field, value) => {
    setCliente((prev) => ({ ...prev, [field]: value }));
    setFormError('');
    setFieldErrors((prev) => clearFieldError(prev, field));
  };

  const handleEnderecoChange = (index, field, value) => {
    setCliente((prev) => {
      const enderecos = [...(prev.enderecos || [])];
      const atual = enderecos[index] || {};
      enderecos[index] = { ...atual, [field]: value };

      if (field === 'principal' && value === true) {
        return { ...prev, enderecos: setPrincipal(enderecos, index) };
      }

      return { ...prev, enderecos };
    });

    setFormError('');
    setFieldErrors((prev) => clearFieldError(prev, `enderecos.${index}.${field}`));
  };

  const fillEnderecoFromCep = (index, viaCep) => {
    setCliente((prev) => {
      const enderecos = [...(prev.enderecos || [])];
      const atual = enderecos[index] || {};
      enderecos[index] = {
        ...atual,
        endereco: atual.endereco || viaCep.endereco || '',
        bairro: atual.bairro || viaCep.bairro || '',
        cidade: atual.cidade || viaCep.cidade || '',
        estado: atual.estado || viaCep.estado || '',
      };
      return { ...prev, enderecos };
    });
  };

  const clearEnderecoFromCepNotFound = (index) => {
    setCliente((prev) => {
      const enderecos = [...(prev.enderecos || [])];
      const atual = enderecos[index] || {};
      enderecos[index] = { ...atual, endereco: '', bairro: '', cidade: '', estado: '' };
      return { ...prev, enderecos };
    });
  };

  const adicionarEndereco = () => {
    setCliente((prev) => ({ ...prev, enderecos: addEndereco(prev.enderecos) }));
  };

  const removerEndereco = (index) => {
    setCliente((prev) => ({ ...prev, enderecos: removeEndereco(prev.enderecos, index) }));
  };

  const setEnderecoPrincipal = (index) => {
    setCliente((prev) => ({ ...prev, enderecos: setPrincipal(prev.enderecos || [], index) }));
  };

  const ensurePrincipal = () => {
    setCliente((prev) => ({ ...prev, enderecos: ensureOnePrincipalList(prev.enderecos || []) }));
  };

  const submit = async () => {
    setLoading(true);
    setFieldErrors({});
    setFormError('');

    try {
      const payload = normalizeClientePayload(cliente);
      const saved = await saveCliente(payload);

      toast?.current?.show?.({
        severity: 'success',
        summary: 'Sucesso',
        detail: cliente?.id ? 'Cliente atualizado' : 'Cliente criado',
        life: 2500,
      });

      onSaved?.(saved);
      return saved;
    } catch (error) {
      const { title, message, fieldErrors: fe } = extractApiError ? extractApiError(error) : { title: 'Erro', message: 'Falha ao salvar' };
      setFieldErrors(fe || {});
      setFormError(message || 'Não foi possível salvar o cliente.');
      toast?.current?.show?.({ severity: 'error', summary: title, detail: message, life: 4000 });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    tipoSelecionado,
    setTipoSelecionado,
    tipoOptions,

    cliente,
    setCliente,

    loading,
    fieldErrors,
    setFieldErrors,
    formError,
    setFormError,

    handleChange,
    handleEnderecoChange,
    fillEnderecoFromCep,
    clearEnderecoFromCepNotFound,

    adicionarEndereco,
    removerEndereco,
    setEnderecoPrincipal,
    ensurePrincipal,

    submit,
  };
}
