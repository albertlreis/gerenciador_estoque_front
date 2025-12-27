import React, { useEffect, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { useFinanceiroCatalogos } from '../../hooks/useFinanceiroCatalogos';

export default function LancamentosFiltro({ filtros, setFiltros, onBuscar }) {
  const [local, setLocal] = useState(filtros);

  const { loadCategorias, loadContas } = useFinanceiroCatalogos();
  const [categorias, setCategorias] = useState([]);
  const [contas, setContas] = useState([]);

  useEffect(() => setLocal(filtros), [filtros]);

  const tipos = [
    { label: 'Receita', value: 'RECEITA' },
    { label: 'Despesa', value: 'DESPESA' },
  ];

  const status = [
    { label: 'Confirmado', value: 'CONFIRMADO' },
    { label: 'Cancelado', value: 'CANCELADO' },
  ];

  useEffect(() => {
    (async () => setContas(await loadContas()))();
    // eslint-disable-next-line
  }, []);

  // Carrega categorias quando muda tipo (para limitar ao tipo selecionado)
  useEffect(() => {
    (async () => {
      // seu hook aceita tipo=... e repassa pro back
      // aqui mandamos RECEITA/DESPESA; se seu back ainda espera minúsculo,
      // ajuste no back (recomendado) ou converta aqui.
      setCategorias(await loadCategorias({ tipo: local?.tipo || undefined }));
    })();
    // eslint-disable-next-line
  }, [local?.tipo]);

  const aplicar = () => {
    setFiltros(local);
    onBuscar?.(local);
  };

  const limpar = () => {
    const clean = {
      q: '',
      tipo: null,
      status: null,
      categoria_id: null,
      conta_id: null,
      periodo: null,
      order_by: 'data_movimento',
      order_dir: 'desc',
      per_page: 25,
    };
    setLocal(clean);
    setFiltros(clean);
    onBuscar?.(clean);
  };

  return (
    <div className="flex flex-wrap gap-2 align-items-end">
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          value={local.q || ''}
          onChange={(e) => setLocal((s) => ({ ...s, q: e.target.value }))}
          placeholder="Buscar descrição/obs"
        />
      </span>

      <Dropdown
        value={local.tipo || null}
        options={tipos}
        onChange={(e) => setLocal((s) => ({ ...s, tipo: e.value, categoria_id: null }))}
        placeholder="Tipo"
        showClear
        className="w-12rem"
      />

      <Dropdown
        value={local.status || null}
        options={status}
        onChange={(e) => setLocal((s) => ({ ...s, status: e.value }))}
        placeholder="Status"
        showClear
        className="w-12rem"
      />

      <Dropdown
        value={local.categoria_id || null}
        options={categorias}
        onChange={(e) => setLocal((s) => ({ ...s, categoria_id: e.value }))}
        placeholder="Categoria"
        showClear
        filter
        className="w-16rem"
      />

      <Dropdown
        value={local.conta_id || null}
        options={contas}
        onChange={(e) => setLocal((s) => ({ ...s, conta_id: e.value }))}
        placeholder="Conta"
        showClear
        filter
        className="w-16rem"
      />

      <Calendar
        value={local.periodo || null}
        onChange={(e) => setLocal((s) => ({ ...s, periodo: e.value }))}
        selectionMode="range"
        readOnlyInput
        placeholder="Período (movimento)"
        dateFormat="dd/mm/yy"
        className="w-20rem"
      />

      <Button icon="pi pi-search" label="Buscar" onClick={aplicar} />
      <Button icon="pi pi-times" label="Limpar" outlined onClick={limpar} />
    </div>
  );
}
