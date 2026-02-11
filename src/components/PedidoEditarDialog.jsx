import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { AutoComplete } from 'primereact/autocomplete';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import api from '../services/apiEstoque';
import { formatarReal } from '../utils/formatters';

const toArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (payload?.data && Array.isArray(payload.data)) return payload.data;
  if (payload?.dados && Array.isArray(payload.dados)) return payload.dados;
  if (payload?.results && Array.isArray(payload.results)) return payload.results;
  return [];
};

const montarLabelVariacao = (item) => {
  const base = item?.nome_produto || item?.produto_nome || 'Produto';
  const ref = item?.referencia ? `— ${item.referencia}` : '';
  return `${base} ${ref}`.trim();
};

const PedidoEditarDialog = ({ visible, pedidoId, onHide, onSalvo }) => {
  const toast = useRef(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pedido, setPedido] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [parceiros, setParceiros] = useState([]);
  const [sugestoesVariacoes, setSugestoesVariacoes] = useState([]);

  const carregarPedido = async () => {
    if (!pedidoId) return;
    setLoading(true);
    try {
      const [pedidoRes, clientesRes, parceirosRes] = await Promise.all([
        api.get(`/pedidos/${pedidoId}/detalhado`),
        api.get('/clientes'),
        api.get('/parceiros'),
      ]);

      const pedidoRaw = pedidoRes?.data?.data ?? pedidoRes?.data ?? null;
      const itensRaw = Array.isArray(pedidoRaw?.itens) ? pedidoRaw.itens : [];

      const itens = itensRaw.map((item) => ({
        id: item.id,
        id_variacao: item.id_variacao ?? item.variacao_id ?? null,
        variacaoOption: item.id_variacao
          ? {
            id: item.id_variacao,
            label: montarLabelVariacao(item),
            preco: Number(item.preco_unitario || 0),
            referencia: item.referencia || '',
            produto_nome: item.nome_produto || '',
          }
          : null,
        quantidade: Number(item.quantidade) || 1,
        preco_unitario: Number(item.preco_unitario) || 0,
        id_deposito: item.id_deposito ?? null,
        nome_produto: item.nome_produto || '',
        referencia: item.referencia || '',
        imagem: item.imagem || null,
        atributos: Array.isArray(item.atributos) ? item.atributos : [],
        depositos: [],
        _key: `item-${item.id}`,
      }));

      setPedido({
        id: pedidoRaw?.id,
        id_cliente: pedidoRaw?.cliente?.id ?? pedidoRaw?.id_cliente ?? null,
        id_parceiro: pedidoRaw?.parceiro?.id ?? pedidoRaw?.id_parceiro ?? null,
        observacoes: pedidoRaw?.observacoes ?? '',
        prazo_dias_uteis: pedidoRaw?.prazo_dias_uteis ?? null,
        itens,
      });

      setClientes(toArray(clientesRes?.data));
      setParceiros(toArray(parceirosRes?.data));
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro ao carregar pedido',
        detail: err.response?.data?.message || err.message,
      });
      setPedido(null);
    } finally {
      setLoading(false);
    }
  };

  const carregarDepositos = async (itemKey, variacaoId) => {
    if (!variacaoId) return;
    try {
      const { data } = await api.get(`/estoque/variacoes/${variacaoId}`);
      const lista = Array.isArray(data) ? data : [];
      setPedido((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          itens: prev.itens.map((item) =>
            item._key === itemKey ? { ...item, depositos: lista } : item
          ),
        };
      });
    } catch {
      setPedido((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          itens: prev.itens.map((item) =>
            item._key === itemKey ? { ...item, depositos: [] } : item
          ),
        };
      });
    }
  };

  useEffect(() => {
    if (visible && pedidoId) {
      carregarPedido();
    } else if (!visible) {
      setPedido(null);
      setSugestoesVariacoes([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, pedidoId]);

  useEffect(() => {
    if (!pedido?.itens?.length) return;
    pedido.itens.forEach((item) => {
      if (item.id_variacao) {
        carregarDepositos(item._key, item.id_variacao);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pedido?.id]);

  const atualizarItem = (key, patch) => {
    setPedido((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        itens: prev.itens.map((item) =>
          item._key === key ? { ...item, ...patch } : item
        ),
      };
    });
  };

  const adicionarItem = () => {
    const novoKey = `novo-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setPedido((prev) => ({
      ...prev,
      itens: [
        ...prev.itens,
        {
          id: null,
          id_variacao: null,
          variacaoOption: null,
          quantidade: 1,
          preco_unitario: 0,
          id_deposito: null,
          nome_produto: '',
          referencia: '',
          imagem: null,
          atributos: [],
          depositos: [],
          _key: novoKey,
        },
      ],
    }));
  };

  const removerItem = (key) => {
    setPedido((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        itens: prev.itens.filter((item) => item._key !== key),
      };
    });
  };

  const buscarVariacoes = async (query) => {
    try {
      const { data } = await api.get('/variacoes', { params: { search: query } });
      const lista = toArray(data).map((v) => ({
        id: v.id,
        label: `${v.produto_nome ? `${v.produto_nome} — ` : ''}${v.nome_completo || v.referencia || `Variação #${v.id}`}`,
        preco: Number(v.preco || 0),
        referencia: v.referencia || '',
        produto_nome: v.produto_nome || '',
      }));
      setSugestoesVariacoes(lista);
    } catch {
      setSugestoesVariacoes([]);
    }
  };

  const selecionarVariacao = (itemKey, opcao) => {
    if (!opcao?.id) {
      atualizarItem(itemKey, {
        id_variacao: null,
        variacaoOption: null,
        nome_produto: '',
        referencia: '',
        preco_unitario: 0,
        id_deposito: null,
        depositos: [],
      });
      return;
    }

    atualizarItem(itemKey, {
      id_variacao: opcao.id,
      variacaoOption: opcao,
      nome_produto: opcao.produto_nome || '',
      referencia: opcao.referencia || '',
      preco_unitario: opcao.preco ?? 0,
      id_deposito: null,
      depositos: [],
    });
    carregarDepositos(itemKey, opcao.id);
  };

  const salvar = async () => {
    if (!pedido) return;

    if (!pedido.itens.length) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Pedido sem itens',
        detail: 'Adicione ao menos um item antes de salvar.',
      });
      return;
    }

    const itensInvalidos = pedido.itens.filter((i) => !i.id_variacao || !i.quantidade || i.quantidade < 1);
    if (itensInvalidos.length) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Itens invÃ¡lidos',
        detail: 'Informe variaÃ§Ã£o e quantidade para todos os itens.',
      });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        id_cliente: pedido.id_cliente,
        id_parceiro: pedido.id_parceiro,
        observacoes: pedido.observacoes,
        prazo_dias_uteis: pedido.prazo_dias_uteis,
        itens: pedido.itens.map((i) => ({
          id: i.id,
          id_variacao: i.id_variacao,
          quantidade: i.quantidade,
          preco_unitario: i.preco_unitario,
          id_deposito: i.id_deposito,
        })),
      };

      await api.put(`/pedidos/${pedido.id}`, payload);
      toast.current?.show({
        severity: 'success',
        summary: 'Pedido atualizado',
        detail: 'AlteraÃ§Ãµes salvas com sucesso.',
      });
      onSalvo?.();
      onHide();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      const detalhes = err.response?.data?.errors;
      const extra = detalhes ? Object.values(detalhes).flat().join(' | ') : null;
      toast.current?.show({
        severity: 'error',
        summary: 'Erro ao salvar',
        detail: extra || msg,
      });
    } finally {
      setSaving(false);
    }
  };

  const totalPedido = useMemo(() => {
    if (!pedido?.itens?.length) return 0;
    return pedido.itens.reduce((acc, item) => acc + (Number(item.preco_unitario || 0) * Number(item.quantidade || 0)), 0);
  }, [pedido?.itens]);

  return (
    <Dialog
      header={`Editar Pedido ${pedido?.id ? `#${pedido.id}` : ''}`}
      visible={visible}
      onHide={onHide}
      style={{ width: '85vw' }}
      modal
      footer={
        <div className="flex justify-content-end gap-2">
          <Button label="Cancelar" severity="secondary" onClick={onHide} />
          <Button label="Salvar" icon="pi pi-check" onClick={salvar} loading={saving} />
        </div>
      }
    >
      <Toast ref={toast} />

      {loading || !pedido ? (
        <div className="p-4">Carregando...</div>
      ) : (
        <div className="p-fluid">
          <div className="grid mb-3">
            <div className="col-12 md:col-4">
              <label className="block mb-2">Cliente</label>
              <Dropdown
                value={pedido.id_cliente}
                options={clientes}
                optionLabel="nome"
                optionValue="id"
                onChange={(e) => setPedido((prev) => ({ ...prev, id_cliente: e.value }))}
                placeholder="Selecione o cliente"
                className="w-full"
              />
            </div>
            <div className="col-12 md:col-4">
              <label className="block mb-2">Parceiro</label>
              <Dropdown
                value={pedido.id_parceiro}
                options={parceiros}
                optionLabel="nome"
                optionValue="id"
                onChange={(e) => setPedido((prev) => ({ ...prev, id_parceiro: e.value }))}
                placeholder="Selecione o parceiro"
                className="w-full"
              />
            </div>
            <div className="col-12 md:col-4">
              <label className="block mb-2">Prazo (dias Ãºteis)</label>
              <InputNumber
                value={pedido.prazo_dias_uteis}
                onValueChange={(e) => setPedido((prev) => ({ ...prev, prazo_dias_uteis: e.value }))}
                min={0}
                className="w-full"
              />
            </div>
            <div className="col-12">
              <label className="block mb-2">ObservaÃ§Ãµes</label>
              <InputTextarea
                value={pedido.observacoes}
                onChange={(e) => setPedido((prev) => ({ ...prev, observacoes: e.target.value }))}
                rows={3}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex justify-content-between align-items-center mb-2">
            <h4 className="m-0">Itens do Pedido</h4>
            <Button label="Adicionar item" icon="pi pi-plus" className="p-button-sm" onClick={adicionarItem} />
          </div>

          {pedido.itens.map((item) => (
            <div key={item._key} className="border-1 surface-border border-round p-3 mb-3">
              <div className="grid align-items-end">
                <div className="col-12 md:col-4">
                  <label className="block mb-2">VariaÃ§Ã£o</label>
                  <AutoComplete
                    value={item.variacaoOption}
                    suggestions={sugestoesVariacoes}
                    completeMethod={(e) => buscarVariacoes(e.query)}
                    field="label"
                    dropdown
                    placeholder="Buscar variaÃ§Ã£o"
                    onChange={(e) => atualizarItem(item._key, { variacaoOption: e.value })}
                    onSelect={(e) => selecionarVariacao(item._key, e.value)}
                  />
                </div>
                <div className="col-12 md:col-2">
                  <label className="block mb-2">Quantidade</label>
                  <InputNumber
                    value={item.quantidade}
                    onValueChange={(e) => atualizarItem(item._key, { quantidade: e.value || 0 })}
                    min={1}
                    className="w-full"
                  />
                </div>
                <div className="col-12 md:col-2">
                  <label className="block mb-2">PreÃ§o unitÃ¡rio</label>
                  <InputNumber
                    value={item.preco_unitario}
                    onValueChange={(e) => atualizarItem(item._key, { preco_unitario: e.value || 0 })}
                    mode="currency"
                    currency="BRL"
                    locale="pt-BR"
                    className="w-full"
                  />
                </div>
                <div className="col-12 md:col-3">
                  <label className="block mb-2">DepÃ³sito</label>
                  <Dropdown
                    value={item.id_deposito}
                    options={item.depositos}
                    optionLabel="nome"
                    optionValue="id"
                    onChange={(e) => atualizarItem(item._key, { id_deposito: e.value })}
                    placeholder="Selecione o depÃ³sito"
                    emptyMessage="Nenhum depÃ³sito disponÃ­vel"
                    className="w-full"
                  />
                </div>
                <div className="col-12 md:col-1 flex justify-content-end">
                  <Button
                    icon="pi pi-trash"
                    className="p-button-text p-button-danger"
                    onClick={() => removerItem(item._key)}
                  />
                </div>
              </div>

              <div className="mt-2 text-sm text-gray-600">
                Subtotal: <strong>{formatarReal(Number(item.preco_unitario || 0) * Number(item.quantidade || 0))}</strong>
              </div>
            </div>
          ))}

          <div className="flex justify-content-end text-lg font-semibold">
            Total do pedido: {formatarReal(totalPedido)}
          </div>
        </div>
      )}
    </Dialog>
  );
};

export default PedidoEditarDialog;
