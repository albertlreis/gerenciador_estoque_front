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

function validarEmail(email) {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function ParceiroForm({ visible, onHide, initialData, onSubmit, loading }) {
  const [form, setForm] = useState(DEFAULTS);
  const [errors, setErrors] = useState({});
  const toast = useRef(null);
  const nomeRef = useRef(null);

  useEffect(() => {
    if (visible) setTimeout(() => nomeRef.current?.focus(), 50);
  }, [visible]);

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
    return JSON.stringify({ ...form, documento: normalizeDocumento(form.documento) ?? '' }) !==
      JSON.stringify({ ...DEFAULTS, ...Object.fromEntries(Object.keys(DEFAULTS).map((k) => [k, initialData?.[k] ?? DEFAULTS[k]])), documento: normalizeDocumento(initialData?.documento) ?? '' });
  }, [form, initialData]);

  const handleChange = (field) => (e) => {
    const value = e?.target ? e.target.value : e?.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const errs = {};
    if (!form.nome?.trim()) errs.nome = 'Informe o nome';
    if (!form.tipo) errs.tipo = 'Informe o tipo';
    if (form.email && !validarEmail(form.email)) errs.email = 'E-mail inválido';
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'Corrija os campos destacados.' });
    }
    return Object.keys(errs).length === 0;
  };

  const onSalvar = () => {
    if (!validate()) return;
    const payload = { ...form, documento: normalizeDocumento(form.documento) };
    onSubmit?.(payload);
  };

  return (
    <Dialog
      header={initialData?.id ? 'Editar Parceiro' : 'Novo Parceiro'}
      visible={visible}
      style={{ width: '720px', maxWidth: '95vw' }}
      modal
      onHide={onHide}
    >
      <Toast ref={toast} />

      <form className="p-fluid" onSubmit={(e) => { e.preventDefault(); onSalvar(); }}>
        <div className="formgrid grid">
          <div className="field col-12 md:col-8">
            <label htmlFor="nome">Nome *</label>
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

          <div className="field col-12 md:col-4">
            <label htmlFor="tipo">Tipo *</label>
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

          <div className="field col-12 md:col-4">
            <label htmlFor="documento">Documento (CPF/CNPJ)</label>
            <InputText
              id="documento"
              value={form.documento ?? ''}
              onChange={handleChange('documento')}
              placeholder="Somente números ou com máscara"
              disabled={loading}
            />
          </div>

          <div className="field col-12 md:col-4">
            <label htmlFor="email">E-mail</label>
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

          <div className="field col-12 md:col-4">
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
              placeholder="Rua Alfa, 123 - Cidade/UF"
              disabled={loading}
            />
          </div>

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

          <div className="field col-12 flex justify-content-end gap-2 mt-2">
            <Button type="button" label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={onHide} disabled={loading} />
            <Button type="submit" label="Salvar" icon="pi pi-check" disabled={loading || !hasChanges} loading={loading} />
          </div>
        </div>
      </form>
    </Dialog>
  );
}
