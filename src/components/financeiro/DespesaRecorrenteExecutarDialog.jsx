import React, { useEffect, useMemo, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';

import apiFinanceiro from '../../services/apiFinanceiro';
import { useFinanceiroCatalogos } from '../../hooks/useFinanceiroCatalogos';

const toYmd = (d) => {
  if (!d) return null;
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export default function DespesaRecorrenteExecutarDialog({ visible, onHide, onExecuted, despesa }) {
  const [saving, setSaving] = useState(false);
  const [competencia, setCompetencia] = useState(new Date());
  const [dataVenc, setDataVenc] = useState(null);
  const [valor, setValor] = useState(null);
  const [categoriaId, setCategoriaId] = useState(null);
  const [centroCustoId, setCentroCustoId] = useState(null);

  const { loadCategorias } = useFinanceiroCatalogos();
  const [categoriaOpts, setCategoriaOpts] = useState([]);
  const [centroCustoOpts, setCentroCustoOpts] = useState([]);

  useEffect(() => {
    if (!visible) return;

    (async () => {
      try {
        const cats = await loadCategorias({ tipo: 'despesa', ativo: true, tree: false });
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

    setCategoriaId(null);
    setCentroCustoId(null);
  }, [visible]);

  const footer = useMemo(() => (
    <div className="flex gap-2 justify-content-end">
      <Button label="Cancelar" outlined onClick={onHide} disabled={saving} />
      <Button
        label="Gerar Conta a Pagar"
        icon="pi pi-check"
        onClick={async () => {
          setSaving(true);
          try {
            const payload = {
              competencia: toYmd(competencia),
              data_vencimento: dataVenc ? toYmd(dataVenc) : null,
              valor_bruto: valor ?? null,
              categoria_id: categoriaId || null,
              centro_custo_id: centroCustoId || null,
            };
            await apiFinanceiro.post(`/financeiro/despesas-recorrentes/${despesa.id}/executar`, payload);
            onHide();
            await onExecuted?.();
          } finally {
            setSaving(false);
          }
        }}
        disabled={saving}
      />
    </div>
  ), [saving, competencia, dataVenc, valor, despesa, onHide, onExecuted]);

  return (
    <Dialog
      header={`Executar Despesa Recorrente #${despesa?.id}`}
      visible={visible}
      style={{ width: '560px', maxWidth: '95vw' }}
      onHide={onHide}
      footer={footer}
      modal
    >
      <div className="grid">
        <div className="col-12">
          <div className="p-3 surface-100 border-round">
            <div className="text-lg font-medium">{despesa?.descricao}</div>
            <div className="text-600 text-sm">
              Tipo: {despesa?.tipo} • Frequência: {despesa?.frequencia}
            </div>
            <div className="text-600 text-sm">
              Valor padrão: {Number(despesa?.valor_bruto || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="col-12">
          <label className="block mb-1">Competência (mês)</label>
          <Calendar
            view="month"
            dateFormat="mm/yy"
            value={competencia}
            onChange={(e) => setCompetencia(e.value)}
            showIcon
            className="w-full"
          />
        </div>

        <div className="col-12">
          <label className="block mb-1">Data de vencimento (opcional)</label>
          <Calendar
            value={dataVenc}
            onChange={(e) => setDataVenc(e.value)}
            dateFormat="dd/mm/yy"
            showIcon
            className="w-full"
          />
          <small className="text-600">Se não informar, o sistema calcula com base no dia de vencimento da recorrência.</small>
        </div>

        <div className="col-12">
          <label className="block mb-1">Valor bruto (obrigatório se variável)</label>
          <InputNumber
            className="w-full"
            value={valor}
            onValueChange={(e) => setValor(e.value)}
            min={0}
            mode="decimal"
            minFractionDigits={2}
            maxFractionDigits={2}
          />
        </div>

        <div className="col-12 md:col-6">
          <label className="block mb-1">Categoria (override)</label>
          <Dropdown
            className="w-full"
            value={categoriaId}
            options={categoriaOpts}
            onChange={(e) => setCategoriaId(e.value)}
            placeholder="Manter da recorrência"
            showClear
            filter
          />
        </div>

        <div className="col-12 md:col-6">
          <label className="block mb-1">Centro de custo (override)</label>
          <Dropdown
            className="w-full"
            value={centroCustoId}
            options={centroCustoOpts}
            onChange={(e) => setCentroCustoId(e.value)}
            placeholder="Manter da recorrência"
            showClear
            filter
          />
        </div>
      </div>
    </Dialog>
  );
}
