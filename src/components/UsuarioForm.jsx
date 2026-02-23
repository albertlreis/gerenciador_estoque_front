import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { InputSwitch } from 'primereact/inputswitch';
import { MultiSelect } from 'primereact/multiselect';
import { Button } from 'primereact/button';
import { confirmPopup } from 'primereact/confirmpopup';

const normalizeId = (v) => {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isNaN(n) ? v : n;
};

const toPerfisIds = (perfis) => {
  if (!Array.isArray(perfis)) return [];
  return perfis.map((p) => normalizeId(p?.id)).filter((v) => v !== null && v !== undefined);
};

const sameIdSet = (a = [], b = []) => {
  const sa = new Set(a.map((x) => String(x)));
  const sb = new Set(b.map((x) => String(x)));
  if (sa.size !== sb.size) return false;
  for (const x of sa) if (!sb.has(x)) return false;
  return true;
};

const isValidEmail = (email) => {
  const e = String(email || '').trim();
  if (!e) return false;
  // simples e suficiente p/ UI
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
};

const UsuarioForm = ({ initialData = {}, perfisOptions = [], onSubmit, onCancel, saving = false }) => {
  const isEditMode = Boolean(initialData?.id);

  const initialPerfis = useMemo(() => toPerfisIds(initialData?.perfis), [initialData]);
  const initialNome = initialData?.nome || '';
  const initialEmail = initialData?.email || '';
  const initialAtivo = initialData?.ativo !== undefined ? !!initialData.ativo : true;

  const [usuario, setUsuario] = useState({
    nome: initialNome,
    email: initialEmail,
    senha: '',
    ativo: initialAtivo,
    perfis: initialPerfis,
  });

  const [alterarSenha, setAlterarSenha] = useState(false); // só no edit
  const [touched, setTouched] = useState({ nome: false, email: false, senha: false });

  useEffect(() => {
    setUsuario({
      nome: initialNome,
      email: initialEmail,
      senha: '',
      ativo: initialAtivo,
      perfis: initialPerfis,
    });
    setAlterarSenha(false);
    setTouched({ nome: false, email: false, senha: false });
  }, [initialNome, initialEmail, initialAtivo, initialPerfis]);

  const handleChange = (field, value) => setUsuario((prev) => ({ ...prev, [field]: value }));

  const errors = useMemo(() => {
    const e = {};
    if (!String(usuario.nome || '').trim()) e.nome = 'Nome é obrigatório.';
    if (!String(usuario.email || '').trim()) e.email = 'E-mail é obrigatório.';
    else if (!isValidEmail(usuario.email)) e.email = 'E-mail inválido.';

    const shouldAskSenha = !isEditMode || alterarSenha;
    if (shouldAskSenha) {
      const s = String(usuario.senha || '');
      if (!s) e.senha = 'Senha é obrigatória.';
      else if (s.length < 8) e.senha = 'Senha deve ter no mínimo 8 caracteres.';
    }

    return e;
  }, [usuario.nome, usuario.email, usuario.senha, isEditMode, alterarSenha]);

  const dirty = useMemo(() => {
    if ((usuario.nome || '') !== initialNome) return true;
    if ((usuario.email || '') !== initialEmail) return true;
    if (!!usuario.ativo !== !!initialAtivo) return true;
    if (!sameIdSet(usuario.perfis, initialPerfis)) return true;

    // senha só conta como dirty se for criação, ou se o toggle estiver ligado e tiver valor
    if (!isEditMode && String(usuario.senha || '')) return true;
    if (isEditMode && alterarSenha && String(usuario.senha || '')) return true;

    return false;
  }, [usuario, initialNome, initialEmail, initialAtivo, initialPerfis, isEditMode, alterarSenha]);

  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  const askCancel = useCallback(
    (event) => {
      if (saving) return;
      if (!dirty) return onCancel?.();

      confirmPopup({
        target: event.currentTarget,
        message: 'Existem alterações não salvas. Deseja descartar?',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Descartar',
        rejectLabel: 'Continuar editando',
        accept: () => onCancel?.(),
      });
    },
    [dirty, onCancel, saving]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    // marca tudo como touched pra exibir erros
    setTouched({ nome: true, email: true, senha: true });
    if (!isValid) return;

    const payload = { ...usuario };

    // regra: no edit, só manda senha se alterarSenha + preenchida
    if (isEditMode) {
      if (!alterarSenha || !payload.senha) delete payload.senha;
    } else {
      // create: se vier vazio, deixa a validação segurar; mas por segurança:
      if (!payload.senha) delete payload.senha;
    }

    await onSubmit?.(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="p-fluid" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="p-formgrid p-grid" style={{ rowGap: '1rem' }}>
        <div className="field p-col-12">
          <label htmlFor="nome">Nome *</label>
          <InputText
            id="nome"
            value={usuario.nome}
            disabled={saving}
            onBlur={() => setTouched((t) => ({ ...t, nome: true }))}
            onChange={(e) => handleChange('nome', e.target.value)}
            className={touched.nome && errors.nome ? 'p-invalid' : ''}
          />
          {touched.nome && errors.nome && <small className="p-error">{errors.nome}</small>}
        </div>

        <div className="field p-col-12">
          <label htmlFor="email">Email *</label>
          <InputText
            id="email"
            value={usuario.email}
            disabled={saving}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            onChange={(e) => handleChange('email', e.target.value)}
            className={touched.email && errors.email ? 'p-invalid' : ''}
          />
          {touched.email && errors.email && <small className="p-error">{errors.email}</small>}
        </div>

        {isEditMode && (
          <div className="field p-col-12" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <label style={{ display: 'block' }}>Alterar senha</label>
              <small className="p-text-secondary">Ative para definir uma nova senha.</small>
            </div>
            <InputSwitch checked={alterarSenha} disabled={saving} onChange={(e) => setAlterarSenha(!!e.value)} />
          </div>
        )}

        {(!isEditMode || alterarSenha) && (
          <div className="field p-col-12">
            <label htmlFor="senha">{isEditMode ? 'Nova senha *' : 'Senha *'}</label>
            <Password
              id="senha"
              value={usuario.senha}
              disabled={saving}
              onBlur={() => setTouched((t) => ({ ...t, senha: true }))}
              onChange={(e) => handleChange('senha', e.target.value)}
              toggleMask
              feedback={false}
              className={touched.senha && errors.senha ? 'p-invalid w-full' : 'w-full'}
              inputClassName="w-full"
            />
            {touched.senha && errors.senha && <small className="p-error">{errors.senha}</small>}
            <small className="p-text-secondary">Mínimo 8 caracteres.</small>
          </div>
        )}

        <div className="field p-col-12">
          <label htmlFor="perfis">Perfis</label>
          <MultiSelect
            id="perfis"
            value={usuario.perfis}
            options={perfisOptions}
            disabled={saving}
            onChange={(e) => handleChange('perfis', e.value || [])}
            optionLabel="nome"
            optionValue="id"
            placeholder="Selecione os perfis"
            display="chip"
            filter
            showClear
            maxSelectedLabels={3}
            selectedItemsLabel="{0} perfis"
            className="w-full"
          />
        </div>

        <div className="field p-col-12" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <label style={{ display: 'block' }}>Ativo</label>
            <small className="p-text-secondary">Usuários inativos não conseguem acessar.</small>
          </div>
          <InputSwitch checked={usuario.ativo} disabled={saving} onChange={(e) => handleChange('ativo', !!e.value)} />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <Button
          label="Salvar"
          type="submit"
          icon="pi pi-check"
          loading={saving}
          disabled={saving || !dirty || !isValid}
        />
        <Button
          label="Cancelar"
          type="button"
          className="p-button-secondary"
          icon="pi pi-times"
          onClick={askCancel}
          disabled={saving}
        />
      </div>
    </form>
  );
};

export default UsuarioForm;
