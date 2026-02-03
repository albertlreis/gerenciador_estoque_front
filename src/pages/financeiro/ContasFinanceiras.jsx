import React, { useEffect, useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { InputSwitch } from 'primereact/inputswitch';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';

import SakaiLayout from '../../layouts/SakaiLayout';
import apiFinanceiro from '../../services/apiFinanceiro';

const empty = {
  nome: '',
  slug: '',
  tipo: 'banco',
  moeda: 'BRL',

  banco_nome: '',
  banco_codigo: '',
  agencia: '',
  agencia_dv: '',
  conta: '',
  conta_dv: '',
  titular_nome: '',
  titular_documento: '',
  chave_pix: '',

  saldo_inicial: null,
  observacoes: '',

  ativo: true,
  padrao: false,
};

export default function ContasFinanceiras() {
  const toast = useRef(null);

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

  const [q, setQ] = useState('');
  const [tipo, setTipo] = useState(null); // null = todos
  const [ativo, setAtivo] = useState(null); // null = todos

  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...empty });

  const tipoOptions = [
    { label: 'Banco', value: 'banco' },
    { label: 'Caixa', value: 'caixa' },
    { label: 'PIX', value: 'pix' },
    { label: 'Cartão', value: 'cartao' },
    { label: 'Investimento', value: 'investimento' },
    { label: 'Outros', value: 'outros' },
  ];

  const moedaOptions = [
    { label: 'BRL', value: 'BRL' },
    { label: 'USD', value: 'USD' },
    { label: 'EUR', value: 'EUR' },
  ];

  const load = async () => {
    setLoading(true);
    try {
      const params = {
        q: q || undefined,
        tipo: tipo || undefined,
        ativo: ativo === null ? undefined : ativo,
      };
      const res = await apiFinanceiro.get('/financeiro/contas-financeiras', { params });
      setItems(res?.data?.data || []);
    } catch (e) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: e?.response?.data?.message || e.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);

  const openNew = () => {
    setEditingId(null);
    setForm({ ...empty, tipo: tipo || 'banco' });
    setVisible(true);
  };

  const openEdit = async (row) => {
    try {
      setLoading(true);
      const res = await apiFinanceiro.get(`/financeiro/contas-financeiras/${row.id}`);
      const data = res?.data?.data || res?.data;

      setEditingId(row.id);
      setForm({
        nome: data?.nome || '',
        slug: data?.slug || '',
        tipo: data?.tipo || 'banco',
        moeda: data?.moeda || 'BRL',

        banco_nome: data?.banco_nome || '',
        banco_codigo: data?.banco_codigo || '',
        agencia: data?.agencia || '',
        agencia_dv: data?.agencia_dv || '',
        conta: data?.conta || '',
        conta_dv: data?.conta_dv || '',
        titular_nome: data?.titular_nome || '',
        titular_documento: data?.titular_documento || '',
        chave_pix: data?.chave_pix || '',

        saldo_inicial: data?.saldo_inicial !== null && data?.saldo_inicial !== undefined
          ? Number(data.saldo_inicial)
          : null,

        observacoes: data?.observacoes || '',

        ativo: data?.ativo ?? true,
        padrao: data?.padrao ?? false,
      });

      setVisible(true);
    } catch (e) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: e?.response?.data?.message || e.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const sanitizePayload = (p) => {
    const payload = { ...p };

    if (!payload.slug) delete payload.slug;

    // strings vazias -> null (para campos que você pode querer "limpar")
    const nullableStrings = [
      'banco_nome', 'banco_codigo', 'agencia', 'agencia_dv', 'conta', 'conta_dv',
      'titular_nome', 'titular_documento', 'chave_pix', 'observacoes',
    ];
    nullableStrings.forEach((k) => {
      if (payload[k] === '') payload[k] = null;
    });

    // normaliza moeda/tipo
    if (payload.moeda) payload.moeda = String(payload.moeda).toUpperCase();
    if (payload.tipo) payload.tipo = String(payload.tipo).toLowerCase();

    return payload;
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = sanitizePayload(form);

      if (editingId) {
        const res = await apiFinanceiro.put(`/financeiro/contas-financeiras/${editingId}`, payload);
        toast.current?.show({ severity: 'success', summary: 'OK', detail: res?.data?.message || 'Atualizado.' });
      } else {
        const res = await apiFinanceiro.post('/financeiro/contas-financeiras', payload);
        toast.current?.show({ severity: 'success', summary: 'OK', detail: res?.data?.message || 'Criado.' });
      }

      setVisible(false);
      await load();
    } catch (e) {
      const msg = e?.response?.data?.message || e.message;
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: msg });
    } finally {
      setSaving(false);
    }
  };

  const remove = (row) => {
    confirmDialog({
      message: `Remover "${row.nome}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Remover',
      rejectLabel: 'Cancelar',
      accept: async () => {
        try {
          const res = await apiFinanceiro.delete(`/financeiro/contas-financeiras/${row.id}`);
          toast.current?.show({ severity: 'success', summary: 'OK', detail: res?.data?.message || 'Removido.' });
          await load();
        } catch (e) {
          toast.current?.show({
            severity: 'error',
            summary: 'Erro',
            detail: e?.response?.data?.message || e.message,
          });
        }
      },
    });
  };

  const actions = (row) => (
    <div className="flex gap-2">
      <Button icon="pi pi-pencil" rounded text onClick={() => openEdit(row)} />
      <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => remove(row)} />
    </div>
  );

  return (
    <SakaiLayout>
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="p-4">
        <div className="flex flex-wrap gap-2 align-items-end mb-3">
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar..." />
          </span>

          <Dropdown
            value={tipo}
            onChange={(e) => setTipo(e.value)}
            options={[{ label: 'Todos', value: null }, ...tipoOptions]}
            placeholder="Tipo"
            className="w-14rem"
          />

          <Dropdown
            value={ativo}
            onChange={(e) => setAtivo(e.value)}
            options={[
              { label: 'Todos', value: null },
              { label: 'Ativos', value: true },
              { label: 'Inativos', value: false },
            ]}
            placeholder="Status"
            className="w-14rem"
          />

          <Button icon="pi pi-refresh" label="Filtrar" onClick={load} loading={loading} />
          <Button icon="pi pi-plus" label="Nova" onClick={openNew} />
        </div>

        <div className="p-3 border-round surface-0 shadow-1">
          <DataTable value={items} loading={loading} rowHover responsiveLayout="scroll" emptyMessage="Nenhum registro">
            <Column field="nome" header="Nome" />
            <Column field="tipo" header="Tipo" style={{ width: 160 }} />
            <Column field="moeda" header="Moeda" style={{ width: 110 }} />
            <Column header="Ativo" body={(r) => (r.ativo ? 'Sim' : 'Não')} style={{ width: 100 }} />
            <Column header="Padrão" body={(r) => (r.padrao ? 'Sim' : 'Não')} style={{ width: 110 }} />
            <Column header="Ações" body={actions} style={{ width: 140 }} />
          </DataTable>
        </div>

        <Dialog
          header={editingId ? 'Editar Conta Financeira' : 'Nova Conta Financeira'}
          visible={visible}
          style={{ width: '980px', maxWidth: '95vw' }}
          onHide={() => setVisible(false)}
          footer={
            <div className="flex justify-content-end gap-2">
              <Button label="Cancelar" icon="pi pi-times" outlined onClick={() => setVisible(false)} />
              <Button label="Salvar" icon="pi pi-check" onClick={save} loading={saving} />
            </div>
          }
        >
          <div className="grid">
            {/* Básico */}
            <div className="col-12">
              <div className="text-600 font-semibold mb-2">Dados básicos</div>
            </div>

            <div className="col-12 md:col-6">
              <label className="block text-500 text-sm mb-1">Nome</label>
              <InputText className="w-full" value={form.nome} onChange={(e) => setForm((s) => ({ ...s, nome: e.target.value }))} />
            </div>

            <div className="col-12 md:col-3">
              <label className="block text-500 text-sm mb-1">Tipo</label>
              <Dropdown
                className="w-full"
                value={form.tipo}
                onChange={(e) => setForm((s) => ({ ...s, tipo: e.value }))}
                options={tipoOptions}
                editable // permite digitar se quiser um tipo diferente
              />
            </div>

            <div className="col-12 md:col-3">
              <label className="block text-500 text-sm mb-1">Moeda</label>
              <Dropdown
                className="w-full"
                value={form.moeda}
                onChange={(e) => setForm((s) => ({ ...s, moeda: e.value }))}
                options={moedaOptions}
                editable
              />
            </div>

            <div className="col-12 md:col-4">
              <label className="block text-500 text-sm mb-1">Slug (opcional)</label>
              <InputText className="w-full" value={form.slug} onChange={(e) => setForm((s) => ({ ...s, slug: e.target.value }))} />
            </div>

            <div className="col-12 md:col-4">
              <label className="block text-500 text-sm mb-1">Saldo inicial</label>
              <InputNumber
                className="w-full"
                value={form.saldo_inicial}
                onValueChange={(e) => setForm((s) => ({ ...s, saldo_inicial: e.value }))}
                mode="decimal"
                minFractionDigits={2}
                maxFractionDigits={2}
              />
            </div>

            <div className="col-12 md:col-2">
              <div className="flex align-items-center gap-2 mt-4">
                <InputSwitch checked={!!form.ativo} onChange={(e) => setForm((s) => ({ ...s, ativo: e.value }))} />
                <span>Ativo</span>
              </div>
            </div>

            <div className="col-12 md:col-2">
              <div className="flex align-items-center gap-2 mt-4">
                <InputSwitch checked={!!form.padrao} onChange={(e) => setForm((s) => ({ ...s, padrao: e.value }))} />
                <span>Padrão</span>
              </div>
            </div>

            {/* Bancário */}
            <div className="col-12 mt-2">
              <div className="text-600 font-semibold mb-2">Dados bancários</div>
              <small className="text-500">
                Preencha conforme a conta for do tipo banco/PIX. Campos vazios serão enviados como <b>null</b>.
              </small>
            </div>

            <div className="col-12 md:col-6">
              <label className="block text-500 text-sm mb-1">Banco (nome)</label>
              <InputText
                className="w-full"
                value={form.banco_nome}
                onChange={(e) => setForm((s) => ({ ...s, banco_nome: e.target.value }))}
              />
            </div>

            <div className="col-12 md:col-2">
              <label className="block text-500 text-sm mb-1">Banco (código)</label>
              <InputText
                className="w-full"
                value={form.banco_codigo}
                onChange={(e) => setForm((s) => ({ ...s, banco_codigo: e.target.value }))}
              />
            </div>

            <div className="col-12 md:col-2">
              <label className="block text-500 text-sm mb-1">Agência</label>
              <InputText className="w-full" value={form.agencia} onChange={(e) => setForm((s) => ({ ...s, agencia: e.target.value }))} />
            </div>

            <div className="col-12 md:col-2">
              <label className="block text-500 text-sm mb-1">DV Agência</label>
              <InputText
                className="w-full"
                value={form.agencia_dv}
                onChange={(e) => setForm((s) => ({ ...s, agencia_dv: e.target.value }))}
              />
            </div>

            <div className="col-12 md:col-3">
              <label className="block text-500 text-sm mb-1">Conta</label>
              <InputText className="w-full" value={form.conta} onChange={(e) => setForm((s) => ({ ...s, conta: e.target.value }))} />
            </div>

            <div className="col-12 md:col-2">
              <label className="block text-500 text-sm mb-1">DV Conta</label>
              <InputText className="w-full" value={form.conta_dv} onChange={(e) => setForm((s) => ({ ...s, conta_dv: e.target.value }))} />
            </div>

            <div className="col-12 md:col-7">
              <label className="block text-500 text-sm mb-1">Titular (nome)</label>
              <InputText
                className="w-full"
                value={form.titular_nome}
                onChange={(e) => setForm((s) => ({ ...s, titular_nome: e.target.value }))}
              />
            </div>

            <div className="col-12 md:col-5">
              <label className="block text-500 text-sm mb-1">Titular (documento)</label>
              <InputText
                className="w-full"
                value={form.titular_documento}
                onChange={(e) => setForm((s) => ({ ...s, titular_documento: e.target.value }))}
              />
            </div>

            <div className="col-12">
              <label className="block text-500 text-sm mb-1">Chave PIX</label>
              <InputText
                className="w-full"
                value={form.chave_pix}
                onChange={(e) => setForm((s) => ({ ...s, chave_pix: e.target.value }))}
              />
            </div>

            {/* Observações */}
            <div className="col-12 mt-2">
              <div className="text-600 font-semibold mb-2">Observações</div>
            </div>

            <div className="col-12">
              <InputTextarea
                className="w-full"
                value={form.observacoes}
                onChange={(e) => setForm((s) => ({ ...s, observacoes: e.target.value }))}
                rows={4}
                autoResize
              />
            </div>
          </div>
        </Dialog>
      </div>
    </SakaiLayout>
  );
}
