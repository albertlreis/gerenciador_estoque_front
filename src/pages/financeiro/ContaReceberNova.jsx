import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';

import SakaiLayout from '../../layouts/SakaiLayout';
import FinanceiroApi from '../../api/financeiroApi';
import { useFinanceiroCatalogos } from '../../hooks/useFinanceiroCatalogos';
import apiFinanceiro from '../../services/apiFinanceiro';

const formasRecebimento = [
  { label: 'PIX', value: 'PIX' },
  { label: 'Boleto', value: 'BOLETO' },
  { label: 'TED', value: 'TED' },
  { label: 'Dinheiro', value: 'DINHEIRO' },
  { label: 'Cartão', value: 'CARTAO' },
];

const toYmd = (d) => {
  if (!d) return null;
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export default function ContaReceberNova() {
  const toast = useRef(null);
  const navigate = useNavigate();

  const { loadCategorias } = useFinanceiroCatalogos();
  const [categoriaOpts, setCategoriaOpts] = useState([]);
  const [centroCustoOpts, setCentroCustoOpts] = useState([]);

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    pedido_id: '',
    descricao: '',
    numero_documento: '',
    data_emissao: null,
    data_vencimento: null,
    valor_bruto: 0,
    desconto: 0,
    juros: 0,
    multa: 0,
    forma_recebimento: '',
    categoria_id: null,
    centro_custo_id: null,
    observacoes: '',
  });

  useEffect(() => {
    (async () => {
      try {
        const cats = await loadCategorias({ tipo: 'receita', ativo: true, tree: false });
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
  }, []);

  const valorLiquido = useMemo(() => {
    const bruto = Number(form.valor_bruto || 0);
    const desconto = Number(form.desconto || 0);
    const juros = Number(form.juros || 0);
    const multa = Number(form.multa || 0);
    return Math.max(0, bruto - desconto + juros + multa);
  }, [form.valor_bruto, form.desconto, form.juros, form.multa]);

  const saldoAberto = useMemo(() => {
    return Math.max(0, valorLiquido);
  }, [valorLiquido]);

  const validate = () => {
    const next = {};
    if (!form.descricao?.trim()) next.descricao = 'Descrição é obrigatória.';
    if (!form.data_vencimento) next.data_vencimento = 'Data de vencimento é obrigatória.';
    if (form.data_emissao && form.data_vencimento) {
      const em = new Date(form.data_emissao);
      const ve = new Date(form.data_vencimento);
      if (ve < em) next.data_vencimento = 'Vencimento não pode ser anterior à emissão.';
    }
    if (Number(form.valor_bruto || 0) < 0) next.valor_bruto = 'Valor bruto não pode ser negativo.';
    if (Number(form.desconto || 0) < 0) next.desconto = 'Desconto não pode ser negativo.';
    if (Number(form.juros || 0) < 0) next.juros = 'Juros não pode ser negativo.';
    if (Number(form.multa || 0) < 0) next.multa = 'Multa não pode ser negativa.';
    return next;
  };

  const canSubmit = useMemo(() => Object.keys(validate()).length === 0, [
    form.descricao,
    form.data_emissao,
    form.data_vencimento,
    form.valor_bruto,
    form.desconto,
    form.juros,
    form.multa,
  ]);

  const onSubmit = async () => {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      toast.current?.show({ severity: 'warn', summary: 'Verifique os campos', detail: 'Existem campos inválidos.' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        pedido_id: form.pedido_id ? Number(form.pedido_id) : null,
        descricao: form.descricao?.trim(),
        numero_documento: form.numero_documento?.trim() || null,
        data_emissao: toYmd(form.data_emissao),
        data_vencimento: toYmd(form.data_vencimento),
        valor_bruto: Number(form.valor_bruto || 0),
        desconto: Number(form.desconto || 0),
        juros: Number(form.juros || 0),
        multa: Number(form.multa || 0),
        forma_recebimento: form.forma_recebimento || null,
        categoria_id: form.categoria_id || null,
        centro_custo_id: form.centro_custo_id || null,
        observacoes: form.observacoes?.trim() || null,
      };

      await FinanceiroApi.contasReceber.criar(payload);
      toast.current?.show({ severity: 'success', summary: 'Conta criada', detail: 'Conta a receber cadastrada.' });
      navigate('/financeiro/contas-receber');
    } catch (e) {
      const apiErrors = e?.response?.data?.errors || null;
      if (apiErrors) {
        const mapped = {};
        Object.keys(apiErrors).forEach((k) => { mapped[k] = apiErrors[k]?.[0] || 'Erro'; });
        setErrors(mapped);
      }
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: e?.response?.data?.message || e.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SakaiLayout>
      <Toast ref={toast} />

      <div className="p-4">
        <div className="flex align-items-center justify-content-between mb-3">
          <h2 className="m-0">Nova Conta a Receber</h2>
          <Button label="Voltar" icon="pi pi-arrow-left" outlined onClick={() => navigate('/financeiro/contas-receber')} />
        </div>

        <div className="grid p-fluid">
          <div className="col-12 md:col-3">
            <label className="block mb-1">Pedido (opcional)</label>
            <InputText
              value={form.pedido_id}
              onChange={(e) => setForm((s) => ({ ...s, pedido_id: e.target.value }))}
              placeholder="ID do pedido"
            />
          </div>

          <div className="col-12 md:col-9">
            <label className="block mb-1">Descrição *</label>
            <InputText
              className={errors.descricao ? 'p-invalid' : ''}
              value={form.descricao}
              onChange={(e) => setForm((s) => ({ ...s, descricao: e.target.value }))}
            />
            {errors.descricao && <small className="p-error">{errors.descricao}</small>}
          </div>

          <div className="col-12 md:col-4">
            <label className="block mb-1">Nº Documento</label>
            <InputText
              value={form.numero_documento}
              onChange={(e) => setForm((s) => ({ ...s, numero_documento: e.target.value }))}
            />
          </div>

          <div className="col-12 md:col-4">
            <label className="block mb-1">Data Emissão</label>
            <Calendar
              value={form.data_emissao}
              onChange={(e) => setForm((s) => ({ ...s, data_emissao: e.value }))}
              dateFormat="dd/mm/yy"
              showIcon
            />
          </div>

          <div className="col-12 md:col-4">
            <label className="block mb-1">Data Vencimento *</label>
            <Calendar
              className={errors.data_vencimento ? 'p-invalid' : ''}
              value={form.data_vencimento}
              onChange={(e) => setForm((s) => ({ ...s, data_vencimento: e.value }))}
              dateFormat="dd/mm/yy"
              showIcon
            />
            {errors.data_vencimento && <small className="p-error">{errors.data_vencimento}</small>}
          </div>

          <div className="col-12 md:col-3">
            <label className="block mb-1">Valor Bruto *</label>
            <InputNumber
              className={errors.valor_bruto ? 'p-invalid' : ''}
              value={form.valor_bruto}
              onValueChange={(e) => setForm((s) => ({ ...s, valor_bruto: e.value || 0 }))}
              mode="currency"
              currency="BRL"
              locale="pt-BR"
              min={0}
            />
            {errors.valor_bruto && <small className="p-error">{errors.valor_bruto}</small>}
          </div>

          <div className="col-12 md:col-3">
            <label className="block mb-1">Desconto</label>
            <InputNumber
              className={errors.desconto ? 'p-invalid' : ''}
              value={form.desconto}
              onValueChange={(e) => setForm((s) => ({ ...s, desconto: e.value || 0 }))}
              mode="currency"
              currency="BRL"
              locale="pt-BR"
              min={0}
            />
            {errors.desconto && <small className="p-error">{errors.desconto}</small>}
          </div>

          <div className="col-12 md:col-3">
            <label className="block mb-1">Juros</label>
            <InputNumber
              className={errors.juros ? 'p-invalid' : ''}
              value={form.juros}
              onValueChange={(e) => setForm((s) => ({ ...s, juros: e.value || 0 }))}
              mode="currency"
              currency="BRL"
              locale="pt-BR"
              min={0}
            />
            {errors.juros && <small className="p-error">{errors.juros}</small>}
          </div>

          <div className="col-12 md:col-3">
            <label className="block mb-1">Multa</label>
            <InputNumber
              className={errors.multa ? 'p-invalid' : ''}
              value={form.multa}
              onValueChange={(e) => setForm((s) => ({ ...s, multa: e.value || 0 }))}
              mode="currency"
              currency="BRL"
              locale="pt-BR"
              min={0}
            />
            {errors.multa && <small className="p-error">{errors.multa}</small>}
          </div>

          <div className="col-12 md:col-4">
            <label className="block mb-1">Forma de Recebimento</label>
            <Dropdown
              value={form.forma_recebimento || null}
              options={formasRecebimento}
              onChange={(e) => setForm((s) => ({ ...s, forma_recebimento: e.value || '' }))}
              placeholder="Selecione"
              showClear
            />
          </div>

          <div className="col-12 md:col-4">
            <label className="block mb-1">Categoria</label>
            <Dropdown
              value={form.categoria_id || null}
              options={categoriaOpts}
              onChange={(e) => setForm((s) => ({ ...s, categoria_id: e.value }))}
              placeholder="Selecione"
              showClear
              filter
            />
          </div>

          <div className="col-12 md:col-4">
            <label className="block mb-1">Centro de Custo</label>
            <Dropdown
              value={form.centro_custo_id || null}
              options={centroCustoOpts}
              onChange={(e) => setForm((s) => ({ ...s, centro_custo_id: e.value }))}
              placeholder="Selecione"
              showClear
              filter
            />
          </div>

          <div className="col-12 md:col-6">
            <div className="p-3 border-round surface-100">
              <div className="text-500 text-sm">Valor Líquido</div>
              <div className="text-xl font-bold">
                R$ {Number(valorLiquido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="col-12 md:col-6">
            <div className="p-3 border-round surface-100">
              <div className="text-500 text-sm">Saldo em Aberto</div>
              <div className="text-xl font-bold">
                R$ {Number(saldoAberto || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="col-12">
            <label className="block mb-1">Observações</label>
            <InputText
              value={form.observacoes}
              onChange={(e) => setForm((s) => ({ ...s, observacoes: e.target.value }))}
            />
          </div>

          <div className="col-12 flex justify-content-end gap-2 mt-2">
            <Button label="Salvar" icon="pi pi-check" onClick={onSubmit} loading={saving} disabled={!canSubmit} />
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={() => navigate('/financeiro/contas-receber')} />
          </div>
        </div>
      </div>
    </SakaiLayout>
  );
}
