import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';

import SakaiLayout from '../layouts/SakaiLayout';
import {
  atualizarAviso,
  criarAviso,
  listarAvisos,
  marcarAvisoComoLido,
  removerAviso,
} from '../services/avisosService';
import { useDebouncedCallback } from '../hooks/useDebouncedCallback';
import usePermissions from '../hooks/usePermissions';
import { PERMISSOES } from '../constants/permissoes';

const STATUS_OPTIONS = [
  { label: 'Ativos', value: 'ativos' },
  { label: 'Arquivados', value: 'arquivado' },
  { label: 'Todos', value: 'todos' },
];

const PRIORIDADE_OPTIONS = [
  { label: 'Normal', value: 'normal' },
  { label: 'Importante', value: 'importante' },
];

const STATUS_FORM_OPTIONS = [
  { label: 'Rascunho', value: 'rascunho' },
  { label: 'Publicado', value: 'publicado' },
  { label: 'Arquivado', value: 'arquivado' },
];

const FORM_INICIAL = {
  titulo: '',
  conteudo: '',
  prioridade: 'normal',
  pinned: false,
  publicar_em: null,
  expirar_em: null,
  status: 'rascunho',
};

export default function MuralAvisos() {
  const toast = useRef(null);
  const { has } = usePermissions();
  const podeGerenciar = has(PERMISSOES.AVISOS.GERENCIAR);

  const [loading, setLoading] = useState(false);
  const [lista, setLista] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lazy, setLazy] = useState({ first: 0, rows: 10 });
  const [filtroStatus, setFiltroStatus] = useState('ativos');
  const [search, setSearch] = useState('');
  const [searchAplicado, setSearchAplicado] = useState('');
  const [avisoSelecionado, setAvisoSelecionado] = useState(null);
  const [dialogFormVisible, setDialogFormVisible] = useState(false);
  const [form, setForm] = useState(FORM_INICIAL);
  const [editandoId, setEditandoId] = useState(null);
  const [saving, setSaving] = useState(false);

  const debouncedSearch = useDebouncedCallback((q) => {
    setLazy((prev) => ({ ...prev, first: 0 }));
    setSearchAplicado(q || '');
  }, 400);

  const parametrosConsulta = useMemo(() => {
    const page = Math.floor(lazy.first / lazy.rows) + 1;
    const params = {
      page,
      per_page: lazy.rows,
      search: searchAplicado || undefined,
    };

    if (filtroStatus === 'arquivado') {
      params.status = 'arquivado';
      params.ativos = 0;
    } else if (filtroStatus === 'todos') {
      params.ativos = 0;
    } else {
      params.ativos = 1;
    }

    return params;
  }, [filtroStatus, lazy.first, lazy.rows, searchAplicado]);

  const carregarAvisos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await listarAvisos(parametrosConsulta);
      const dados = response?.data?.data ?? [];
      const meta = response?.data?.meta ?? {};
      setLista(Array.isArray(dados) ? dados : []);
      setTotalRecords(Number(meta.total || 0));
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: error?.response?.data?.message || 'Nao foi possivel carregar os avisos.',
      });
      setLista([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, [parametrosConsulta]);

  useEffect(() => {
    carregarAvisos();
  }, [carregarAvisos]);

  const abrirAviso = async (aviso) => {
    setAvisoSelecionado(aviso);
    if (!aviso?.lido) {
      try {
        await marcarAvisoComoLido(aviso.id);
        await carregarAvisos();
      } catch (_) {
        // não bloqueia leitura do conteúdo
      }
    }
  };

  const abrirNovo = () => {
    setEditandoId(null);
    setForm(FORM_INICIAL);
    setDialogFormVisible(true);
  };

  const abrirEdicao = (aviso) => {
    setEditandoId(aviso.id);
    setForm({
      titulo: aviso.titulo || '',
      conteudo: aviso.conteudo || '',
      prioridade: aviso.prioridade || 'normal',
      pinned: Boolean(aviso.pinned),
      publicar_em: aviso.publicar_em ? new Date(aviso.publicar_em) : null,
      expirar_em: aviso.expirar_em ? new Date(aviso.expirar_em) : null,
      status: aviso.status || 'rascunho',
    });
    setDialogFormVisible(true);
  };

  const salvarForm = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        publicar_em: form.publicar_em ? form.publicar_em.toISOString() : null,
        expirar_em: form.expirar_em ? form.expirar_em.toISOString() : null,
      };

      if (editandoId) {
        await atualizarAviso(editandoId, payload);
      } else {
        await criarAviso(payload);
      }

      toast.current?.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: editandoId ? 'Aviso atualizado.' : 'Aviso criado.',
      });

      setDialogFormVisible(false);
      await carregarAvisos();
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: error?.response?.data?.message || 'Nao foi possivel salvar o aviso.',
      });
    } finally {
      setSaving(false);
    }
  };

  const arquivarAviso = async (id) => {
    try {
      await removerAviso(id);
      toast.current?.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Aviso arquivado.',
      });
      await carregarAvisos();
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: error?.response?.data?.message || 'Nao foi possivel arquivar o aviso.',
      });
    }
  };

  return (
    <SakaiLayout>
      <Toast ref={toast} />
      <div className="p-4">
        <div className="flex justify-content-between align-items-center mb-3">
          <h2 className="m-0">Mural de Avisos</h2>
          <div className="flex gap-2">
            <Button icon="pi pi-refresh" outlined onClick={carregarAvisos} loading={loading} />
            {podeGerenciar && (
              <Button label="Novo aviso" icon="pi pi-plus" onClick={abrirNovo} />
            )}
          </div>
        </div>

        <div className="surface-100 border-round p-3 mb-3">
          <div className="grid formgrid">
            <div className="field col-12 md:col-3">
              <label htmlFor="filtro-status">Filtro</label>
              <Dropdown
                id="filtro-status"
                value={filtroStatus}
                options={STATUS_OPTIONS}
                onChange={(e) => {
                  setFiltroStatus(e.value);
                  setLazy((prev) => ({ ...prev, first: 0 }));
                }}
                className="w-full"
              />
            </div>
            <div className="field col-12 md:col-9">
              <label htmlFor="filtro-search">Busca</label>
              <InputText
                id="filtro-search"
                value={search}
                onChange={(e) => {
                  const next = e.target.value;
                  setSearch(next);
                  debouncedSearch(next);
                }}
                placeholder="Buscar por titulo ou conteudo"
              />
            </div>
          </div>
        </div>

        <DataTable
          value={lista}
          loading={loading}
          dataKey="id"
          paginator
          lazy
          rows={lazy.rows}
          first={lazy.first}
          totalRecords={totalRecords}
          onPage={(e) => setLazy({ first: e.first, rows: e.rows })}
          rowsPerPageOptions={[10, 20, 50]}
          responsiveLayout="scroll"
          emptyMessage="Nenhum aviso encontrado."
        >
          <Column
            header="Status"
            body={(row) => (
              <div className="flex gap-2">
                {!row.lido && <Tag value="Nao lido" severity="warning" />}
                <Tag value={row.status} severity={row.status === 'publicado' ? 'success' : 'secondary'} />
              </div>
            )}
            style={{ minWidth: '150px' }}
          />
          <Column field="titulo" header="Titulo" style={{ minWidth: '240px' }} />
          <Column field="prioridade" header="Prioridade" style={{ width: '130px' }} />
          <Column
            header="Publicacao"
            body={(row) => (row.publicar_em ? new Date(row.publicar_em).toLocaleString('pt-BR') : '-')}
            style={{ minWidth: '170px' }}
          />
          <Column
            header="Acoes"
            body={(row) => (
              <div className="flex gap-2">
                <Button
                  icon="pi pi-eye"
                  text
                  rounded
                  aria-label="Abrir aviso"
                  onClick={() => abrirAviso(row)}
                />
                {podeGerenciar && (
                  <>
                    <Button
                      icon="pi pi-pencil"
                      text
                      rounded
                      aria-label="Editar aviso"
                      onClick={() => abrirEdicao(row)}
                    />
                    {row.status !== 'arquivado' && (
                      <Button
                        icon="pi pi-folder"
                        text
                        rounded
                        severity="secondary"
                        aria-label="Arquivar aviso"
                        onClick={() => arquivarAviso(row.id)}
                      />
                    )}
                  </>
                )}
              </div>
            )}
            style={{ width: '150px' }}
          />
        </DataTable>
      </div>

      <Dialog
        header={avisoSelecionado?.titulo || 'Aviso'}
        visible={Boolean(avisoSelecionado)}
        style={{ width: '640px', maxWidth: '96vw' }}
        onHide={() => setAvisoSelecionado(null)}
        modal
      >
        <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
          {avisoSelecionado?.conteudo || '-'}
        </div>
      </Dialog>

      <Dialog
        header={editandoId ? 'Editar aviso' : 'Novo aviso'}
        visible={dialogFormVisible}
        style={{ width: '720px', maxWidth: '96vw' }}
        onHide={() => setDialogFormVisible(false)}
        modal
      >
        <div className="grid formgrid">
          <div className="field col-12">
            <label htmlFor="aviso-titulo">Titulo</label>
            <InputText
              id="aviso-titulo"
              value={form.titulo}
              onChange={(e) => setForm((prev) => ({ ...prev, titulo: e.target.value }))}
            />
          </div>
          <div className="field col-12">
            <label htmlFor="aviso-conteudo">Conteudo</label>
            <InputTextarea
              id="aviso-conteudo"
              rows={6}
              value={form.conteudo}
              onChange={(e) => setForm((prev) => ({ ...prev, conteudo: e.target.value }))}
            />
          </div>
          <div className="field col-12 md:col-4">
            <label htmlFor="aviso-prioridade">Prioridade</label>
            <Dropdown
              id="aviso-prioridade"
              value={form.prioridade}
              options={PRIORIDADE_OPTIONS}
              onChange={(e) => setForm((prev) => ({ ...prev, prioridade: e.value }))}
            />
          </div>
          <div className="field col-12 md:col-4">
            <label htmlFor="aviso-status">Status</label>
            <Dropdown
              id="aviso-status"
              value={form.status}
              options={STATUS_FORM_OPTIONS}
              onChange={(e) => setForm((prev) => ({ ...prev, status: e.value }))}
            />
          </div>
          <div className="field col-12 md:col-4">
            <label htmlFor="aviso-pinned">Fixado</label>
            <div className="mt-2">
              <InputSwitch
                id="aviso-pinned"
                checked={Boolean(form.pinned)}
                onChange={(e) => setForm((prev) => ({ ...prev, pinned: e.value }))}
              />
            </div>
          </div>
          <div className="field col-12 md:col-6">
            <label htmlFor="aviso-publicar">Publicar em</label>
            <Calendar
              id="aviso-publicar"
              value={form.publicar_em}
              onChange={(e) => setForm((prev) => ({ ...prev, publicar_em: e.value }))}
              showTime
              hourFormat="24"
              showIcon
              className="w-full"
            />
          </div>
          <div className="field col-12 md:col-6">
            <label htmlFor="aviso-expirar">Expirar em</label>
            <Calendar
              id="aviso-expirar"
              value={form.expirar_em}
              onChange={(e) => setForm((prev) => ({ ...prev, expirar_em: e.value }))}
              showTime
              hourFormat="24"
              showIcon
              className="w-full"
            />
          </div>
        </div>

        <div className="flex justify-content-end gap-2 mt-3">
          <Button
            label="Cancelar"
            outlined
            onClick={() => setDialogFormVisible(false)}
            disabled={saving}
          />
          <Button label="Salvar" onClick={salvarForm} loading={saving} />
        </div>
      </Dialog>
    </SakaiLayout>
  );
}

