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
          <p>Carregando pedido...</p>
        ) : (
          <>
            <div className="p-fluid mb-3">
              <label>Previsão de Entrega</label>
              <Calendar value={dataPrevisao} onChange={(e) => setDataPrevisao(e.value)} dateFormat="dd/mm/yy" showIcon />
            </div>

            <div className="p-fluid mb-3">
              <label>Observações</label>
              <InputTextarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={3} />
            </div>

            <h5>Itens do Pedido</h5>
            {itens.map((item, idx) => (
              <div key={idx} className="grid mb-2 align-items-center">
                <div className="col-4">
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

                <div className="col-2">
                  <InputText
                    type="number"
                    value={item.quantidade}
                    onChange={(e) => atualizarItem(idx, 'quantidade', Math.max(1, parseInt(e.target.value) || 1))}
                    placeholder="Qtd"
                  />
                </div>

                <div className="col-3">
                  <Dropdown
                    value={item.deposito_id}
                    options={depositos}
                    onChange={(e) => atualizarItem(idx, 'deposito_id', e.value)}
                    placeholder="Depósito"
                    className="w-full"
                  />
                </div>

                <div className="col-8 mt-2">
                  <AutoComplete
                    value={item.pedido_venda_label || ''}
                    suggestions={item.sugestoesPedidos || []}
                    completeMethod={async (e) => {
                      try {
                        const { data } = await apiEstoque.get('/pedidos', { params: { search: e.query } });
                        const sugestoes = data.map(p => ({
                          id: p.id,
                          label: `Pedido #${p.id} - ${p.cliente?.nome ?? 'Sem cliente'}`
                        }));
                        atualizarItem(idx, 'sugestoesPedidos', sugestoes);
                      } catch {
                        toast.current.show({ severity: 'warn', summary: 'Erro', detail: 'Erro ao buscar pedidos' });
                      }
                    }}
                    field="label"
                    dropdown
                    placeholder="Pedido de Venda (opcional)"
                    className="w-full"
                    onChange={(e) => atualizarItem(idx, 'pedido_venda_label', e.value)}
                    onSelect={(e) => {
                      atualizarItem(idx, 'pedido_venda_id', e.value.id);
                      atualizarItem(idx, 'pedido_venda_label', e.value.label);
                    }}
                  />
                </div>

                <div className="col-1 flex align-items-center">
                  <Button icon="pi pi-trash" className="p-button-danger p-button-sm" onClick={() => removerItem(idx)} />
                </div>
              </div>
            ))}

            <Button label="Adicionar Item" icon="pi pi-plus" className="p-button-text mt-3" onClick={adicionarItem} />
          </>
        )}
      </Dialog>
    </>
  );
};

export default PedidoFabricaForm;
