import React, { useEffect, useRef, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { AutoComplete } from 'primereact/autocomplete';
import apiEstoque from '../services/apiEstoque';
import CalendarBR from "./CalendarBR";

/**
 * Form de Pedido para Fábrica.
 * - Pedido de Venda (opcional) vem primeiro.
 * - Se pedido for selecionado, as variações sugeridas são filtradas por este pedido.
 * - Depósito permite limpar (showClear).
 */
const PedidoFabricaForm = ({ visible, onHide, onSave, pedidoEditavel = null, itensIniciais = [] }) => {
  const toast = useRef(null);

  const [dataPrevisao, setDataPrevisao] = useState(null);
  const [observacoes, setObservacoes] = useState('');
  const [itens, setItens] = useState([]);
  const [sugestoesVariacoes, setSugestoesVariacoes] = useState([]);
  const [depositos, setDepositos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [carregandoPedido, setCarregandoPedido] = useState(false);

  const debounceTimeout = useRef(null);

  useEffect(() => {
    buscarDepositos();

    if (visible && pedidoEditavel?.id) {
      carregarPedidoFabrica(pedidoEditavel.id);
    } else if (visible) {
      setDataPrevisao(null);
      setObservacoes('');
      setItens(itensIniciais.length ? itensIniciais : [{
        produto_variacao_id: null,
        produto_variacao_nome: '',
        quantidade: 1,
        deposito_id: null,
        pedido_venda_id: null,
        pedido_venda_label: '',
        observacoes: '',
        sugestoesPedidos: []
      }]);
      setSugestoesVariacoes([]);
    }
  }, [visible]);

  const carregarPedidoFabrica = async (id) => {
    try {
      setCarregandoPedido(true);
      const { data } = await apiEstoque.get(`/pedidos-fabrica/${id}`);
      const pedido = data?.data ?? data;

      setDataPrevisao(pedido.data_previsao_entrega ? new Date(pedido.data_previsao_entrega) : null);
      setObservacoes(pedido.observacoes || '');

      const novosItens = (pedido.itens || []).map(i => {
        const pv = i.pedido_venda || null;
        const labelPV = pv
          ? `Pedido #${pv.numero_externo || pv.id} - ${pv.cliente?.nome ?? 'Sem cliente'}`
          : '';

        return {
          produto_variacao_id: i.produto_variacao_id,
          produto_variacao_nome: i.variacao?.nome_completo || `${i.variacao?.produto?.nome ?? ''} - ${(i.variacao?.atributos ?? []).map(a=>a.valor).join(', ')}`,
          quantidade: i.quantidade,
          deposito_id: i.deposito_id ?? null,
          pedido_venda_id: i.pedido_venda_id ?? null,
          pedido_venda_label: labelPV,
          observacoes: i.observacoes || '',
          sugestoesPedidos: []
        };
      });
      setItens(novosItens);

    } catch {
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar pedido' });
      onHide();
    } finally {
      setCarregandoPedido(false);
    }
  };

  const buscarDepositos = async () => {
    try {
      const { data } = await apiEstoque.get('/depositos');
      setDepositos(data.map(d => ({ label: d.nome, value: d.id })));
    } catch {
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao buscar depósitos' });
    }
  };

  // Busca pedidos para o autocomplete
  const buscarPedidos = async (termo) => {
    if (!termo || termo.length < 2) return [];
    try {
      const { data } = await apiEstoque.get('/pedidos', { params: { busca: termo } });
      const pedidos = data?.original?.data || data?.data || [];
      return pedidos.map(p => ({
        id: p.id,
        label: `Pedido #${p.numero_externo || p.id} - ${p.cliente?.nome ?? 'Sem cliente'}`
      }));
    } catch (error) {
      console.warn('Erro ao buscar pedidos:', error);
      return [];
    }
  };

  // Busca variações (se houver pedido_venda_id, filtra no back por pedido)
  const buscarVariacoes = async (event, pedidoVendaId = null) => {
    const termo = event.query;
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(async () => {
      if (!termo || termo.length < 2) {
        setSugestoesVariacoes([]);
        return;
      }
      try {
        const { data } = await apiEstoque.get('/variacoes', {
          params: { search: termo, pedido_venda_id: pedidoVendaId || undefined }
        });
        setSugestoesVariacoes(data);
      } catch {
        toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao buscar variações' });
      }
    }, 300);
  };

  const adicionarItem = () => {
    setItens([...itens, {
      produto_variacao_id: null,
      produto_variacao_nome: '',
      quantidade: 1,
      deposito_id: null,
      pedido_venda_id: null,
      pedido_venda_label: '',
      observacoes: '',
      sugestoesPedidos: []
    }]);
  };

  const removerItem = (index) => {
    const novos = [...itens];
    novos.splice(index, 1);
    setItens(novos);
  };

  const atualizarItem = (index, campo, valor) => {
    const novos = [...itens];
    novos[index][campo] = valor;
    setItens(novos);
  };

  const salvar = async () => {
    try {
      setLoading(true);
      const payload = {
        data_previsao_entrega: dataPrevisao?.toISOString().slice(0, 10) ?? null,
        observacoes,
        itens: itens.map(({ sugestoesPedidos, ...item }) => ({
          ...item,
          // normaliza label do pedido
          pedido_venda_label: undefined
        }))
      };
      await onSave(payload);
      onHide();
    } catch {
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao salvar' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header={pedidoEditavel?.id ? 'Editar Pedido Fábrica' : 'Novo Pedido Fábrica'}
        visible={visible}
        onHide={onHide}
        style={{ width: '65vw', maxWidth: 1100 }}
        modal
        footer={
          <div className="flex justify-content-end gap-2">
            <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
            <Button label="Salvar" icon="pi pi-check" onClick={salvar} loading={loading || carregandoPedido} disabled={carregandoPedido} />
          </div>
        }
      >
        {carregandoPedido ? (
          <div className="flex flex-column gap-3 p-3">
            <div className="surface-100 border-round h-3rem w-10"></div>
            <div className="surface-100 border-round h-6rem w-full"></div>
            <div className="surface-100 border-round h-8rem w-full"></div>
          </div>
        ) : (
          <>
            <div className="grid formgrid mb-4">
              <div className="field col-12 md:col-4">
                <label className="font-bold flex align-items-center gap-2">
                  <i className="pi pi-calendar text-primary" /> Previsão de Entrega
                </label>
                <small className="block text-500 mb-2">Opcional</small>
                <CalendarBR value={dataPrevisao} onChange={(e) => setDataPrevisao(e.value)} />
              </div>

              <div className="field col-12 md:col-8">
                <label className="font-bold flex align-items-center gap-2">
                  <i className="pi pi-comment text-primary" /> Observações
                </label>
                <InputTextarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={3} className="w-full" />
              </div>
            </div>

            <div className="flex align-items-center gap-2 mb-3">
              <i className="pi pi-box text-xl text-primary" />
              <h5 className="m-0">Itens do Pedido</h5>
            </div>

            {itens.map((item, idx) => (
              <div key={idx} className="surface-card border-round shadow-1 p-3 mb-3">
                <div className="grid formgrid align-items-center">
                  {/* 1) Pedido de venda (opcional) VEM PRIMEIRO */}
                  <div className="field col-12 md:col-5">
                    <label>Pedido de Venda (opcional)</label>
                    <AutoComplete
                      value={item.pedido_venda_label || ''}
                      suggestions={item.sugestoesPedidos || []}
                      completeMethod={async (e) => {
                        const sugestoes = await buscarPedidos(e.query);
                        atualizarItem(idx, 'sugestoesPedidos', sugestoes);
                      }}
                      field="label"
                      dropdown
                      placeholder="Pedido de Venda"
                      className="w-full"
                      onChange={(e) => atualizarItem(idx, 'pedido_venda_label', e.value)}
                      onSelect={(e) => {
                        atualizarItem(idx, 'pedido_venda_id', e.value.id);
                        atualizarItem(idx, 'pedido_venda_label', e.value.label);
                        // se selecionou pedido, limpamos variação para forçar novo filtro
                        atualizarItem(idx, 'produto_variacao_id', null);
                        atualizarItem(idx, 'produto_variacao_nome', '');
                      }}
                    />
                  </div>

                  {/* 2) Variação (filtra por pedido se houver) */}
                  <div className="field col-12 md:col-5">
                    <label>Produto</label>
                    <AutoComplete
                      value={item.produto_variacao_nome || ''}
                      suggestions={sugestoesVariacoes}
                      completeMethod={(e) => buscarVariacoes(e, item.pedido_venda_id)}
                      field="nome_completo"
                      dropdown
                      placeholder={item.pedido_venda_id ? 'Buscar produto do pedido selecionado' : 'Buscar produto'}
                      className="w-full"
                      onChange={(e) => atualizarItem(idx, 'produto_variacao_nome', e.value)}
                      onSelect={(e) => {
                        atualizarItem(idx, 'produto_variacao_id', e.value.id);
                        atualizarItem(idx, 'produto_variacao_nome', e.value.nome_completo);
                      }}
                    />
                  </div>

                  {/* 3) Quantidade */}
                  <div className="field col-6 md:col-2">
                    <label>Quantidade</label>
                    <InputText
                      type="number"
                      value={item.quantidade}
                      onChange={(e) => atualizarItem(idx, 'quantidade', Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full"
                    />
                  </div>

                  {/* 4) Depósito com showClear para REMOVER */}
                  <div className="field col-6 md:col-3">
                    <label>Depósito (opcional)</label>
                    <Dropdown
                      value={item.deposito_id}
                      options={depositos}
                      onChange={(e) => atualizarItem(idx, 'deposito_id', e.value)}
                      placeholder="Depósito"
                      className="w-full"
                      showClear
                    />
                  </div>

                  {/* 5) Observações do item */}
                  <div className="field col-12 md:col-8">
                    <label>Observações do Item</label>
                    <InputText
                      value={item.observacoes}
                      onChange={(e) => atualizarItem(idx, 'observacoes', e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div className="field col-12 md:col-1 flex align-items-end justify-content-end">
                    <Button icon="pi pi-trash" className="p-button-danger p-button-text" onClick={() => removerItem(idx)} tooltip="Remover item" />
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-content-between mt-2 mb-4">
              <Button label="Adicionar Item" icon="pi pi-plus" className="p-button-sm p-button-outlined p-button-primary" onClick={adicionarItem} />
            </div>
          </>
        )}
      </Dialog>
    </>
  );
};

export default PedidoFabricaForm;
