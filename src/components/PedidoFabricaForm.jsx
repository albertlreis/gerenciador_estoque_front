import React, { useEffect, useRef, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { AutoComplete } from 'primereact/autocomplete';
import apiEstoque from '../services/apiEstoque';

const PedidoFabricaForm = ({ visible, onHide, onSave, pedidoEditavel = null }) => {
  const toast = useRef(null);

  const [dataPrevisao, setDataPrevisao] = useState(null);
  const [observacoes, setObservacoes] = useState('');
  const [itens, setItens] = useState([]);
  const [sugestoes, setSugestoes] = useState([]);
  const [depositos, setDepositos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [carregandoPedido, setCarregandoPedido] = useState(false);

  const debounceTimeout = useRef(null);

  useEffect(() => {
    buscarDepositos();

    if (visible && pedidoEditavel?.id) {
      carregarPedidoFabrica(pedidoEditavel.id);
    } else if (visible) {
      // novo pedido
      setDataPrevisao(null);
      setObservacoes('');
      setItens([]);
      setSugestoes([]);
    }
  }, [visible]);

  const carregarPedidoFabrica = async (id) => {
    try {
      setCarregandoPedido(true);
      const { data } = await apiEstoque.get(`/pedidos-fabrica/${id}`);

      setDataPrevisao(data.data_previsao_entrega ? new Date(data.data_previsao_entrega) : null);
      setObservacoes(data.observacoes || '');

      const sugestoesVariacoes = data.itens.map(i => ({
        id: i.variacao.id,
        nome_completo: i.variacao.nome_completo ??
          `${i.variacao.produto?.nome} - ${i.variacao.atributos?.map(a => a.valor).join(', ')}`,
      }));
      setSugestoes(sugestoesVariacoes);

      setItens(data.itens.map(i => ({
        produto_variacao_id: i.produto_variacao_id,
        produto_variacao_nome: i.variacao.nome_completo,
        quantidade: i.quantidade,
        deposito_id: i.deposito_id ?? null,
        pedido_venda_id: i.pedido_venda_id ?? null,
        pedido_venda_label: i.pedido_venda_id ? `Pedido #${i.pedido_venda_id}` : '',
        observacoes: i.observacoes || '',
        sugestoesPedidos: []
      })));
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
    } catch (e) {
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao buscar depósitos' });
    }
  };

  const buscarSugestoes = async (event) => {
    const termo = event.query;
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(async () => {
      if (!termo || termo.length < 2) {
        setSugestoes([]);
        return;
      }

      try {
        const { data } = await apiEstoque.get('/variacoes', { params: { search: termo } });
        setSugestoes(data);
      } catch (e) {
        toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao buscar variações' });
      }
    }, 300);
  };

  const buscarPedidos = async (termo) => {
    if (!termo || termo.length < 2) return [];

    try {
      const {data} = await apiEstoque.get('/pedidos', {
        params: { busca: termo }
      });

      console.log(data)

      const pedidos = data?.original?.data || [];
      
      return pedidos.map(p => ({
        id: p.id,
        label: `Pedido #${p.numero_externo || p.id} - ${p.cliente?.nome ?? 'Sem cliente'}`
      }));
    } catch (error) {
      console.warn('Erro ao buscar pedidos:', error);
      return [];
    }
  };

  const adicionarItem = () => {
    setItens([...itens, {
      produto_variacao_id: null,
      quantidade: 1,
      deposito_id: null,
      pedido_venda_id: null,
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
        itens: itens.map(({ sugestoesPedidos, ...item }) => item)
      };
      await onSave(payload);
      onHide();
    } catch (e) {
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
        style={{ width: '60vw' }}
        modal
        footer={
          <div>
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
            <div className="p-fluid mb-4">
              <div className="flex align-items-center gap-2 mb-2">
                <i className="pi pi-calendar text-xl text-primary" />
                <label className="font-bold">Previsão de Entrega</label>
              </div>
              <Calendar value={dataPrevisao} onChange={(e) => setDataPrevisao(e.value)} dateFormat="dd/mm/yy" showIcon className="w-full" />
            </div>

            <div className="p-fluid mb-4">
              <div className="flex align-items-center gap-2 mb-2">
                <i className="pi pi-comment text-xl text-primary" />
                <label className="font-bold">Observações</label>
              </div>
              <InputTextarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={3} className="w-full" />
            </div>

            <div className="flex align-items-center gap-2 mb-3">
              <i className="pi pi-box text-xl text-primary" />
              <h5 className="m-0">Itens do Pedido</h5>
            </div>

            {itens.map((item, idx) => (
              <div key={idx} className="surface-card border-round shadow-1 p-3 mb-3">
                <div className="grid formgrid align-items-center">
                  <div className="field col-12 md:col-5">
                    <label>Variação do Produto</label>
                    <AutoComplete
                      value={item.produto_variacao_nome || ''}
                      suggestions={sugestoes}
                      completeMethod={buscarSugestoes}
                      field="nome_completo"
                      dropdown
                      placeholder="Buscar variação"
                      className="w-full"
                      onChange={(e) => atualizarItem(idx, 'produto_variacao_nome', e.value)}
                      onSelect={(e) => {
                        atualizarItem(idx, 'produto_variacao_id', e.value.id);
                        atualizarItem(idx, 'produto_variacao_nome', e.value.nome_completo);
                      }}
                    />
                  </div>

                  <div className="field col-12 md:col-2">
                    <label>Quantidade</label>
                    <InputText
                      type="number"
                      value={item.quantidade}
                      onChange={(e) => atualizarItem(idx, 'quantidade', Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full"
                    />
                  </div>

                  <div className="field col-12 md:col-3">
                    <label>Depósito</label>
                    <Dropdown
                      value={item.deposito_id}
                      options={depositos}
                      onChange={(e) => atualizarItem(idx, 'deposito_id', e.value)}
                      placeholder="Depósito"
                      className="w-full"
                    />
                  </div>

                  <div className="field col-12 md:col-10">
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
                      }}
                    />
                  </div>

                  <div className="field col-12 md:col-2 flex align-items-end justify-content-end">
                    <Button
                      icon="pi pi-trash"
                      className="p-button-danger p-button-text"
                      onClick={() => removerItem(idx)}
                      tooltip="Remover item"
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-content-end mt-2 mb-4">
              <Button
                label="Adicionar Item"
                icon="pi pi-plus"
                className="p-button-sm p-button-outlined p-button-primary"
                onClick={adicionarItem}
              />
            </div>
          </>
        )}

      </Dialog>
    </>
  );
};

export default PedidoFabricaForm;
