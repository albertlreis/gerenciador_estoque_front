import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import SakaiLayout from '../layouts/SakaiLayout';
import apiEstoque from '../services/apiEstoque';
import { listarProdutos } from '../services/produtoService';
import BarcodeScanner from '../components/BarcodeScanner';
import ToolbarLeitura from '../components/estoque/ToolbarLeitura';
import TabelaItensLeitura from '../components/estoque/TabelaItensLeitura';
import BulkDialog from '../components/estoque/BulkDialog';

const STORAGE_KEY = 'leituraEstoqueState_v1';

export default function LeituraEstoque() {
  const toast = useRef(null);
  const inputRef = useRef(null);
  const qtdRef = useRef(null);

  const [mode, setMode] = useState(
    new URLSearchParams(window.location.search).get('mode') === 'transfer' ? 'transfer' : 'normal'
  );
  const [tipo, setTipo] = useState('entrada');
  const [depositos, setDepositos] = useState([]);
  const [depositoId, setDepositoId] = useState(null);
  const [origemId, setOrigemId] = useState(null);
  const [destinoId, setDestinoId] = useState(null);
  const [useCamera, setUseCamera] = useState(false);
  const [qtdRapida, setQtdRapida] = useState(1);
  const [autoResetQtd, setAutoResetQtd] = useState(true);
  const [itens, setItens] = useState([]);
  const [lastScan, setLastScan] = useState(null);
  const [showBulk, setShowBulk] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const codigoBuffer = useRef(''); // scanner físico (USB)

  const totalPecas = useMemo(() => itens.reduce((acc, it) => acc + it.quantidade, 0), [itens]);

  /** 🔹 Carrega depósitos */
  useEffect(() => {
    (async () => {
      try {
        const res = await apiEstoque.get('/depositos');
        const dd = res.data.map((d) => ({ label: d.nome, value: d.id }));
        setDepositos(dd);
      } catch {
        toast.current?.show({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao carregar depósitos',
        });
      }
    })();
  }, []);

  /** 🔹 Restaurar estado salvo (depois que depósitos carregam) */
  useEffect(() => {
    if (!depositos.length) return; // só executa quando os depósitos forem carregados

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setItens(data.itens || []);
        setTipo(data.tipo || 'entrada');
        setDepositoId(data.depositoId || depositos[0]?.value || null);
        setOrigemId(data.origemId || depositos[0]?.value || null);
        setDestinoId(
          data.destinoId ||
          (depositos.length > 1 ? depositos[1].value : depositos[0]?.value) ||
          null
        );
        setMode(data.mode || 'normal');
        setQtdRapida(data.qtdRapida || 1);
      } else {
        // inicializa com defaults
        if (depositos.length) {
          setDepositoId(depositos[0].value);
          setOrigemId(depositos[0].value);
          if (depositos.length > 1) setDestinoId(depositos[1].value);
        }
      }
    } catch (e) {
      console.error('Falha ao restaurar estado:', e);
    }
  }, [depositos]);

  /** 🔹 Persistência automática */
  useEffect(() => {
    if (!depositos.length) return;
    const data = {
      itens,
      tipo,
      depositoId,
      origemId,
      destinoId,
      mode,
      qtdRapida,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [itens, tipo, depositoId, origemId, destinoId, mode, qtdRapida, depositos]);

  /** 🔹 Antes de sair */
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (itens.length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [itens]);

  /** 🔹 Teclas de atalho */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      switch (e.key) {
        case 'F2':
          e.preventDefault();
          setTipo((prev) => (prev === 'entrada' ? 'saida' : 'entrada'));
          toast.current?.show({
            severity: 'info',
            summary: 'Operação',
            detail: `Tipo alterado para ${tipo === 'entrada' ? 'saída' : 'entrada'}`,
          });
          break;
        case 'F3':
          e.preventDefault();
          setMode((m) => (m === 'normal' ? 'transfer' : 'normal'));
          break;
        case 'F4':
          e.preventDefault();
          askClearAll();
          break;
        case 'F6':
          e.preventDefault();
          setQtdRapida((q) => Math.max(1, q - 1));
          break;
        case 'F7':
          e.preventDefault();
          if (e.shiftKey) setQtdRapida(1);
          else setQtdRapida((q) => q + 1);
          break;
        case 'F8':
          e.preventDefault();
          setUseCamera((v) => !v);
          break;
        case 'F9':
          e.preventDefault();
          finalizarLote();
          break;
        default:
          if (e.ctrlKey && e.key.toLowerCase() === 'z') {
            e.preventDefault();
            setItens((prev) => prev.slice(0, -1));
          }
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [itens, tipo, mode]);

  /** 🔹 Suporte ao scanner físico (USB) */
  useEffect(() => {
    let timer = null;
    const handleScannerInput = (e) => {
      if (e.key.length === 1 && /^[0-9A-Za-z\-]+$/.test(e.key)) {
        codigoBuffer.current += e.key;
        clearTimeout(timer);
        timer = setTimeout(() => {
          if (codigoBuffer.current.length >= 4) {
            const code = codigoBuffer.current.trim();
            adicionarItem({ codigo_barras: code });
          }
          codigoBuffer.current = '';
        }, 100);
      }
    };
    window.addEventListener('keydown', handleScannerInput);
    return () => window.removeEventListener('keydown', handleScannerInput);
  }, []);

  /** 🔹 Evento de produto selecionado no AutoComplete */
  useEffect(() => {
    console.log('🟠 Registrando listener para evento "produto-adicionado"');
    const listener = (e) => {
      console.log('🟠 Listener "produto-adicionado" RECEBIDO com detail=', e?.detail);
      const variacao = e.detail;
      if (!variacao) {
        console.warn('⚠️ Evento "produto-adicionado" sem detail');
        return;
      }
      const item = {
        variacao_id: variacao.variacao_id || variacao.id,
        codigo_barras: variacao.codigo_barras || '',
        referencia: variacao.referencia || '',
        nome: variacao.nome_completo || variacao.nome || 'Produto sem nome',
        estoque_atual:
          variacao.estoque_atual ??
          variacao.estoque?.quantidade ??
          variacao.estoque_total ??
          0,
      };
      console.log('🟠 Chamando adicionarItem a partir do listener, item=', item);
      adicionarItem(item, qtdRapida);
    };
    window.addEventListener('produto-adicionado', listener);
    return () => {
      console.log('🟠 Removendo listener de "produto-adicionado"');
      window.removeEventListener('produto-adicionado', listener);
    };
  }, [qtdRapida]);

  /** 🔹 Funções auxiliares */
  const beep = () => { try { new Audio('/beep.mp3').play().catch(() => {}); } catch {} };

  const persistState = (newItens) => {
    const data = {
      itens: newItens,
      tipo,
      depositoId,
      origemId,
      destinoId,
      mode,
      qtdRapida,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  /** 🔹 Inserção / atualização de item na lista */
  const adicionarItem = (item, quantidade = 1) => {
    console.log('🟣 adicionarItem() chamado com:', { item, quantidade, tipo, mode });

    if (!item?.codigo_barras && !item?.variacao_id) {
      console.warn('⚠️ adicionarItem abortado: falta codigo_barras ou variacao_id');
      return;
    }

    // 🔎 Busca produto por código se necessário
    if (item.codigo_barras && !item.variacao_id) {
      const depositoBusca = mode === 'transfer' ? origemId : depositoId;
      console.log('🌐 Buscar por código de barras. depositoBusca=', depositoBusca, ' codigo=', item.codigo_barras);

      listarProdutos({
        q: item.codigo_barras,
        view: 'minima',
        deposito_id: depositoBusca,
      })
        .then((res) => {
          const prod = res.data?.data?.[0];
          console.log('✅ Resposta de busca por código:', prod);
          if (prod?.variacoes?.length) {
            const variacao = prod.variacoes[0];
            const itemConvertido = {
              variacao_id: variacao.id,
              codigo_barras: variacao.codigo_barras,
              referencia: variacao.referencia,
              nome: variacao.nome_completo || prod.nome,
              estoque_atual:
                variacao.estoque?.quantidade ??
                variacao.estoque_total ??
                0,
            };
            console.log('🔁 Reentrando adicionarItem com variacao:', itemConvertido);
            adicionarItem(itemConvertido, quantidade);
          } else {
            toast.current?.show({
              severity: 'warn',
              summary: 'Produto não encontrado',
              detail: item.codigo_barras,
            });
          }
        })
        .catch((err) => {
          console.error('❌ Erro na busca por código:', err);
          toast.current?.show({
            severity: 'error',
            summary: 'Erro',
            detail: 'Falha ao buscar produto',
          });
        });
      return;
    }

    // 🔹 Validação de estoque
    const isSaidaOuTransfer = tipo === 'saida' || mode === 'transfer';
    const estoque = item.estoque_atual ?? 0;
    console.log('📊 Validação de estoque: estoque=', estoque, ' isSaidaOuTransfer=', isSaidaOuTransfer);

    if (isSaidaOuTransfer && estoque <= 0) {
      console.warn('🚫 Estque insuficiente: <= 0');
      toast.current?.show({
        severity: 'warn',
        summary: 'Estoque insuficiente',
        detail: `O produto "${item.nome}" não possui saldo disponível.`,
        life: 4000,
      });
      return;
    }

    if (isSaidaOuTransfer && estoque < quantidade) {
      console.warn('🚫 Estoque insuficiente para quantidade solicitada:', { estoque, quantidade });
      toast.current?.show({
        severity: 'warn',
        summary: 'Estoque insuficiente',
        detail: `Saldo disponível: ${estoque}, não é possível remover ${quantidade}.`,
        life: 4000,
      });
      return;
    }

    // 🔹 Inserção/atualização
    setItens((prev) => {
      const idx = prev.findIndex((p) => p.variacao_id === item.variacao_id);
      const novo = [...prev];
      if (idx >= 0) {
        console.log('✍️ Atualizando quantidade do item existente. idx=', idx);
        novo[idx] = { ...novo[idx], quantidade: (novo[idx].quantidade || 0) + quantidade };
      } else {
        console.log('➕ Inserindo novo item na lista.');
        novo.push({ ...item, quantidade });
      }
      persistState(novo);
      return novo;
    });

    setLastScan(item);
    try { new Audio('/beep.mp3').play().catch(() => {}); } catch {}
    toast.current?.show({
      severity: 'success',
      summary: 'Produto adicionado',
      detail: `${item.nome} (${quantidade} un.)`,
      life: 1500,
    });

    if (autoResetQtd) setQtdRapida(1);
  };

  const removerItem = (id) =>
    setItens((prev) => {
      const novo = prev.filter((i) => i.variacao_id !== id);
      persistState(novo);
      return novo;
    });

  const alterarQuantidade = (id, delta) =>
    setItens((prev) => {
      const idx = prev.findIndex((p) => p.variacao_id === id);
      if (idx < 0) return prev;
      const novo = [...prev];
      const q = (novo[idx].quantidade || 1) + delta;
      if (q <= 0) novo.splice(idx, 1);
      else novo[idx] = { ...novo[idx], quantidade: q };
      persistState(novo);
      return novo;
    });

  const setQuantidade = (id, value) =>
    setItens((prev) => {
      const novo = prev.map((i) =>
        i.variacao_id === id ? { ...i, quantidade: Math.max(1, value || 1) } : i
      );
      persistState(novo);
      return novo;
    });

  const askClearAll = () => {
    if (!itens.length) return;
    confirmDialog({
      message: 'Limpar todos os itens lidos?',
      header: 'Limpar leitura',
      icon: 'pi pi-trash',
      acceptLabel: 'Limpar',
      rejectLabel: 'Cancelar',
      accept: () => {
        setItens([]);
        setLastScan(null);
        localStorage.removeItem(STORAGE_KEY);
      },
    });
  };

  /** 🔹 Finalizar lote */
  const finalizarLote = async () => {
    try {
      const payload = {
        tipo: mode === 'transfer' ? 'transferencia' : tipo,
        deposito_origem_id: mode === 'transfer' ? origemId : null,
        deposito_destino_id: mode === 'transfer' ? destinoId : depositoId,
        itens: itens.map((i) => ({
          variacao_id: i.variacao_id,
          quantidade: i.quantidade,
        })),
      };

      const res = await apiEstoque.post('/estoque/movimentacoes/lote', payload);

      toast.current?.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: res.data?.mensagem || 'Movimentação registrada com sucesso.',
      });

      const url = res.data.transferencia_pdf;
      if (url) {
        const response = await apiEstoque.get(url, { responseType: 'blob' }); // ou axios direto
        const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));

        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `transferencia_${res.data.transferencia_id}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();

        window.URL.revokeObjectURL(blobUrl);
      }


      setItens([]);
      setLastScan(null);
      localStorage.removeItem(STORAGE_KEY);
      beep();
    } catch (error) {
      console.error('Erro ao finalizar lote:', error);

      const response = error?.response;
      const data = response?.data || {};
      let detalhes = [];

      // 🔹 Captura mensagens conhecidas
      if (Array.isArray(data.erros)) detalhes = data.erros;
      else if (Array.isArray(data.errors)) detalhes = Object.values(data.errors).flat();
      else if (typeof data.message === 'string') detalhes = [data.message];
      else if (typeof data.mensagem === 'string') detalhes = [data.mensagem];
      else if (response?.statusText) detalhes = [response.statusText];

      // 🔹 Caso não encontre nada útil
      if (!detalhes.length) detalhes = ['Falha desconhecida ao registrar movimentação.'];

      toast.current?.show({
        severity: 'error',
        summary: 'Erro ao finalizar lote',
        detail: detalhes.join(' | '),
        life: 7000,
      });
    }
  };

  /** 🔹 Renderização */
  return (
    <SakaiLayout>
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="p-4 md:p-6">
        <ToolbarLeitura
          {...{
            mode,
            setMode,
            tipo,
            setTipo,
            depositos,
            depositoId,
            setDepositoId,
            origemId,
            setOrigemId,
            destinoId,
            setDestinoId,
            useCamera,
            setUseCamera,
            qtdRapida,
            setQtdRapida,
            autoResetQtd,
            setAutoResetQtd,
            qtdRef,
            inputRef,
            toast,
            itens,
            totalPecas,
            lastScan,
            askClearAll,
            finalizarLote,
            setShowBulk,
          }}
        />

        {useCamera && (
          <div className="mb-4">
            <BarcodeScanner
              onDetected={(code) => adicionarItem({ codigo_barras: code })}
              facingMode="environment"
              continuous={true}
              className="shadow-2"
            />
          </div>
        )}

        <TabelaItensLeitura
          itens={itens}
          alterarQuantidade={alterarQuantidade}
          setQuantidade={setQuantidade}
          removerItem={removerItem}
          mode={mode}
          depositoId={depositoId}
          totalPecas={totalPecas}
        />
      </div>

      <BulkDialog
        showBulk={showBulk}
        setShowBulk={setShowBulk}
        bulkText={bulkText}
        setBulkText={setBulkText}
        bulkLoading={bulkLoading}
        setBulkLoading={setBulkLoading}
        onProcessar={(lines) => {
          lines.forEach((l) => adicionarItem({ codigo_barras: l }));
        }}
      />
    </SakaiLayout>
  );
}
