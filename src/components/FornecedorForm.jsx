// src/components/FornecedorForm.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { InputMask } from 'primereact/inputmask';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import { normalizeCNPJ } from '../services/fornecedores';

const STATUS_OPCOES = [
  { label: 'Ativo', value: 1 },
  { label: 'Inativo', value: 0 },
];

const DEFAULTS = {
  nome: '',
  cnpj: '',
  email: '',
  telefone: '',
  endereco: '',
  status: 1,
  observacoes: '',
};

function validarEmail(email) {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarCNPJMask(cnpj) {
  if (!cnpj) return true; // opcional
  const digits = cnpj.replace(/\D/g, '');
  return digits.length === 14;
}

export function FornecedorForm({ visible, onHide, initialData, onSubmit, loading }) {
  const [form, setForm] = useState(DEFAULTS);
  const [errors, setErrors] = useState({});
  const toast = useRef(null);
  const nomeRef = useRef(null);

  // Foco amigável no campo Nome ao abrir
  useEffect(() => {
    if (visible) {
      setTimeout(() => nomeRef.current?.focus(), 50);
    }
  }, [visible]);

  // Recarrega o form ao abrir/editar
  useEffect(() => {
    if (visible) {
      setForm({
        ...DEFAULTS,
        ...Object.fromEntries(
          Object.keys(DEFAULTS).map((k) => [k, initialData?.[k] ?? DEFAULTS[k]])
        ),
      });
      setErrors({});
    }
  }, [visible, initialData]);

  const hasChanges = useMemo(() => {
    if (!initialData) return true;
    return JSON.stringify(
      { ...form, cnpj: normalizeCNPJ(form.cnpj) ?? '' }
    ) !== JSON.stringify(
      {
        ...DEFAULTS,
        ...Object.fromEntries(Object.keys(DEFAULTS).map((k) => [k, initialData?.[k] ?? DEFAULTS[k]])),
        cnpj: normalizeCNPJ(initialData?.cnpj) ?? '',
      }
    );
  }, [form, initialData]);

  const handleChange = (field) => (e) => {
    const value = e?.target ? e.target.value : e?.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const errs = {};
    if (!form.nome?.trim()) errs.nome = 'Informe o nome';
    if (form.email && !validarEmail(form.email)) errs.email = 'E-mail inválido';
    if (form.cnpj && !validarCNPJMask(form.cnpj)) errs.cnpj = 'CNPJ deve ter 14 dígitos';
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'Corrija os campos destacados.' });
    }
    return Object.keys(errs).length === 0;
  };

  const onSalvar = () => {
    if (!validate()) return;
    const payload = { ...form, cnpj: normalizeCNPJ(form.cnpj) };
    onSubmit?.(payload);
  };

  return (
    <Dialog
      header={initialData?.id ? 'Editar Fornecedor' : 'Novo Fornecedor'}
      visible={visible}
      style={{ width: '720px', maxWidth: '95vw' }}
      modal
      onHide={onHide}
    >
      <Toast ref={toast} />

      {/* Envolvemos tudo em <form> para permitir submit por Enter e pelo botão */}
      <form className="p-fluid" onSubmit={(e) => { e.preventDefault(); onSalvar(); }}>
        <div className="formgrid grid">
          <div className="field col-12 md:col-8">
            <label htmlFor="nome">Nome *</label>
            <InputText
              id="nome"
              ref={nomeRef}
              value={form.nome}
              onChange={handleChange('nome')}
              placeholder="Ex.: Metais Ônix LTDA"
              className={classNames({ 'p-invalid': errors.nome })}
              disabled={loading}
            />
            {errors.nome && <small className="p-error">{errors.nome}</small>}
          </div>

          <div className="field col-12 md:col-4">
            <label htmlFor="cnpj">CNPJ</label>
            <InputMask
              id="cnpj"
              mask="99.999.999/9999-99"
              value={form.cnpj ?? ''}
              onChange={handleChange('cnpj')}
              placeholder="00.000.000/0000-00"
              className={classNames({ 'p-invalid': errors.cnpj })}
              disabled={loading}
            />
            {errors.cnpj && <small className="p-error">{errors.cnpj}</small>}
          </div>

          <div className="field col-12 md:col-6">
            <label htmlFor="email">E-mail</label>
            <InputText
              id="email"
              value={form.email ?? ''}
              onChange={handleChange('email')}
              placeholder="contato@fornecedor.com"
              className={classNames({ 'p-invalid': errors.email })}
              disabled={loading}
            />
            {errors.email && <small className="p-error">{errors.email}</small>}
          </div>

          <div className="field col-12 md:col-6">
            <label htmlFor="telefone">Telefone</label>
            <InputMask
              id="telefone"
              mask="(99) 99999-9999"
              value={form.telefone ?? ''}
              onChange={handleChange('telefone')}
              placeholder="(11) 99999-9999"
              disabled={loading}
            />
          </div>

          <div className="field col-12">
            <label htmlFor="endereco">Endereço</label>
            <InputText
              id="endereco"
              value={form.endereco ?? ''}
              onChange={handleChange('endereco')}
              placeholder="Rua Alfa, 123 - São Paulo/SP"
              disabled={loading}
            />
            <small className="text-600">Opcional — rua, número, cidade/UF.</small>
          </div>

          <div className="field col-12">
            <label htmlFor="observacoes">Observações</label>
            <InputTextarea
              id="observacoes"
              value={form.observacoes ?? ''}
              onChange={handleChange('observacoes')}
              rows={4}
              autoResize
              placeholder="Notas internas, contatos principais, prazos de entrega…"
              disabled={loading}
            />
          </div>

          <div className="field col-12 md:col-4">
            <label htmlFor="status">Status</label>
            <Dropdown
              id="status"
              options={STATUS_OPCOES}
              optionLabel="label"
              optionValue="value"
              value={form.status}
              onChange={handleChange('status')}
              className="w-full"
              placeholder="Selecione"
              disabled={loading}
            />
          </div>

          {/* AÇÕES dentro da <form> (submit funciona e respeita Enter) */}
          <div className="field col-12 flex justify-content-end gap-2 mt-2">
            <Button
              type="button"
              label="Cancelar"
              icon="pi pi-times"
              className="p-button-text"
              onClick={onHide}
              disabled={loading}
            />
            <Button
              type="submit"
              label="Salvar"
              icon="pi pi-check"
              disabled={loading || !hasChanges}
              loading={loading}
            />
          </div>
        </div>
      </form>
    </Dialog>
  );
}
