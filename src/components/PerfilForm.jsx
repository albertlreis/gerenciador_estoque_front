import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { InputText } from 'primereact/inputtext';
import { PickList } from 'primereact/picklist';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { confirmPopup } from 'primereact/confirmpopup';

const normalizeId = (v) => {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isNaN(n) ? v : n;
};

const toPermIds = (permissoes) => {
  if (!Array.isArray(permissoes)) return [];
  return permissoes
    .map((p) => (typeof p === 'object' ? p?.id : p))
    .map(normalizeId)
    .filter((v) => v !== null && v !== undefined);
};

const sameIdSet = (a = [], b = []) => {
  const sa = new Set(a.map((x) => String(x)));
  const sb = new Set(b.map((x) => String(x)));
  if (sa.size !== sb.size) return false;
  for (const x of sa) if (!sb.has(x)) return false;
  return true;
};

const toTitleCase = (s) =>
  String(s || '')
    .replace(/_/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

const getModuloFromSlug = (slug) => {
  const s = String(slug || '').toLowerCase();

  // Prefixos “especiais” (melhora muito a legibilidade)
  const rules = [
    ['contas.pagar.', 'Contas a Pagar'],
    ['contas.receber.', 'Contas a Receber'],
    ['financeiro.', 'Financeiro'],
    ['despesas_recorrentes.', 'Despesas Recorrentes'],
    ['comunicacao.', 'Comunicação'],
    ['produto_variacoes.', 'Variações'],
    ['produtos.outlet.', 'Outlet'],
    ['pedidos_fabrica.', 'Pedidos Fábrica'],
  ];

  for (const [prefix, label] of rules) {
    if (s.startsWith(prefix)) return label;
  }

  // fallback: primeiro segmento do slug
  const first = String(slug || '').split('.')[0];
  return first ? toTitleCase(first) : 'Outros';
};

const truncate = (text, max = 90) => {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max)}...` : text;
};

const PerfilForm = ({
                      initialData = {},
                      permissoesOptions = [],
                      onSubmit,
                      onCancel,
                      saving = false,
                    }) => {
  const initialPermissoes = useMemo(() => toPermIds(initialData?.permissoes), [initialData]);
  const initialNome = initialData?.nome || '';
  const initialDescricao = initialData?.descricao || '';

  const [perfil, setPerfil] = useState({
    nome: initialNome,
    descricao: initialDescricao,
    permissoes: initialPermissoes,
  });

  // PickList: source (disponíveis), target (vinculadas)
  const [pick, setPick] = useState({ source: [], target: [] });

  // ações rápidas por módulo
  const [modulo, setModulo] = useState(null);

  const permissoesMap = useMemo(() => {
    const map = new Map();
    (Array.isArray(permissoesOptions) ? permissoesOptions : []).forEach((p) => {
      map.set(String(p.id), p);
    });
    return map;
  }, [permissoesOptions]);

  const modulosOptions = useMemo(() => {
    const set = new Set();
    (Array.isArray(permissoesOptions) ? permissoesOptions : []).forEach((p) => {
      set.add(getModuloFromSlug(p.slug));
    });
    return Array.from(set)
      .sort((a, b) => a.localeCompare(b))
      .map((m) => ({ label: m, value: m }));
  }, [permissoesOptions]);

  // Re-hidrata form quando trocar de registro (openEdit)
  useEffect(() => {
    setPerfil({
      nome: initialNome,
      descricao: initialDescricao,
      permissoes: initialPermissoes,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialNome, initialDescricao, initialPermissoes]);

  // Monta source/target a partir das options + ids selecionados
  useEffect(() => {
    const all = Array.isArray(permissoesOptions) ? [...permissoesOptions] : [];
    const selectedSet = new Set(initialPermissoes.map((id) => String(id)));

    const target = all.filter((p) => selectedSet.has(String(p.id)));
    const source = all.filter((p) => !selectedSet.has(String(p.id)));

    // Ordena por módulo + nome (fica muito mais organizado)
    const sortFn = (a, b) => {
      const ga = getModuloFromSlug(a.slug);
      const gb = getModuloFromSlug(b.slug);
      const g = ga.localeCompare(gb);
      if (g !== 0) return g;
      return String(a.nome || '').localeCompare(String(b.nome || ''));
    };

    source.sort(sortFn);
    target.sort(sortFn);

    setPick({ source, target });
  }, [permissoesOptions, initialPermissoes]);

  const handleChange = (field, value) => setPerfil((prev) => ({ ...prev, [field]: value }));

  const syncFromTarget = (target) => {
    const ids = (target || [])
      .map((p) => normalizeId(p.id))
      .filter((v) => v !== null && v !== undefined);

    handleChange('permissoes', ids);
  };

  const onPickChange = (e) => {
    setPick({ source: e.source, target: e.target });
    syncFromTarget(e.target);
  };

  const dirty = useMemo(() => {
    if ((perfil.nome || '') !== initialNome) return true;
    if ((perfil.descricao || '') !== initialDescricao) return true;
    return !sameIdSet(perfil.permissoes, initialPermissoes);
  }, [perfil.nome, perfil.descricao, perfil.permissoes, initialNome, initialDescricao, initialPermissoes]);

  const diff = useMemo(() => {
    const initSet = new Set(initialPermissoes.map((id) => String(id)));
    const curSet = new Set((perfil.permissoes || []).map((id) => String(id)));

    let added = 0;
    let removed = 0;

    for (const id of curSet) if (!initSet.has(id)) added++;
    for (const id of initSet) if (!curSet.has(id)) removed++;

    return { added, removed };
  }, [perfil.permissoes, initialPermissoes]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // garante que ids enviados existem nas options (evita enviar lixo)
    const sanitizedIds = (perfil.permissoes || [])
      .filter((id) => permissoesMap.has(String(id)))
      .map(normalizeId);

    await onSubmit?.({
      ...perfil,
      permissoes: sanitizedIds,
    });
  };

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

  const selecionarTodas = useCallback(
    (event) => {
      if (saving) return;

      confirmPopup({
        target: event.currentTarget,
        message: 'Vincular TODAS as permissões a este perfil?',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Vincular todas',
        rejectLabel: 'Cancelar',
        accept: () => {
          const all = Array.isArray(permissoesOptions) ? [...permissoesOptions] : [];
          all.sort((a, b) => {
            const ga = getModuloFromSlug(a.slug);
            const gb = getModuloFromSlug(b.slug);
            const g = ga.localeCompare(gb);
            if (g !== 0) return g;
            return String(a.nome || '').localeCompare(String(b.nome || ''));
          });

          setPick({ source: [], target: all });
          syncFromTarget(all);
        },
      });
    },
    [permissoesOptions, saving]
  );

  const removerTodas = useCallback(
    (event) => {
      if (saving) return;

      confirmPopup({
        target: event.currentTarget,
        message: 'Remover TODAS as permissões deste perfil?',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Remover todas',
        rejectLabel: 'Cancelar',
        accept: () => {
          const all = Array.isArray(permissoesOptions) ? [...permissoesOptions] : [];
          all.sort((a, b) => {
            const ga = getModuloFromSlug(a.slug);
            const gb = getModuloFromSlug(b.slug);
            const g = ga.localeCompare(gb);
            if (g !== 0) return g;
            return String(a.nome || '').localeCompare(String(b.nome || ''));
          });

          setPick({ source: all, target: [] });
          syncFromTarget([]);
        },
      });
    },
    [permissoesOptions, saving]
  );

  const moveModuloToTarget = useCallback(() => {
    if (!modulo || saving) return;

    const toMove = pick.source.filter((p) => getModuloFromSlug(p.slug) === modulo);
    if (!toMove.length) return;

    const remainingSource = pick.source.filter((p) => getModuloFromSlug(p.slug) !== modulo);
    const newTarget = [...pick.target, ...toMove];

    newTarget.sort((a, b) => {
      const ga = getModuloFromSlug(a.slug);
      const gb = getModuloFromSlug(b.slug);
      const g = ga.localeCompare(gb);
      if (g !== 0) return g;
      return String(a.nome || '').localeCompare(String(b.nome || ''));
    });

    setPick({ source: remainingSource, target: newTarget });
    syncFromTarget(newTarget);
  }, [modulo, pick.source, pick.target, saving]);

  const removeModuloFromTarget = useCallback(() => {
    if (!modulo || saving) return;

    const toMove = pick.target.filter((p) => getModuloFromSlug(p.slug) === modulo);
    if (!toMove.length) return;

    const remainingTarget = pick.target.filter((p) => getModuloFromSlug(p.slug) !== modulo);
    const newSource = [...pick.source, ...toMove];

    newSource.sort((a, b) => {
      const ga = getModuloFromSlug(a.slug);
      const gb = getModuloFromSlug(b.slug);
      const g = ga.localeCompare(gb);
      if (g !== 0) return g;
      return String(a.nome || '').localeCompare(String(b.nome || ''));
    });

    setPick({ source: newSource, target: remainingTarget });
    syncFromTarget(remainingTarget);
  }, [modulo, pick.source, pick.target, saving]);

  const countSourceModulo = useMemo(() => {
    if (!modulo) return 0;
    return pick.source.filter((p) => getModuloFromSlug(p.slug) === modulo).length;
  }, [modulo, pick.source]);

  const countTargetModulo = useMemo(() => {
    if (!modulo) return 0;
    return pick.target.filter((p) => getModuloFromSlug(p.slug) === modulo).length;
  }, [modulo, pick.target]);

  const permItemTemplate = (p) => {
    const m = getModuloFromSlug(p?.slug);
    const nome = p?.nome || '—';
    const slug = p?.slug || '';
    const desc = p?.descricao || '';

    return (
      <div className="p-d-flex p-flex-column" style={{ gap: 6 }}>
        <div className="p-d-flex p-ai-center" style={{ gap: 8, justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 700, lineHeight: 1.1 }}>{nome}</div>
          <Tag value={m} rounded />
        </div>

        {!!slug && (
          <small className="p-text-secondary" style={{ opacity: 0.95 }}>
            {slug}
          </small>
        )}

        {!!desc && (
          <small className="p-text-secondary" title={desc} style={{ opacity: 0.9 }}>
            {truncate(desc, 110)}
          </small>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="p-fluid" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="p-formgrid p-grid" style={{ rowGap: '1rem' }}>
        <div className="field p-col-12">
          <label htmlFor="nome">Nome</label>
          <InputText
            id="nome"
            value={perfil.nome}
            disabled={saving}
            onChange={(e) => handleChange('nome', e.target.value)}
          />
        </div>

        <div className="field p-col-12">
          <label htmlFor="descricao">Descrição</label>
          <InputText
            id="descricao"
            value={perfil.descricao}
            disabled={saving}
            onChange={(e) => handleChange('descricao', e.target.value)}
          />
        </div>
      </div>

      <div className="field">
        <div className="p-d-flex p-jc-between p-ai-center" style={{ gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 700 }}>Permissões</label>
            <small className="p-text-secondary">
              Vinculadas: <b>{pick.target?.length || 0}</b> / {Array.isArray(permissoesOptions) ? permissoesOptions.length : 0}
              {dirty && (
                <>
                  {' '}
                  — alterações: <b>+{diff.added}</b> / <b>-{diff.removed}</b>
                </>
              )}
            </small>
          </div>

          <div className="p-d-flex" style={{ gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <Button
              type="button"
              icon="pi pi-check-square"
              label="Vincular todas"
              className="p-button-text"
              onClick={selecionarTodas}
              disabled={saving || (pick.target?.length || 0) === (permissoesOptions?.length || 0)}
            />
            <Button
              type="button"
              icon="pi pi-trash"
              label="Remover todas"
              className="p-button-text p-button-danger"
              onClick={removerTodas}
              disabled={saving || (pick.target?.length || 0) === 0}
            />
          </div>
        </div>

        {/* Ações rápidas por módulo */}
        <div className="p-d-flex p-ai-center" style={{ gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          <Dropdown
            value={modulo}
            options={modulosOptions}
            onChange={(e) => setModulo(e.value)}
            placeholder="Ação rápida por módulo..."
            disabled={saving}
            style={{ minWidth: 280 }}
            showClear
          />

          <Button
            type="button"
            icon="pi pi-angle-right"
            label={modulo ? `Vincular módulo (${countSourceModulo})` : 'Vincular módulo'}
            onClick={moveModuloToTarget}
            disabled={saving || !modulo || countSourceModulo === 0}
            className="p-button-outlined"
          />

          <Button
            type="button"
            icon="pi pi-angle-left"
            label={modulo ? `Remover módulo (${countTargetModulo})` : 'Remover módulo'}
            onClick={removeModuloFromTarget}
            disabled={saving || !modulo || countTargetModulo === 0}
            className="p-button-outlined p-button-danger"
          />
        </div>

        <PickList
          source={pick.source}
          target={pick.target}
          onChange={onPickChange}
          dataKey="id"
          itemTemplate={permItemTemplate}
          sourceHeader="Disponíveis"
          targetHeader="Vinculadas ao perfil"
          filter
          filterBy="nome,slug,descricao"
          sourceFilterPlaceholder="Buscar (nome, slug, descrição)..."
          targetFilterPlaceholder="Buscar (nome, slug, descrição)..."
          showSourceControls
          showTargetControls
          disabled={saving}
          style={{ minHeight: 360 }}
        />
      </div>

      <div
        className="p-field p-col-6"
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: '0.5rem'
        }}
      >
        <Button label="Salvar" type="submit" icon="pi pi-check" loading={saving} disabled={saving || !dirty} className="p-mr-2"/>
        <Button
          label="Cancelar"
          type="button"
          className="secondary"
          icon="pi pi-times"
          onClick={askCancel}
          disabled={saving}
          style={{ marginLeft: '0.5rem' }}
        />
      </div>
    </form>
  );
};

export default PerfilForm;
