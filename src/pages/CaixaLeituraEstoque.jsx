import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

import SakaiLayout from '../layouts/SakaiLayout';
import apiEstoque from '../services/apiEstoque';
import BarcodeScanner from '../components/BarcodeScanner';

const TIPO_OPCOES = [
  { label: 'Entrada', value: 'entrada' },
  { label: 'Saída', value: 'saida' },
];

export default function CaixaLeituraEstoque() {
  const toast = useRef(null);
  const inputRef = useRef(null);       // campo de leitura
  const qtdRef = useRef(null);         // qtd rápida

  const initialMode = new URLSearchParams(window.location.search).get('mode') === 'transfer'
    ? 'transfer'
    : 'normal';

  const [mode, setMode] = useState(initialMode); // 'normal' | 'transfer'
  const [tipo, setTipo] = useState('entrada');

  const [depositos, setDepositos] = useState([]);
  const [depositoId, setDepositoId] = useState(null);
  const [origemId, setOrigemId] = useState(null);
  const [destinoId, setDestinoId] = useState(null);

  const [codigo, setCodigo] = useState('');
  const [loadingScan, setLoadingScan] = useState(false);

  const [useCamera, setUseCamera] = useState(false);
  const [continuousCamera, setContinuousCamera] = useState(true);

  const [qtdRapida, setQtdRapida] = useState(1);
  const [autoResetQtd, setAutoResetQtd] = useState(true);

  const [itens, setItens] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [lastScan, setLastScan] = useState(null);

  const [showBulk, setShowBulk] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);

  const [focusPaused, setFocusPaused] = useState(false);
  const qtdFocusedRef = useRef(false);

  const totalPecas = useMemo(() => itens.reduce((acc, it) => acc + it.quantidade, 0), [itens]);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiEstoque.get('/depositos');
        const dd = res.data.map(d => ({ label: d.nome, value: d.id }));
        setDepositos(dd);
        if (!depositoId && dd.length) setDepositoId(dd[0].value);
        if (!origemId && dd.length) setOrigemId(dd[0].value);
        if (!destinoId && dd.length > 1) setDestinoId(dd[1].value);
      } catch {
        toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar depósitos' });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Foco inteligente
  useEffect(() => {
    const id = setInterval(() => {
      if (focusPaused || showBulk || qtdFocusedRef.current) return;
      const active = document.activeElement;
      const isTyping = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
      if (isTyping) return;
      inputRef.current?.focus?.();
    }, 1200);
    return () => clearInterval(id);
  }, [focusPaused, showBulk]);

  useEffect(() => {
    if (showBulk) {
      setFocusPaused(true);
    } else {
      setFocusPaused(false);
      setTimeout(() => inputRef.current?.focus?.(), 100);
    }
  }, [showBulk]);

  // Atalhos
  useEffect(() => {
    const onKey = (ev) => {
      if (mode === 'normal' && ev.key === 'F2') { ev.preventDefault(); setTipo(t => (t === 'entrada' ? 'saida' : 'entrada')); }
      if (ev.key === 'F3') { ev.preventDefault(); setMode(m => (m === 'transfer' ? 'normal' : 'transfer')); }
      if (ev.key === 'F4') { ev.preventDefault(); askClearAll(); }
      if (ev.key === 'F6' || ev.key === 'F7') { ev.preventDefault(); qtdRef.current?.focus?.(); }
      if (ev.shiftKey && ev.key === 'F7') { ev.preventDefault(); setQtdRapida(1); }
      if (ev.key === 'F8') { ev.preventDefault(); setUseCamera(u => !u); }
      if (ev.key === 'F9') { ev.preventDefault(); finalizar(); }
      if (ev.ctrlKey && (ev.key === 'z' || ev.key === 'Z')) { ev.preventDefault(); desfazer(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mode, itens, tipo, origemId, destinoId, depositoId, historico]);

  const beep = () => { try { new Audio('/beep.mp3').play().catch(() => {}); } catch {} };

  // Helpers
  const adicionarItem = (item, quantidade = 1) => {
    setItens(prev => {
      const idx = prev.findIndex(p => p.variacao_id === item.variacao_id);
      if (idx >= 0) {
        const clone = [...prev];
        clone[idx] = { ...clone[idx], quantidade: clone[idx].quantidade + quantidade };
        return clone;
      }
      return [...prev, { ...item, quantidade }];
    });
  };
  const alterarQuantidade = (variacao_id, delta) => {
    setItens(prev => {
      const idx = prev.findIndex(p => p.variacao_id === variacao_id);
      if (idx < 0) return prev;
      const novo = [...prev];
      const q = (novo[idx].quantidade || 1) + delta;
      if (q <= 0) novo.splice(idx, 1);
      else novo[idx] = { ...novo[idx], quantidade: q };
      return novo;
    });
  };
  const setQuantidade = (variacao_id, value) => {
    setItens(prev => prev.map(i => i.variacao_id === variacao_id ? { ...i, quantidade: Math.max(1, value || 1) } : i));
  };
  const removerItem = (variacao_id) => setItens(prev => prev.filter(p => p.variacao_id !== variacao_id));
  const desfazer = () => {
    if (!historico.length) return;
    const last = historico[historico.length - 1];
    alterarQuantidade(last.variacao_id, -last.delta);
    setHistorico(h => h.slice(0, -1));
  };
  const askClearAll = () => {
    if (!itens.length) return;
    confirmDialog({
      message: 'Limpar todos os itens lidos?',
      header: 'Limpar leitura',
      icon: 'pi pi-trash',
      acceptLabel: 'Limpar',
      rejectLabel: 'Cancelar',
      accept: () => { setItens([]); setHistorico([]); setLastScan(null); }
    });
  };

  // Parse "qtd*código" ou "código*qtd"
  const parseQtyAndCode = (raw) => {
    let qty = 1;
    let codeOnly = (raw || '').trim();
    if (!codeOnly) return { qty, codeOnly };

    let m = codeOnly.match(/^(\d{1,5})\s*[x\*]\s*(.+)$/i);
    if (m) {
      qty = parseInt(m[1], 10);
      codeOnly = m[2].trim();
    } else {
      m = codeOnly.match(/^(.+?)\s*[x\*]\s*(\d{1,5})$/i);
      if (m) { codeOnly = m[1].trim(); qty = parseInt(m[2], 10); }
    }

    if (qty === 1 && qtdRapida > 1) {
      qty = qtdRapida;
      if (autoResetQtd) setQtdRapida(1);
    }
    return { qty, codeOnly };
  };

  // SCAN único
  const onScan = async (value) => {
    let raw = (value ?? codigo ?? '').trim();
    if (!raw) return;

    const { qty, codeOnly } = parseQtyAndCode(raw);

    if (mode === 'transfer') {
      if (!origemId || !destinoId || origemId === destinoId) {
        toast.current?.show({ severity: 'warn', summary: 'Depósitos', detail: 'Selecione origem e destino diferentes.' });
        return;
      }
    } else if (!depositoId) {
      toast.current?.show({ severity: 'warn', summary: 'Depósito', detail: 'Selecione um depósito.' });
      return;
    }

    setLoadingScan(true);
    try {
      const params = { deposito_id: mode === 'transfer' ? origemId : depositoId };
      const res = await apiEstoque.get(`/estoque/caixa/scan/${encodeURIComponent(codeOnly)}`, { params });
      if (res.data?.sucesso) {
        const item = res.data.data;
        adicionarItem(item, qty);
        setHistorico(prev => [...prev, { ...item, delta: +qty }]);
        setLastScan({ ...item, qty });
        setCodigo('');
        beep();
      } else {
        toast.current?.show({ severity: 'warn', summary: 'Não encontrado', detail: 'Código inválido' });
      }
    } catch (e) {
      const msg = e?.response?.data?.mensagem || 'Falha no scan';
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: msg });
    } finally {
      setLoadingScan(false);
      inputRef.current?.focus?.();
    }
  };

  // Colagem em massa
  const processBulk = async () => {
    const lines = (bulkText || '')
      .split(/\r?\n/)
      .map(s => s.trim())
      .filter(Boolean);

    if (!lines.length) { setShowBulk(false); return; }

    if (mode === 'transfer') {
      if (!origemId || !destinoId || origemId === destinoId) {
        toast.current?.show({ severity: 'warn', summary: 'Depósitos', detail: 'Selecione origem e destino diferentes.' });
        return;
      }
    } else if (!depositoId) {
      toast.current?.show({ severity: 'warn', summary: 'Depósito', detail: 'Selecione um depósito.' });
      return;
    }

    setBulkLoading(true);
    try {
      for (const raw of lines) {
        const { qty, codeOnly } = parseQtyAndCode(raw);
        const params = { deposito_id: mode === 'transfer' ? origemId : depositoId };
        // eslint-disable-next-line no-await-in-loop
        const res = await apiEstoque.get(`/estoque/caixa/scan/${encodeURIComponent(codeOnly)}`, { params });
        if (res.data?.sucesso) {
          const item = res.data.data;
          adicionarItem(item, qty);
          setHistorico(prev => [...prev, { ...item, delta: +qty }]);
          setLastScan({ ...item, qty });
        }
      }
      beep();
      setShowBulk(false);
      setBulkText('');
    } catch (e) {
      const msg = e?.response?.data?.mensagem || 'Falha ao processar lista';
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: msg });
    } finally {
      setBulkLoading(false);
    }
  };

  const finalizar = () => {
    if (mode === 'transfer') {
      if (!origemId || !destinoId || origemId === destinoId) {
        toast.current?.show({ severity: 'warn', summary: 'Depósitos', detail: 'Selecione origem e destino diferentes.' });
        return;
      }
    } else if (!depositoId) {
      toast.current?.show({ severity: 'warn', summary: 'Depósito', detail: 'Selecione um depósito.' });
      return;
    }
    if (!itens.length) {
      toast.current?.show({ severity: 'warn', summary: 'Nenhum item', detail: 'Adicione itens antes de finalizar.' });
      return;
    }

    const header = mode === 'transfer' ? 'Transferir lote' : 'Finalizar lote';
    const text = mode === 'transfer'
      ? `Confirmar TRANSFERÊNCIA de ${totalPecas} peça(s) em ${itens.length} produto(s)?`
      : `Confirmar ${tipo.toUpperCase()} de ${totalPecas} peça(s) em ${itens.length} produto(s)?`;

    confirmDialog({
      message: text,
      header,
      icon: 'pi pi-check-circle',
      acceptLabel: 'Confirmar',
      rejectLabel: 'Cancelar',
      accept: finalizarLote,
    });
  };

  const finalizarLote = async () => {
    try {
      if (mode === 'transfer') {
        const payload = {
          deposito_origem_id: origemId,
          deposito_destino_id: destinoId,
          itens: itens.map(i => ({ variacao_id: i.variacao_id, quantidade: i.quantidade })),
        };
        const res = await apiEstoque.post('/estoque/caixa/transferir', payload);
        toast.current?.show({ severity: 'success', summary: 'Transferência', detail: res.data?.mensagem || 'Transferido' });
      } else {
        const payload = {
          tipo,
          deposito_id: depositoId,
          itens: itens.map(i => ({ variacao_id: i.variacao_id, quantidade: i.quantidade })),
        };
        const res = await apiEstoque.post('/estoque/caixa/finalizar', payload);
        toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: res.data?.mensagem || 'Lote finalizado' });
      }
      setItens([]); setHistorico([]); setLastScan(null); beep();
    } catch (e) {
      const data = e?.response?.data;
      const detail = Array.isArray(data?.erros) ? data.erros.join(' | ') : (data?.mensagem || 'Falha ao finalizar');
      toast.current?.show({ severity: 'error', summary: 'Erro', detail });
    } finally {
      inputRef.current?.focus?.();
    }
  };

  // Templates
  const quantidadeBody = (row) => (
    <div className="flex align-items-center gap-2">
      <Button icon="pi pi-minus" rounded text onClick={() => alterarQuantidade(row.variacao_id, -1)} aria-label="Diminuir" />
      <InputNumber
        value={row.quantidade}
        onValueChange={(e) => setQuantidade(row.variacao_id, e.value)}
        min={1}
        max={99999}
        inputStyle={{ width: 70, textAlign: 'center' }}
      />
      <Button icon="pi pi-plus" rounded text onClick={() => alterarQuantidade(row.variacao_id, +1)} aria-label="Aumentar" />
    </div>
  );
  const acoesBody = (row) => (
    <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => removerItem(row.variacao_id)} aria-label="Remover" />
  );

  // ---------- HEADER (4 linhas em telas grandes) ----------
  // Linha 1: Modo | Câmera | (Depósito/Operação) OU (Origem/Destino)
  const Row1 = (
    <div className="grid align-items-end mb-2">
      <div className="col-12 sm:col-6 lg:col-3">
        <Button
          label={mode === 'transfer' ? 'Modo: TRANSFERÊNCIA (F3)' : 'Modo: NORMAL (F3)'}
          icon={mode === 'transfer' ? 'pi pi-external-link' : 'pi pi-bars'}
          className={(mode === 'transfer' ? 'p-button-warning' : 'p-button-secondary') + ' w-full'}
          onClick={() => setMode(mode === 'transfer' ? 'normal' : 'transfer')}
        />
      </div>

      <div className="col-12 sm:col-6 lg:col-3">
        <Button
          label={useCamera ? 'Câmera: ON (F8)' : 'Câmera: OFF (F8)'}
          icon="pi pi-camera"
          className={(useCamera ? '' : 'p-button-outlined') + ' w-full'}
          onClick={() => setUseCamera(!useCamera)}
        />
      </div>

      {mode === 'transfer' ? (
        <>
          <div className="col-12 md:col-6 lg:col-3">
            <label className="text-sm mb-1 block">Origem</label>
            <Dropdown
              value={origemId}
              options={depositos}
              onChange={(e) => setOrigemId(e.value)}
              placeholder="Depósito de origem"
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-6 lg:col-3">
            <label className="text-sm mb-1 block">Destino</label>
            <Dropdown
              value={destinoId}
              options={depositos.filter(d => d.value !== origemId)} // evita escolher igual
              onChange={(e) => setDestinoId(e.value)}
              placeholder="Depósito de destino"
              className="w-full"
            />
          </div>
        </>
      ) : (
        <>
          <div className="col-12 md:col-6 lg:col-3">
            <label className="text-sm mb-1 block">Depósito</label>
            <Dropdown
              value={depositoId}
              options={depositos}
              onChange={(e) => setDepositoId(e.value)}
              placeholder="Selecione"
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-6 lg:col-3">
            <label className="text-sm mb-1 block">Operação</label>
            <Dropdown value={tipo} options={TIPO_OPCOES} onChange={(e) => setTipo(e.value)} className="w-full" />
          </div>
        </>
      )}
    </div>
  );

  // Linha 2: Qtd rápida | Leitura (sem botões externos +/−; auto-reset vai pra baixo no mobile)
  const Row2 = (
    <div className="grid mb-2">
      <div className="col-12 md:col-5 lg:col-4 xl:col-3">
        <label className="text-sm mb-1 block">
          Qtd rápida <span className="text-xs text-color-secondary">(F6/F7)</span>
        </label>
        <div className="flex flex-column gap-2">
          <div className="flex align-items-center gap-2">
            <InputNumber
              inputRef={qtdRef}
              value={qtdRapida}
              onValueChange={(e) => setQtdRapida(e.value || 1)}
              onFocus={() => { qtdFocusedRef.current = true; setFocusPaused(true); }}
              onBlur={() => { qtdFocusedRef.current = false; setFocusPaused(false); setTimeout(() => inputRef.current?.focus?.(), 50); }}
              showButtons
              buttonLayout="horizontal"
              decrementButtonIcon="pi pi-minus"
              incrementButtonIcon="pi pi-plus"
              min={1}
              max={99999}
              inputClassName="w-7rem text-center"
            />
          </div>
          <div className="flex align-items-center gap-2 md:flex-row">
            <Checkbox inputId="autoResetQtd" checked={autoResetQtd} onChange={(e) => setAutoResetQtd(e.checked)} />
            <label htmlFor="autoResetQtd" className="text-xs">Auto-reset após usar</label>
          </div>
        </div>
      </div>

      <div className="col-12 md:col-7 lg:col-8 xl:col-9">
        <label className="text-sm mb-1 block">Leitura (escaneie ou digite)</label>
        <InputText
          ref={inputRef}
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onScan(); }}
          placeholder="Aponte o leitor e pressione Enter"
          className="w-full"
        />
      </div>
    </div>
  );

  // Linha 3: Botões (mesma linha em lg+; empilha em telas menores)
  const Row3 = (
    <div className="grid mb-2">
      <div className="col-12">
        <div className="flex gap-2 flex-wrap lg:flex-nowrap justify-content-start md:justify-content-end">
          <Button label="Colar lista" icon="pi pi-clipboard" onClick={() => setShowBulk(true)} className="p-button-help w-full sm:w-auto" />
          <Button label="Adicionar (Enter)" icon="pi pi-plus" onClick={() => onScan()} loading={loadingScan} className="w-full sm:w-auto" />
          <Button
            label="Finalizar (F9)"
            icon="pi pi-check"
            severity="success"
            onClick={finalizar}
            disabled={
              !itens.length ||
              (mode === 'transfer' && (!origemId || !destinoId || origemId === destinoId))
            }
            className="w-full sm:w-auto"
          />
          <Button label="Limpar (F4)" icon="pi pi-trash" severity="danger" onClick={askClearAll} disabled={!itens.length} className="w-full sm:w-auto" />
        </div>
      </div>
    </div>
  );

  // Linha 4: Chips + atalhos
  const Row4 = (
    <div className="flex flex-wrap align-items-center gap-2 mb-2">
      <Tag value={`Itens: ${itens.length}`} rounded />
      <Tag severity="info" value={`Peças: ${totalPecas}`} rounded />
      {lastScan && (
        <Tag severity="success" value={`Último: ${lastScan.codigo_barras} × ${lastScan.qty}`} rounded icon="pi pi-check" />
      )}
      <span className="text-sm text-color-secondary">
        Atalhos: <b>F2</b> Entrada/Saída (modo normal) · <b>F3</b> Normal/Transferência · <b>F4</b> limpar · <b>F6/F7</b> Qtd rápida · <b>Shift+F7</b> zera · <b>F8</b> câmera · <b>Ctrl+Z</b> desfaz · <b>F9</b> finaliza. Também aceita <b>10*CODIGO</b> ou <b>CODIGO*10</b>.
      </span>
    </div>
  );

  const bulkDialog = (
    <Dialog
      visible={showBulk}
      onHide={() => !bulkLoading && setShowBulk(false)}
      header="Colar lista de códigos"
      style={{ width: '40rem', maxWidth: '95vw' }}
      modal
      onShow={() => setFocusPaused(true)}
      footer={
        <div className="flex justify-content-end gap-2">
          <Button label="Cancelar" icon="pi pi-times" onClick={() => setShowBulk(false)} disabled={bulkLoading} />
          <Button label="Processar" icon="pi pi-check" onClick={processBulk} loading={bulkLoading} />
        </div>
      }
    >
      <p className="text-sm mb-2">
        Cole uma lista, 1 código por linha. Você pode usar quantidades: <code>10*789...</code> ou <code>789...*10</code>.
      </p>
      <InputTextarea
        value={bulkText}
        onChange={(e) => setBulkText(e.target.value)}
        rows={10}
        autoFocus
        placeholder={`Exemplos:\n10*789252586281\n789800203537*2\n789724243267`}
        style={{ width: '100%' }}
      />
    </Dialog>
  );

  return (
    <SakaiLayout>
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="p-4 md:p-6">
        {Row1}
        {Row2}
        {Row3}
        {Row4}

        {useCamera && (
          <div className="mb-4">
            <BarcodeScanner
              onDetected={(code) => onScan(code)}
              facingMode="environment"
              continuous={continuousCamera}
              className="shadow-2"
            />
          </div>
        )}

        <DataTable value={itens} emptyMessage="Nenhum item lido" stripedRows size="small" responsiveLayout="scroll">
          <Column field="codigo_barras" header="Código" style={{ minWidth: 140 }} />
          <Column field="referencia" header="Ref." style={{ minWidth: 120 }} />
          <Column field="nome" header="Produto / Variação" style={{ minWidth: 320 }} />
          <Column field="estoque_atual" header={mode === 'transfer' ? 'Estoque (origem)' : `Estoque (${depositoId ? 'dep.' : 'variação'})`} style={{ width: 160 }} />
          <Column header="Qtd" body={quantidadeBody} style={{ width: 180 }} />
          <Column body={acoesBody} header="Ações" style={{ width: 100 }} />
        </DataTable>

        <div className="flex justify-content-end mt-3">
          <div className="text-lg font-semibold">Total de peças: {totalPecas}</div>
        </div>
      </div>

      {bulkDialog}
    </SakaiLayout>
  );
}
