import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Checkbox } from 'primereact/checkbox';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Paginator } from 'primereact/paginator';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import SakaiLayout from '../layouts/SakaiLayout';
import apiEstoque from '../services/apiEstoque';
import usePermissions from '../hooks/usePermissions';
import { PERMISSOES } from '../constants/permissoes';

const statusOptions = [
  { label: 'Todos', value: '' },
  { label: 'Rascunho', value: 'rascunho' },
  { label: 'Publicado', value: 'publicado' },
  { label: 'Arquivado', value: 'arquivado' },
];

const prioridadeOptions = [
  { label: 'Normal', value: 'normal' },
  { label: 'Importante', value: 'importante' },
];

const statusSeverity = {
  rascunho: 'warning',
  publicado: 'success',
  arquivado: 'secondary',
};

const emptyForm = {
  titulo: '',
  conteudo: '',
  prioridade: 'normal',
  pinned: false,
  status: 'rascunho',
  publicar_em: '',
  expirar_em: '',
};

const toDatetimeLocal = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const AvisosMural = () => {
  const toast = useRef(null);
  const { has } = usePermissions();
  const canManage = has(PERMISSOES.AVISOS.MANAGE);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [ativos, setAtivos] = useState(true);
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState(10);
  const [total, setTotal] = useState(0);

  const [detalhe, setDetalhe] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const filtros = useMemo(() => ({
    per_page: rows,
    page: page + 1,
    ativos: ativos ? 1 : 0,
    status: status || undefined,
    search: search || undefined,
  }), [rows, page, ativos, status, search]);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiEstoque.get('/avisos', { params: filtros });
      setItems(Array.isArray(data?.data) ? data.data : []);
      setTotal(Number(data?.total || 0));
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: err?.response?.data?.message || 'Falha ao carregar avisos.',
      });
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const abrirDetalhe = async (aviso) => {
    try {
      const { data } = await apiEstoque.get(`/avisos/${aviso.id}`);
      setDetalhe(data);
      if (!data?.lido) {
        await apiEstoque.post(`/avisos/${aviso.id}/ler`);
        carregar();
      }
    } catch (err) {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao abrir aviso.' });
    }
  };

  const abrirNovo = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setFormVisible(true);
  };

  const abrirEdicao = (aviso) => {
    setEditingId(aviso.id);
    setForm({
      titulo: aviso.titulo || '',
      conteudo: aviso.conteudo || '',
      prioridade: aviso.prioridade || 'normal',
      pinned: !!aviso.pinned,
      status: aviso.status || 'rascunho',
      publicar_em: toDatetimeLocal(aviso.publicar_em),
      expirar_em: toDatetimeLocal(aviso.expirar_em),
    });
    setFormVisible(true);
  };

  const salvar = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        publicar_em: form.publicar_em || null,
        expirar_em: form.expirar_em || null,
      };

      if (editingId) {
        await apiEstoque.patch(`/avisos/${editingId}`, payload);
      } else {
        await apiEstoque.post('/avisos', payload);
      }

      toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Aviso salvo.' });
      setFormVisible(false);
      carregar();
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: err?.response?.data?.message || 'Falha ao salvar aviso.',
      });
    } finally {
      setSaving(false);
    }
  };

  const arquivar = (aviso) => {
    confirmDialog({
      header: 'Arquivar aviso',
      message: `Deseja arquivar o aviso "${aviso.titulo}"?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Arquivar',
      rejectLabel: 'Cancelar',
      accept: async () => {
        try {
          await apiEstoque.delete(`/avisos/${aviso.id}`);
          toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Aviso arquivado.' });
          carregar();
        } catch (err) {
          toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível arquivar.' });
        }
      },
    });
  };

  return (
    <SakaiLayout>
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="p-4">
        <div className="flex justify-content-between align-items-center mb-3">
          <div>
            <h2 className="m-0">Mural de Avisos</h2>
            <small className="text-600">Comunicados internos com leitura por usuário.</small>
          </div>
          {canManage && (
            <Button label="Novo aviso" icon="pi pi-plus" onClick={abrirNovo} />
          )}
        </div>

        <div className="grid mb-3">
          <div className="col-12 md:col-4">
            <span className="p-input-icon-left w-full">
              <i className="pi pi-search" />
              <InputText
                value={search}
                onChange={(e) => {
                  setPage(0);
                  setSearch(e.target.value);
                }}
                placeholder="Buscar por título/conteúdo"
                className="w-full"
              />
            </span>
          </div>
          <div className="col-12 md:col-3">
            <Dropdown
              value={status}
              options={statusOptions}
              onChange={(e) => {
                setPage(0);
                setStatus(e.value || '');
              }}
              placeholder="Status"
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-3 flex align-items-center gap-2">
            <Checkbox
              inputId="somente-ativos"
              checked={ativos}
              onChange={(e) => {
                setPage(0);
                setAtivos(!!e.checked);
              }}
            />
            <label htmlFor="somente-ativos">Somente ativos</label>
          </div>
        </div>

        {loading && <p>Carregando avisos...</p>}

        {!loading && items.length === 0 && (
          <Card>
            <p className="m-0">Nenhum aviso encontrado.</p>
          </Card>
        )}

        {!loading && items.map((aviso) => (
          <Card key={aviso.id} className="mb-3">
            <div className="flex justify-content-between align-items-start gap-2">
              <div>
                <div className="flex align-items-center gap-2 mb-2">
                  <h4 className="m-0">{aviso.titulo}</h4>
                  {aviso.pinned && <Tag value="Fixado" severity="info" />}
                  <Tag value={aviso.prioridade} severity={aviso.prioridade === 'importante' ? 'danger' : 'secondary'} />
                  <Tag value={aviso.status} severity={statusSeverity[aviso.status] || 'secondary'} />
                  {!aviso.lido && <Tag value="Não lido" severity="warning" />}
                </div>
                <div className="text-700">{(aviso.conteudo || '').slice(0, 180)}{(aviso.conteudo || '').length > 180 ? '...' : ''}</div>
              </div>
              <div className="flex gap-2">
                <Button icon="pi pi-eye" className="p-button-text p-button-sm" onClick={() => abrirDetalhe(aviso)} />
                {canManage && (
                  <>
                    <Button icon="pi pi-pencil" className="p-button-text p-button-sm" onClick={() => abrirEdicao(aviso)} />
                    <Button icon="pi pi-archive" className="p-button-text p-button-sm p-button-warning" onClick={() => arquivar(aviso)} />
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}

        <Paginator
          first={page * rows}
          rows={rows}
          totalRecords={total}
          rowsPerPageOptions={[10, 20, 50]}
          onPageChange={(e) => {
            setPage(e.page);
            setRows(e.rows);
          }}
        />
      </div>

      <Dialog
        header={detalhe?.titulo || 'Aviso'}
        visible={!!detalhe}
        onHide={() => setDetalhe(null)}
        style={{ width: '760px' }}
      >
        {detalhe && (
          <div className="line-height-3 white-space-pre-wrap">
            <div className="mb-2 flex gap-2">
              <Tag value={detalhe.status} severity={statusSeverity[detalhe.status] || 'secondary'} />
              <Tag value={detalhe.prioridade} severity={detalhe.prioridade === 'importante' ? 'danger' : 'secondary'} />
              {detalhe.pinned && <Tag value="Fixado" severity="info" />}
            </div>
            {detalhe.conteudo}
          </div>
        )}
      </Dialog>

      <Dialog
        header={editingId ? 'Editar aviso' : 'Novo aviso'}
        visible={formVisible}
        onHide={() => setFormVisible(false)}
        style={{ width: '760px' }}
        footer={(
          <div className="flex justify-content-end gap-2">
            <Button label="Cancelar" className="p-button-text" onClick={() => setFormVisible(false)} />
            <Button label="Salvar" icon="pi pi-check" onClick={salvar} loading={saving} />
          </div>
        )}
      >
        <div className="grid">
          <div className="col-12">
            <label className="block mb-1">Título</label>
            <InputText className="w-full" value={form.titulo} onChange={(e) => setForm((s) => ({ ...s, titulo: e.target.value }))} />
          </div>

          <div className="col-12">
            <label className="block mb-1">Conteúdo</label>
            <InputTextarea rows={6} className="w-full" value={form.conteudo} onChange={(e) => setForm((s) => ({ ...s, conteudo: e.target.value }))} />
          </div>

          <div className="col-12 md:col-4">
            <label className="block mb-1">Prioridade</label>
            <Dropdown className="w-full" value={form.prioridade} options={prioridadeOptions} onChange={(e) => setForm((s) => ({ ...s, prioridade: e.value }))} />
          </div>

          <div className="col-12 md:col-4">
            <label className="block mb-1">Status</label>
            <Dropdown className="w-full" value={form.status} options={statusOptions.filter((x) => x.value)} onChange={(e) => setForm((s) => ({ ...s, status: e.value }))} />
          </div>

          <div className="col-12 md:col-4 flex align-items-end gap-2">
            <InputSwitch checked={form.pinned} onChange={(e) => setForm((s) => ({ ...s, pinned: !!e.value }))} />
            <span>Fixar no topo</span>
          </div>

          <div className="col-12 md:col-6">
            <label className="block mb-1">Publicar em</label>
            <InputText type="datetime-local" className="w-full" value={form.publicar_em} onChange={(e) => setForm((s) => ({ ...s, publicar_em: e.target.value }))} />
          </div>

          <div className="col-12 md:col-6">
            <label className="block mb-1">Expirar em</label>
            <InputText type="datetime-local" className="w-full" value={form.expirar_em} onChange={(e) => setForm((s) => ({ ...s, expirar_em: e.target.value }))} />
          </div>
        </div>
      </Dialog>
    </SakaiLayout>
  );
};

export default AvisosMural;
