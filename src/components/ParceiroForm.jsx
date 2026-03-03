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

const CONTATO_TIPO_OPCOES = [
  { label: 'E-mail', value: 'email' },
  { label: 'Telefone', value: 'telefone' },
  { label: 'Outro', value: 'outro' },
];

const DEFAULTS = {
  nome: '',
  tipo: 'arquiteto',
  documento: '',
  email: '',
  telefone: '',
  consultor_nome: '',
  nivel_fidelidade: '',
  endereco: '',
  status: 1,
  observacoes: '',
  contatos: [],
};

const HYBRID_MASK = '999.999.999-999?9/9999-99';
const CPF_MASK = '999.999.999-99';
const CNPJ_MASK = '99.999.999/9999-99';

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

function normalizeContato(contato = {}) {
  const tipo = String(contato.tipo ?? '').trim().toLowerCase();
  const valor = String(contato.valor ?? '').trim();
  if (!tipo || !valor) return null;
  return {
    tipo,
    valor,
    principal: !!contato.principal,
    rotulo: contato.rotulo ?? '',
    valor_e164: contato.valor_e164 ?? null,
    observacoes: contato.observacoes ?? null,
  };
}

function extractLegacyIntoContatos(data = {}) {
  const contatos = (Array.isArray(data.contatos) ? data.contatos : [])
    .map((c) => normalizeContato(c))
    .filter(Boolean);

  const email = String(data.email ?? '').trim().toLowerCase();
  const telefone = String(data.telefone ?? '').trim();

  if (email && !contatos.some((c) => c.tipo === 'email' && c.valor.toLowerCase() === email)) {
    contatos.push({ tipo: 'email', valor: email, principal: true, rotulo: 'principal', valor_e164: null, observacoes: null });
  }
  if (telefone && !contatos.some((c) => c.tipo === 'telefone' && c.valor === telefone)) {
    contatos.push({ tipo: 'telefone', valor: telefone, principal: true, rotulo: 'principal', valor_e164: null, observacoes: null });
  }

  return ensureSinglePrincipalPerTipo(contatos);
}

function ensureSinglePrincipalPerTipo(contatos = []) {
  const byType = {};
  contatos.forEach((c, idx) => {
    byType[c.tipo] = byType[c.tipo] || [];
    byType[c.tipo].push(idx);
  });

  Object.values(byType).forEach((indexes) => {
    let principalIndex = indexes.find((idx) => contatos[idx].principal);
    if (principalIndex === undefined) principalIndex = indexes[0];
    indexes.forEach((idx) => {
      contatos[idx].principal = idx === principalIndex;
    });
  });

  return contatos;
}

