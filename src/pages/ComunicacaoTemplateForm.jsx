import React, { useEffect, useMemo, useRef, useState } from 'react';
import SakaiLayout from '../layouts/SakaiLayout';
import { Panel } from 'primereact/panel';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { Divider } from 'primereact/divider';
import { useNavigate, useParams } from 'react-router-dom';

import { comms } from '../services/apiComunicacaoAdmin';
import JsonViewer from '../components/comunicacao/JsonViewer';
import ModalGuiaRapidoTemplates from '../components/comunicacao/ModalGuiaRapidoTemplates';

function safeJsonParse(s, fallback) {
  try {
    if (s == null) return fallback;
    const trimmed = String(s).trim();
    if (!trimmed) return fallback;
    return JSON.parse(trimmed);
  } catch {
    return fallback;
  }
}

function prettyJson(v, fallbackText = '{}') {
  try {
    if (v === undefined) return fallbackText;
    if (v === null) return 'null';
    return JSON.stringify(v, null, 2);
  } catch {
    return fallbackText;
  }
}

export default function ComunicacaoTemplateForm({ mode }) {
  const toastRef = useRef(null);
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = mode === 'edit';

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Template (root)
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [channel, setChannel] = useState('email');
  const [active, setActive] = useState(true);

  // Current editor content (represents a version draft)
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [variablesSchemaJson, setVariablesSchemaJson] = useState(
    '{\n  "type": "object",\n  "properties": {\n    "nome": { "type": "string" }\n  }\n}'
  );

  // meta do template (root)
  const [metaJson, setMetaJson] = useState('{}');

  // Versions
  const [versions, setVersions] = useState([]); // array de TemplateVersionResource
  const [selectedVersionId, setSelectedVersionId] = useState(null);
  const [currentVersionId, setCurrentVersionId] = useState(null);

  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (!isEdit) return; // você pode remover se quiser no "novo"
    const key = `comms_templates_help_seen_v1`;
    if (!localStorage.getItem(key)) {
      setShowHelp(true);
      localStorage.setItem(key, '1');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedVersion = useMemo(() => {
    if (!selectedVersionId) return null;
    return versions.find((v) => String(v.id) === String(selectedVersionId)) || null;
  }, [versions, selectedVersionId]);

  // Snapshot do currentVersion carregado (para evitar criar versão sem alteração)
  const originalVersionSnapshotRef = useRef({
    subject: '',
    body: '',
    variables_schema: null,
  });

  const [previewVarsJson, setPreviewVarsJson] = useState('{\n  "nome": "Cliente"\n}');
  const [previewResult, setPreviewResult] = useState(null);

  const channelOptions = [
    { label: 'WhatsApp', value: 'whatsapp' },
    { label: 'Email', value: 'email' },
    { label: 'SMS', value: 'sms' },
  ];

  const versionOptions = useMemo(() => {
    // versions já vem ordenado do back (desc), mas garantimos
    const sorted = [...versions].sort((a, b) => (Number(b.version) || 0) - (Number(a.version) || 0));
    return sorted.map((v) => ({
      label: `v${v.version}${String(v.id) === String(currentVersionId) ? ' • atual' : ''}`,
      value: v.id,
    }));
  }, [versions, currentVersionId]);

  // Payloads
  const storePayload = useMemo(() => {
    const variables_schema = safeJsonParse(variablesSchemaJson, null);
    const meta = safeJsonParse(metaJson, null);

    return {
      name: name?.trim(),
      code: code?.trim(),
      channel,
      active: !!active,
      subject: channel === 'email' ? (subject || null) : undefined,
      body: body ?? '',
      variables_schema: variables_schema ?? null,
      meta: meta ?? null,
    };
  }, [name, code, channel, active, subject, body, variablesSchemaJson, metaJson]);

  const updatePayload = useMemo(() => {
    const meta = safeJsonParse(metaJson, null);

    // Só envia dados da versão se houver alteração
    const variables_schema = safeJsonParse(variablesSchemaJson, null);

    const orig = originalVersionSnapshotRef.current || { subject: '', body: '', variables_schema: null };
    const hasVersionChange =
      String(orig.subject ?? '') !== String(subject ?? '') ||
      String(orig.body ?? '') !== String(body ?? '') ||
      JSON.stringify(orig.variables_schema ?? null) !== JSON.stringify(variables_schema ?? null);

    return {
      // root
      name: name?.trim() || undefined,
      active: typeof active === 'boolean' ? active : undefined,
      meta: meta ?? null,

      // versão: só manda se mudou (evita criar versão nova sem querer)
      ...(hasVersionChange
        ? {
          body: body ?? null,
          subject: channel === 'email' ? (subject || null) : undefined,
          variables_schema: variables_schema ?? null,
        }
        : {}),
    };
  }, [name, active, metaJson, body, subject, channel, variablesSchemaJson]);

  async function load() {
    if (!isEdit) return;
    setLoading(true);
    try {
      // Pode passar versions_limit se quiser mais/menos
      const res = await comms.templatesShow(id, { params: { versions_limit: 200 } }).catch(() => comms.templatesShow(id));
      const t = res?.data;

      if (!t) throw new Error('Template não encontrado.');

      // Root
      setName(t.name || '');
      setCode(t.code || '');
      setChannel(t.channel || 'email');
      setActive(!!t.active);

      setCurrentVersionId(t.current_version_id ?? null);

      // meta root (Resource expõe "meta" e "meta_json"; prioriza "meta")
      setMetaJson(prettyJson(t.meta ?? t.meta_json ?? null, '{}'));

      // versions (Resource expõe "versions")
      const vs = Array.isArray(t.versions) ? t.versions : [];
      setVersions(vs);

      // currentVersion (Resource expõe "currentVersion")
      const cv = t.currentVersion || null;

      if (cv) {
        setSubject(cv.subject || '');
        setBody(cv.body || '');

        // Resource expõe "variables_schema" e "variables_schema_json"; prioriza "variables_schema"
        setVariablesSchemaJson(prettyJson(cv.variables_schema ?? cv.variables_schema_json ?? null, 'null'));

        // seleciona por padrão a versão atual
        setSelectedVersionId(cv.id);

        // snapshot do original
        originalVersionSnapshotRef.current = {
          subject: cv.subject || '',
          body: cv.body || '',
          variables_schema: cv.variables_schema ?? cv.variables_schema_json ?? null,
        };
      } else {
        // sem versão atual (caso raro)
        setSubject('');
        setBody('');
        setVariablesSchemaJson('null');
        setSelectedVersionId(null);

        originalVersionSnapshotRef.current = { subject: '', body: '', variables_schema: null };
      }
    } catch (e) {
      console.error(e);
      toastRef.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: e?.message || 'Falha ao carregar template.',
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function onSave() {
    setSaving(true);
    try {
      if (!name?.trim()) throw new Error('name é obrigatório.');
      if (!code?.trim()) throw new Error('code é obrigatório.');
      if (!channel) throw new Error('channel é obrigatório.');
      if (!body?.trim()) throw new Error('body é obrigatório.');

      // valida json local
      safeJsonParse(variablesSchemaJson, null);
      safeJsonParse(metaJson, null);

      if (isEdit) {
        await comms.templatesUpdate(id, updatePayload);
      } else {
        await comms.templatesStore(storePayload);
      }

      toastRef.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Template salvo.' });

      if (isEdit) {
        // recarrega para atualizar versions/currentVersion/snapshot
        await load();
      } else {
        navigate('/comunicacao/templates');
      }
    } catch (e) {
      console.error(e);
      toastRef.current?.show({ severity: 'error', summary: 'Erro', detail: e?.message || 'Falha ao salvar.' });
    } finally {
      setSaving(false);
    }
  }

  function onLoadSelectedVersionIntoEditor() {
    if (!selectedVersion) return;

    // carrega a versão selecionada no editor
    setSubject(selectedVersion.subject || '');
    setBody(selectedVersion.body || '');
    setVariablesSchemaJson(prettyJson(selectedVersion.variables_schema ?? selectedVersion.variables_schema_json ?? null, 'null'));

    toastRef.current?.show({
      severity: 'info',
      summary: 'Versão carregada',
      detail: `Carregada v${selectedVersion.version} no editor (ainda não salvou).`,
    });
  }

  async function onPreview() {
    try {
      const vars = safeJsonParse(previewVarsJson, {});
      if (!isEdit) {
        toastRef.current?.show({
          severity: 'warn',
          summary: 'Preview',
          detail: 'Para usar preview via endpoint, salve primeiro (precisa de id).',
        });
        setPreviewResult({ note: 'Salve primeiro para chamar /preview com id.' });
        return;
      }

      const res = await comms.templatesPreview(id, { variables: vars });
      setPreviewResult(res?.data ?? res);
    } catch (e) {
      console.error(e);
      toastRef.current?.show({ severity: 'error', summary: 'Erro', detail: e?.message || 'Falha ao gerar preview.' });
    }
  }

  return (
    <SakaiLayout>
      <Toast ref={toastRef} />
      <ModalGuiaRapidoTemplates visible={showHelp} onHide={() => setShowHelp(false)} />

      <div className="p-4">
        <Panel
          header={isEdit ? `Comunicação • Editar Template #${id}` : 'Comunicação • Novo Template'}
          headerTemplate={() => (
            <div className="flex align-items-center justify-content-between w-full">
              <div className="font-semibold">{isEdit ? `Editar Template #${id}` : 'Novo Template'}</div>
              <div className="flex gap-2">
                <Button
                  label="Guia rápido"
                  icon="pi pi-question-circle"
                  className="p-button-text"
                  onClick={() => setShowHelp(true)}
                />
                <Button label="Voltar" icon="pi pi-arrow-left" className="p-button-text" onClick={() => navigate('/comunicacao/templates')} />
                <Button label="Salvar" icon="pi pi-save" className="p-button-sm" onClick={onSave} loading={saving} disabled={loading} />
              </div>
            </div>
          )}
        >
          <div className="grid">
            {/* Root */}
            <div className="col-12 md:col-6">
              <label className="block mb-1">Nome</label>
              <InputText className="w-full" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} />
            </div>

            <div className="col-12 md:col-4">
              <label className="block mb-1">Código</label>
              <InputText className="w-full" value={code} onChange={(e) => setCode(e.target.value)} disabled={loading} />
            </div>

            <div className="col-12 md:col-2">
              <label className="block mb-1">Ativo</label>
              <div className="flex align-items-center gap-2" style={{ height: 38 }}>
                <Checkbox inputId="active" checked={!!active} onChange={(e) => setActive(!!e.checked)} disabled={loading} />
                <label htmlFor="active">{active ? 'Ativo' : 'Inativo'}</label>
              </div>
            </div>

            <div className="col-12 md:col-3">
              <label className="block mb-1">Canal</label>
              <Dropdown className="w-full" value={channel} options={channelOptions} onChange={(e) => setChannel(e.value)} disabled={loading} />
            </div>

            {/* Versions selector */}
            <div className="col-12 md:col-6">
              <label className="block mb-1">Versões</label>
              <div className="flex gap-2">
                <Dropdown
                  className="w-full"
                  value={selectedVersionId}
                  options={versionOptions}
                  onChange={(e) => setSelectedVersionId(e.value)}
                  placeholder={loading ? 'Carregando...' : 'Selecione uma versão'}
                  disabled={loading || !isEdit}
                />
                <Button
                  label="Carregar no editor"
                  icon="pi pi-download"
                  className="p-button-sm p-button-secondary"
                  onClick={onLoadSelectedVersionIntoEditor}
                  disabled={loading || !selectedVersionId}
                />
              </div>
              <small className="block mt-2" style={{ opacity: 0.7 }}>
                A versão marcada como “atual” é a que o template usa por padrão. Você pode carregar outra versão no editor e salvar.
              </small>
            </div>

            <div className="col-12 md:col-3">
              <label className="block mb-1">Assunto (apenas email)</label>
              <InputText
                className="w-full"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={loading || channel !== 'email'}
                placeholder={channel === 'email' ? 'Assunto do email' : 'Não usado neste canal'}
              />
            </div>

            <div className="col-12 md:col-12">
              <label className="block mb-1">Corpo</label>
              <InputTextarea className="w-full" rows={10} value={body} onChange={(e) => setBody(e.target.value)} disabled={loading} />
              <small className="block mt-2" style={{ opacity: 0.7 }}>
                Dica: email geralmente usa HTML no body; sms/whatsapp, texto simples.
              </small>
            </div>

            <div className="col-12 md:col-6">
              <label className="block mb-1">Variáveis (JSON)</label>
              <InputTextarea className="w-full" rows={12} value={variablesSchemaJson} onChange={(e) => setVariablesSchemaJson(e.target.value)} />
            </div>

            <div className="col-12 md:col-6">
              <label className="block mb-1">meta (JSON) • template</label>
              <InputTextarea className="w-full" rows={12} value={metaJson} onChange={(e) => setMetaJson(e.target.value)} />
            </div>

            <div className="col-12">
              <Divider />
            </div>

            <div className="col-12 md:col-6">
              <div className="flex align-items-center justify-content-between mb-1">
                <label className="block">Preview vars (JSON)</label>
                <Button label="Preview" icon="pi pi-eye" className="p-button-sm" onClick={onPreview} disabled={loading} />
              </div>
              <InputTextarea className="w-full" rows={10} value={previewVarsJson} onChange={(e) => setPreviewVarsJson(e.target.value)} />
            </div>

            <div className="col-12 md:col-6">
              <label className="block mb-1">Resultado preview</label>
              <JsonViewer value={previewResult} />
            </div>

            {/* Debug/inspeção opcional da versão selecionada */}
            {isEdit && (
              <div className="col-12">
                <label className="block mb-1">Versão selecionada (debug)</label>
                <JsonViewer value={selectedVersion} />
              </div>
            )}
          </div>
        </Panel>
      </div>
    </SakaiLayout>
  );
}
