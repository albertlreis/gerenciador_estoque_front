import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { InputMask } from 'primereact/inputmask';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import { normalizeDocumento } from '../services/parceiros';

const STATUS_OPCOES = [
  { label: 'Ativo', value: 1 },
  { label: 'Inativo', value: 0 },
];

const TIPO_OPCOES = [
  { label: 'Arquiteto', value: 'arquiteto' },
  { label: 'Decorador', value: 'decorador' },
  { label: 'Engenheiro', value: 'engenheiro' },
  { label: 'Lojista', value: 'lojista' },
  { label: 'Representante', value: 'representante' },
  { label: 'Outro', value: 'outro' },
];

const DEFAULTS = {
  nome: '',
  tipo: 'arquiteto',
  documento: '',
  email: '',
  telefone: '',
  endereco: '',
  status: 1,
  observacoes: '',
};

// Máscaras
const HYBRID_MASK = '999.999.999-999?9/9999-99';
const CPF_MASK    = '999.999.999-99';
const CNPJ_MASK   = '99.999.999/9999-99';

function validarEmail(email) {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function digitsOnly(v) {
  return String(v || '').replace(/\D+/g, '');
}
function formatCPF(d) {
  const s = digitsOnly(d).slice(0, 11);
  if (s.length !== 11) return s;
  return s.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
}
function formatCNPJ(d) {
  const s = digitsOnly(d).slice(0, 14);
  if (s.length !== 14) return s;
  return s.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

export function ParceiroForm({ visible, onHide, initialData, onSubmit, loading }) {
  const [form, setForm] = useState(DEFAULTS);
  const [errors, setErrors] = useState({});
  const [docMask, setDocMask] = useState(HYBRID_MASK);
  const toast = useRef(null);
  const nomeRef = useRef(null);

  useEffect(() => {
    if (visible) setTimeout(() => nomeRef.current?.focus(), 50);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const merged = {
      ...DEFAULTS,
      ...Object.fromEntries(Object.keys(DEFAULTS).map((k) => [k, initialData?.[k] ?? DEFAULTS[k]])),
    };
    setForm(merged);

    const digits = digitsOnly(merged.documento);
    if (digits.length === 11) {
      setDocMask(CPF_MASK);
      setForm((prev) => ({ ...prev, documento: formatCPF(digits) }));
    } else if (digits.length === 14) {
      setDocMask(CNPJ_MASK);
      setForm((prev) => ({ ...prev, documento: formatCNPJ(digits) }));
    } else {
      setDocMask(HYBRID_MASK);
    }
    setErrors({});
  }, [visible, initialData]);

  const hasChanges = useMemo(() => {
    if (!initialData) return true;
    return JSON.stringify({ ...form, documento: normalizeDocumento(form.documento) ?? '' }) !==
      JSON.stringify({
        ...DEFAULTS,
        ...Object.fromEntries(Object.keys(DEFAULTS).map((k) => [k, initialData?.[k] ?? DEFAULTS[k]])),
        documento: normalizeDocumento(initialData?.documento) ?? ''
      });
  }, [form, initialData]);

  const handleChange = (field) => (e) => {
    const value = e?.target ? e.target.value : e?.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const errs = {};
    const d = digitsOnly(form.documento);

    if (!form.nome?.trim()) errs.nome = 'Informe o nome';
    if (!form.tipo) errs.tipo = 'Informe o tipo';

    if (!form.documento?.trim()) {
      errs.documento = 'Informe o CPF ou CNPJ';
    } else if (!(d.length === 11 || d.length === 14)) {
      errs.documento = 'CPF deve ter 11 dígitos ou CNPJ 14 dígitos';
    }

    if (!form.email?.trim()) {
      errs.email = 'Informe o e-mail';
    } else if (!validarEmail(form.email)) {
      errs.email = 'E-mail inválido';
    }

    if (!form.telefone?.trim()) {
      errs.telefone = 'Informe o telefone';
    }

    setErrors(errs);
    if (Object.keys(errs).length) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Corrija os campos destacados.',
      });
    }
    return Object.keys(errs).length === 0;
  };

  const onSalvar = () => {
    if (!validate()) return;
    const payload = { ...form, documento: normalizeDocumento(form.documento) };
    onSubmit?.(payload);
  };

  const documentoDigits = digitsOnly(form.documento);
  const isCNPJ = documentoDigits.length > 11;

  const handleDocumentoFocus = () => {
    setDocMask(HYBRID_MASK);
  };

  const handleDocumentoBlur = () => {
    const d = digitsOnly(form.documento);
    if (d.length === 11) {
      setDocMask(CPF_MASK);
      setForm((prev) => ({ ...prev, documento: formatCPF(d) }));
    } else if (d.length === 14) {
      setDocMask(CNPJ_MASK);
      setForm((prev) => ({ ...prev, documento: formatCNPJ(d) }));
    } else {
      setDocMask(HYBRID_MASK);
    }
  };

  // Footer usa `hasChanges` diretamente (sem ref)
  const footer = (
    <div className="flex justify-content-end gap-2 flex-nowrap w-full">
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
        form="parceiro-form"
        label="Salvar"
        icon="pi pi-check"
        disabled={loading || !hasChanges}
        loading={loading}
      />
    </div>
  );

  return (
    <Dialog
      header={initialData?.id ? 'Editar Parceiro' : 'Novo Parceiro'}
      visible={visible}
      style={{ width: '720px', maxWidth: '95vw' }}
      modal
      onHide={onHide}
      footer={footer}
    >
      <Toast ref={toast} />

      {/* Formulário responsivo */}
      <form id="parceiro-form" className="p-fluid" onSubmit={(e) => { e.preventDefault(); onSalvar(); }}>
        <div className="formgrid grid">
          {/* Nome */}
          <div className="field col-12 md:col-8">
            <label htmlFor="nome">
              Nome <span className="p-error">*</span>
            </label>
            <InputText
              id="nome"
              ref={nomeRef}
              value={form.nome}
              onChange={handleChange('nome')}
              placeholder="Ex.: Studio XYZ"
              className={classNames({ 'p-invalid': errors.nome })}
              disabled={loading}
            />
            {errors.nome && <small className="p-error">{errors.nome}</small>}
          </div>

          {/* Tipo */}
          <div className="field col-12 sm:col-6 md:col-4">
            <label htmlFor="tipo">
              Categoria <span className="p-error">*</span>
            </label>
            <Dropdown
              id="tipo"
              options={TIPO_OPCOES}
              optionLabel="label"
              optionValue="value"
              value={form.tipo}
              onChange={handleChange('tipo')}
              className={classNames('w-full', { 'p-invalid': errors.tipo })}
              placeholder="Selecione"
              disabled={loading}
            />
            {errors.tipo && <small className="p-error">{errors.tipo}</small>}
          </div>

          {/* Documento */}
          <div className="field col-12 sm:col-6 md:col-4">
            <label htmlFor="documento">
              Documento (CPF/CNPJ) <span className="p-error">*</span>
            </label>
            <InputMask
              id="documento"
              mask={docMask}
              autoClear={false}
              slotChar=""
              value={form.documento ?? ''}
              onFocus={handleDocumentoFocus}
              onBlur={handleDocumentoBlur}
              onChange={handleChange('documento')}
              placeholder={isCNPJ ? '00.000.000/0000-00' : '000.000.000-00'}
              className={classNames({ 'p-invalid': errors.documento })}
              disabled={loading}
            />
            {errors.documento && <small className="p-error">{errors.documento}</small>}
          </div>

          {/* Email */}
          <div className="field col-12 sm:col-6 md:col-4">
            <label htmlFor="email">
              E-mail <span className="p-error">*</span>
            </label>
            <InputText
              id="email"
              value={form.email ?? ''}
              onChange={handleChange('email')}
              placeholder="contato@parceiro.com"
              className={classNames({ 'p-invalid': errors.email })}
              disabled={loading}
            />
            {errors.email && <small className="p-error">{errors.email}</small>}
          </div>

          {/* Telefone */}
          <div className="field col-12 sm:col-6 md:col-4">
            <label htmlFor="telefone">
              Telefone <span className="p-error">*</span>
            </label>
            <InputMask
              id="telefone"
              mask="(99) 99999-9999"
              value={form.telefone ?? ''}
              onChange={handleChange('telefone')}
              placeholder="(11) 99999-9999"
              className={classNames({ 'p-invalid': errors.telefone })}
              disabled={loading}
            />
            {errors.telefone && <small className="p-error">{errors.telefone}</small>}
          </div>

          {/* Endereço */}
          <div className="field col-12">
            <label htmlFor="endereco">Endereço</label>
            <InputText
              id="endereco"
              value={form.endereco ?? ''}
              onChange={handleChange('endereco')}
              placeholder="Rua Alfa, 123 - Cidade/UF"
              disabled={loading}
            />
          </div>

          {/* Observações */}
          <div className="field col-12">
            <label htmlFor="observacoes">Observações</label>
            <InputTextarea
              id="observacoes"
              value={form.observacoes ?? ''}
              onChange={handleChange('observacoes')}
              rows={4}
              autoResize
              placeholder="Notas internas…"
              disabled={loading}
            />
          </div>

          {/* Status */}
          <div className="field col-12 sm:col-6 md:col-4">
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
        </div>
      </form>
    </Dialog>
  );
}