function resolveRootByTipo(contatos, tipo) {
  const contatosTipo = contatos.filter((c) => c.tipo === tipo);
  if (!contatosTipo.length) return '';
  const principal = contatosTipo.find((c) => c.principal);
  return (principal || contatosTipo[0])?.valor ?? '';
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

    const contatos = extractLegacyIntoContatos(merged);
    merged.contatos = contatos;
    merged.email = resolveRootByTipo(contatos, 'email');
    merged.telefone = resolveRootByTipo(contatos, 'telefone');

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

    const current = {
      ...form,
      documento: normalizeDocumento(form.documento) ?? '',
      contatos: ensureSinglePrincipalPerTipo([...(form.contatos || [])]),
    };

    const original = {
      ...DEFAULTS,
      ...Object.fromEntries(Object.keys(DEFAULTS).map((k) => [k, initialData?.[k] ?? DEFAULTS[k]])),
      documento: normalizeDocumento(initialData?.documento) ?? '',
      contatos: extractLegacyIntoContatos(initialData || {}),
    };

    return JSON.stringify(current) !== JSON.stringify(original);
  }, [form, initialData]);

  const handleChange = (field) => (e) => {
    const value = e?.target ? e.target.value : e?.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateContatos = (nextContatos) => {
    const contatos = ensureSinglePrincipalPerTipo(nextContatos.map((c) => ({ ...c })));
    setForm((prev) => ({
      ...prev,
      contatos,
      email: resolveRootByTipo(contatos, 'email'),
      telefone: resolveRootByTipo(contatos, 'telefone'),
    }));
  };

  const handleContatoChange = (index, patch) => {
    const next = [...form.contatos];
    next[index] = { ...next[index], ...patch };

    if (patch.principal) {
      const tipo = next[index].tipo;
      next.forEach((c, idx) => {
        if (idx !== index && c.tipo === tipo) c.principal = false;
      });
    }

    updateContatos(next);
  };

  const addContato = () => {
    updateContatos([
      ...form.contatos,
      { tipo: 'email', valor: '', principal: false, rotulo: '', valor_e164: null, observacoes: null },
    ]);
  };

  const removeContato = (index) => {
    const next = form.contatos.filter((_, idx) => idx !== index);
    updateContatos(next);
  };

  const handleRootContatoChange = (tipo, valor) => {
    const next = [...form.contatos];
    const raw = String(valor ?? '').trim();
    const normalized = tipo === 'email' ? raw.toLowerCase() : raw;

    const firstTypeIndex = next.findIndex((c) => c.tipo === tipo);

    if (!normalized) {
      const filtered = next.filter((c) => c.tipo !== tipo);
      updateContatos(filtered);
      return;
    }

    if (firstTypeIndex >= 0) {
      next[firstTypeIndex] = { ...next[firstTypeIndex], valor: normalized, principal: true };
      next.forEach((c, idx) => {
        if (idx !== firstTypeIndex && c.tipo === tipo) c.principal = false;
      });
      updateContatos(next);
      return;
    }

    next.unshift({
      tipo,
      valor: normalized,
      principal: true,
      rotulo: 'principal',
      valor_e164: null,
      observacoes: null,
    });
    updateContatos(next);
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

    const contatosInvalidos = (form.contatos || []).some((c) => !c.tipo || !String(c.valor || '').trim());
    if (contatosInvalidos) {
      errs.contatos = 'Todos os contatos precisam de tipo e valor';
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

    const contatos = ensureSinglePrincipalPerTipo(
      (form.contatos || []).map((c) => normalizeContato(c)).filter(Boolean)
    );

    const payload = {
      ...form,
      documento: normalizeDocumento(form.documento),
      email: resolveRootByTipo(contatos, 'email') || null,
      telefone: resolveRootByTipo(contatos, 'telefone') || null,
      contatos,
    };

    onSubmit?.(payload);
  };

  const documentoDigits = digitsOnly(form.documento);
  const isCNPJ = documentoDigits.length > 11;

  const handleDocumentoFocus = () => setDocMask(HYBRID_MASK);

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
      style={{ width: '920px', maxWidth: '95vw' }}
      modal
      onHide={onHide}
      footer={footer}
    >
      <Toast ref={toast} />

      <form id="parceiro-form" className="p-fluid" onSubmit={(e) => { e.preventDefault(); onSalvar(); }}>
        <div className="formgrid grid">
          <div className="field col-12 md:col-8">
            <label htmlFor="nome">Nome <span className="p-error">*</span></label>
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

          <div className="field col-12 sm:col-6 md:col-4">
            <label htmlFor="tipo">Categoria <span className="p-error">*</span></label>
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

          <div className="field col-12 sm:col-6 md:col-4">
            <label htmlFor="documento">Documento (CPF/CNPJ) <span className="p-error">*</span></label>
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

          <div className="field col-12 sm:col-6 md:col-4">
            <label htmlFor="email">E-mail <span className="p-error">*</span></label>
            <InputText
              id="email"
              value={form.email ?? ''}
              onChange={(e) => handleRootContatoChange('email', e.target.value)}
              placeholder="contato@parceiro.com"
              className={classNames({ 'p-invalid': errors.email })}
              disabled={loading}
            />
            {errors.email && <small className="p-error">{errors.email}</small>}
          </div>

          <div className="field col-12 sm:col-6 md:col-4">
            <label htmlFor="telefone">Telefone <span className="p-error">*</span></label>
            <InputMask
              id="telefone"
              mask="(99) 99999-9999"
              value={form.telefone ?? ''}
              onChange={(e) => handleRootContatoChange('telefone', e.target.value)}
              placeholder="(11) 99999-9999"
              className={classNames({ 'p-invalid': errors.telefone })}
              disabled={loading}
            />
            {errors.telefone && <small className="p-error">{errors.telefone}</small>}
          </div>

          <div className="field col-12 sm:col-6 md:col-4">
            <label htmlFor="consultor_nome">Consultor</label>
            <InputText
              id="consultor_nome"
              value={form.consultor_nome ?? ''}
              onChange={handleChange('consultor_nome')}
              placeholder="Nome do consultor"
              disabled={loading}
            />
          </div>

          <div className="field col-12 sm:col-6 md:col-4">
            <label htmlFor="nivel_fidelidade">Nível de fidelidade</label>
            <InputText
              id="nivel_fidelidade"
              value={form.nivel_fidelidade ?? ''}
              onChange={handleChange('nivel_fidelidade')}
              placeholder="Ex.: BRONZE, RUBI"
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
            <label>Contatos</label>
            <div className="flex flex-column gap-2">
              {(form.contatos || []).map((contato, idx) => (
                <div key={`contato-${idx}`} className="grid align-items-center">
                  <div className="col-12 md:col-2">
                    <Dropdown
                      options={CONTATO_TIPO_OPCOES}
                      optionLabel="label"
                      optionValue="value"
                      value={contato.tipo}
                      onChange={(e) => handleContatoChange(idx, { tipo: e.value })}
                      disabled={loading}
                    />
                  </div>
                  <div className="col-12 md:col-5">
                    <InputText
                      value={contato.valor ?? ''}
                      onChange={(e) => handleContatoChange(idx, { valor: e.target.value })}
                      placeholder="Valor do contato"
                      disabled={loading}
                    />
                  </div>
                  <div className="col-12 md:col-3">
                    <InputText
                      value={contato.rotulo ?? ''}
                      onChange={(e) => handleContatoChange(idx, { rotulo: e.target.value })}
                      placeholder="Rótulo"
                      disabled={loading}
                    />
                  </div>
                  <div className="col-6 md:col-1 flex align-items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!contato.principal}
                      onChange={(e) => handleContatoChange(idx, { principal: e.target.checked })}
                      disabled={loading}
                    />
                    <small>Principal</small>
                  </div>
                  <div className="col-6 md:col-1 flex justify-content-end">
                    <Button
                      type="button"
                      icon="pi pi-trash"
                      className="p-button-text p-button-danger"
                      onClick={() => removeContato(idx)}
                      disabled={loading}
                    />
                  </div>
                </div>
              ))}
              <div>
                <Button type="button" label="Adicionar contato" icon="pi pi-plus" className="p-button-text" onClick={addContato} disabled={loading} />
              </div>
            </div>
            {errors.contatos && <small className="p-error">{errors.contatos}</small>}
          </div>

          <div className="field col-12">
            <label htmlFor="observacoes">Observações</label>
            <InputTextarea
              id="observacoes"
              value={form.observacoes ?? ''}
              onChange={handleChange('observacoes')}
              rows={4}
              autoResize
              placeholder="Notas internas..."
              disabled={loading}
            />
          </div>

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
