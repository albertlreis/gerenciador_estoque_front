import React, { useEffect, useMemo, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { AutoComplete } from 'primereact/autocomplete';

import apiFinanceiro from '../../services/apiFinanceiro';
import { useFinanceiroCatalogos } from '../../hooks/useFinanceiroCatalogos';
import { useFornecedoresLookup } from '../../hooks/useFornecedoresLookup';

const tipoOpts = [
  { label: 'Fixa', value: 'FIXA' },
  { label: 'Variável', value: 'VARIAVEL' },
];

const freqOpts = [
  { label: 'Diária', value: 'DIARIA' },
  { label: 'Semanal', value: 'SEMANAL' },
  { label: 'Mensal', value: 'MENSAL' },
  { label: 'Anual', value: 'ANUAL' },
  { label: 'Personalizada', value: 'PERSONALIZADA' },
];

const statusOpts = [
  { label: 'Ativa', value: 'ATIVA' },
  { label: 'Pausada', value: 'PAUSADA' },
  { label: 'Cancelada', value: 'CANCELADA' },
];

const toYmd = (d) => {
  if (!d) return null;
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export default function DespesaRecorrenteFormDialog({ visible, onHide, onSaved, despesa }) {
  const isEdit = !!despesa?.id;

  const [saving, setSaving] = useState(false);

  // catálogo financeiro (já existente no seu projeto)
  const { loadCategorias } = useFinanceiroCatalogos();
  const [categoriaOpts, setCategoriaOpts] = useState([]);
  const [centroCustoOpts, setCentroCustoOpts] = useState([]);

  // fornecedores (autocomplete)
  const { search: searchFornecedores, loading: fornecedoresLoading } = useFornecedoresLookup();
  const [fornecedorSugestoes, setFornecedorSugestoes] = useState([]);

  // selection objects
  const [fornecedorSel, setFornecedorSel] = useState(null); // {label,value,raw}
  const [categoriaSel, setCategoriaSel] = useState(null);   // {label,value,raw}
  const [centroCustoSel, setCentroCustoSel] = useState(null); // {label,value,raw}

  const [form, setForm] = useState({
    fornecedor_id: null,
    descricao: '',
    numero_documento: '',

    categoria_id: null,
    centro_custo_id: null,

    tipo: 'FIXA',
    frequencia: 'MENSAL',
    intervalo: 1,
    dia_vencimento: 10,
    mes_vencimento: null,

    valor_bruto: 0,
    desconto: 0,
    juros: 0,
    multa: 0,

    data_inicio: new Date(),
    data_fim: null,

    dias_antecedencia: 0,
    criar_conta_pagar_auto: true,
    status: 'ATIVA',
    observacoes: '',
  });

  // carregar catálogo quando abrir
  useEffect(() => {
    if (!visible) return;

    (async () => {
      try {
        const cats = await loadCategorias({ tipo: 'despesa' }); // se sua API filtrar por tipo
        setCategoriaOpts(cats || []);
      } catch {
        setCategoriaOpts([]);
      }
      try {
        const res = await apiFinanceiro.get('/financeiro/centros-custo', { params: { ativo: true } });
        const list = res?.data?.data || [];
        setCentroCustoOpts(list.map((c) => ({ label: c.nome, value: c.id, raw: c })));
      } catch {
        setCentroCustoOpts([]);
      }
    })();
    // eslint-disable-next-line
  }, [visible]);

  // preencher form no edit
  useEffect(() => {
    if (!visible) return;

    if (!isEdit) {
      setFornecedorSel(null);
      setCategoriaSel(null);
      setCentroCustoSel(null);
      return;
    }

    setForm((s) => ({
      ...s,
      ...despesa,
      data_inicio: despesa?.data_inicio ? new Date(despesa.data_inicio) : new Date(),
      data_fim: despesa?.data_fim ? new Date(despesa.data_fim) : null,
    }));

    // tentar mapear categoria/centro de custo por id
    if (despesa?.categoria_id && categoriaOpts?.length) {
      const found = categoriaOpts.find((o) => o?.value === despesa.categoria_id);
      setCategoriaSel(found || null);
    }
    if (despesa?.centro_custo_id && centroCustoOpts?.length) {
      const found = centroCustoOpts.find((o) => o?.value === despesa.centro_custo_id);
      setCentroCustoSel(found || null);
    }

    // fornecedor (se vier fornecedor carregado)
    if (despesa?.fornecedor?.id) {
      setFornecedorSel({ label: despesa.fornecedor.nome, value: despesa.fornecedor.id, raw: despesa.fornecedor });
    } else if (despesa?.fornecedor_id) {
      // fallback sem nome
      setFornecedorSel({ label: `#${despesa.fornecedor_id}`, value: despesa.fornecedor_id, raw: null });
    }
    // eslint-disable-next-line
  }, [visible, isEdit, despesa, categoriaOpts, centroCustoOpts]);

  const footer = useMemo(() => (
    <div className="flex gap-2 justify-content-end">
      <Button label="Cancelar" outlined onClick={onHide} disabled={saving} />
      <Button
        label={isEdit ? 'Salvar' : 'Criar'}
        icon="pi pi-check"
        onClick={async () => {
          setSaving(true);
          try {
            const payload = {
              ...form,
              fornecedor_id: fornecedorSel?.value || null,

              // persistindo nome (compatível com back atual)
              categoria_id: categoriaSel?.value || null,
              centro_custo_id: centroCustoSel?.value || null,

              data_inicio: toYmd(form.data_inicio),
              data_fim: toYmd(form.data_fim),
            };

            if (isEdit) {
              await apiFinanceiro.put(`/financeiro/despesas-recorrentes/${despesa.id}`, payload);
            } else {
              await apiFinanceiro.post(`/financeiro/despesas-recorrentes`, payload);
            }

            onHide();
            await onSaved?.();
          } finally {
            setSaving(false);
          }
        }}
        disabled={saving}
      />
    </div>
  ), [form, saving, isEdit, despesa, onHide, onSaved, fornecedorSel, categoriaSel, centroCustoSel]);

  return (
    <Dialog
      header={isEdit ? `Editar Despesa Recorrente #${despesa.id}` : 'Nova Despesa Recorrente'}
      visible={visible}
      style={{ width: '980px', maxWidth: '95vw' }}
      onHide={onHide}
      footer={footer}
      modal
    >
      <div className="grid">
        <div className="col-12 md:col-8">
          <label className="block mb-1">Descrição</label>
          <InputText
            className="w-full"
            value={form.descricao}
            onChange={(e) => setForm((s) => ({ ...s, descricao: e.target.value }))}
          />
        </div>

        <div className="col-12 md:col-4">
          <label className="block mb-1">Status</label>
          <Dropdown
            className="w-full"
            value={form.status}
            options={statusOpts}
            onChange={(e) => setForm((s) => ({ ...s, status: e.value }))}
          />
        </div>

        <div className="col-12 md:col-6">
          <label className="block mb-1">Fornecedor</label>
          <AutoComplete
            className="w-full"
            value={fornecedorSel}
            suggestions={fornecedorSugestoes}
            completeMethod={async (e) => {
              const list = await searchFornecedores(e.query);
              setFornecedorSugestoes(list || []);
            }}
            field="label"
            dropdown
            forceSelection
            loading={fornecedoresLoading}
            onChange={(e) => setFornecedorSel(e.value)}
            placeholder="Digite para buscar..."
          />
          <small className="text-600">Busca em /fornecedores (top 15).</small>
        </div>

        <div className="col-12 md:col-3">
          <label className="block mb-1">Categoria Financeira</label>
          <Dropdown
            className="w-full"
            value={categoriaSel}
            options={categoriaOpts}
            onChange={(e) => setCategoriaSel(e.value)}
            optionLabel="label"
            placeholder="Selecione"
            showClear
            filter
          />
        </div>

        <div className="col-12 md:col-3">
          <label className="block mb-1">Centro de Custo</label>
          <Dropdown
            className="w-full"
            value={centroCustoSel}
            options={centroCustoOpts}
            onChange={(e) => setCentroCustoSel(e.value)}
            optionLabel="label"
            placeholder="Selecione"
            showClear
            filter
          />
        </div>

        <div className="col-12 md:col-4">
          <label className="block mb-1">Número documento</label>
          <InputText
            className="w-full"
            value={form.numero_documento || ''}
            onChange={(e) => setForm((s) => ({ ...s, numero_documento: e.target.value }))}
          />
        </div>

        <div className="col-12 md:col-4">
          <label className="block mb-1">Tipo</label>
          <Dropdown className="w-full" value={form.tipo} options={tipoOpts}
                    onChange={(e) => setForm((s) => ({ ...s, tipo: e.value }))} />
        </div>

        <div className="col-12 md:col-4">
          <label className="block mb-1">Frequência</label>
          <Dropdown className="w-full" value={form.frequencia} options={freqOpts}
                    onChange={(e) => setForm((s) => ({ ...s, frequencia: e.value }))} />
        </div>

        <div className="col-12 md:col-2">
          <label className="block mb-1">Intervalo</label>
          <InputNumber className="w-full" value={form.intervalo}
                       onValueChange={(e) => setForm((s) => ({ ...s, intervalo: e.value || 1 }))}
                       min={1} max={365} />
        </div>

        <div className="col-12 md:col-2">
          <label className="block mb-1">Dia venc.</label>
          <InputNumber className="w-full" value={form.dia_vencimento}
                       onValueChange={(e) => setForm((s) => ({ ...s, dia_vencimento: e.value }))}
                       min={1} max={31} />
        </div>

        <div className="col-12 md:col-2">
          <label className="block mb-1">Mês venc. (anual)</label>
          <InputNumber className="w-full" value={form.mes_vencimento}
                       onValueChange={(e) => setForm((s) => ({ ...s, mes_vencimento: e.value }))}
                       min={1} max={12} />
        </div>

        <div className="col-12 md:col-3">
          <label className="block mb-1">Valor bruto</label>
          <InputNumber className="w-full" value={form.valor_bruto}
                       onValueChange={(e) => setForm((s) => ({ ...s, valor_bruto: e.value }))}
                       min={0} mode="decimal" minFractionDigits={2} maxFractionDigits={2}
                       disabled={form.tipo === 'VARIAVEL'} />
          {form.tipo === 'VARIAVEL' && <small className="text-600">Tipo variável: informar ao executar.</small>}
        </div>

        <div className="col-12 md:col-3">
          <label className="block mb-1">Data início</label>
          <Calendar className="w-full" value={form.data_inicio}
                    onChange={(e) => setForm((s) => ({ ...s, data_inicio: e.value }))}
                    dateFormat="dd/mm/yy" showIcon />
        </div>

        <div className="col-12 md:col-3">
          <label className="block mb-1">Data fim</label>
          <Calendar className="w-full" value={form.data_fim}
                    onChange={(e) => setForm((s) => ({ ...s, data_fim: e.value }))}
                    dateFormat="dd/mm/yy" showIcon />
        </div>

        <div className="col-12 md:col-3">
          <label className="block mb-1">Dias antecedência</label>
          <InputNumber className="w-full" value={form.dias_antecedencia}
                       onValueChange={(e) => setForm((s) => ({ ...s, dias_antecedencia: e.value || 0 }))}
                       min={0} max={365} />
        </div>

        <div className="col-12 md:col-12 flex align-items-center gap-2">
          <input
            type="checkbox"
            checked={!!form.criar_conta_pagar_auto}
            onChange={(e) => setForm((s) => ({ ...s, criar_conta_pagar_auto: e.target.checked }))}
          />
          <label>Gerar Conta a Pagar automaticamente</label>
        </div>
      </div>
    </Dialog>
  );
}
