import React, { useEffect, useState, useRef } from 'react';
import { useCarrinho } from '../context/CarrinhoContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { Toast } from 'primereact/toast';
import { confirmDialog } from 'primereact/confirmdialog';
import { ConfirmDialog } from 'primereact/confirmdialog';
import SakaiLayout from '../layouts/SakaiLayout';
import api from '../services/apiEstoque';

const formatarValor = (valor) =>
  Number(valor).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

const FinalizarPedido = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useRef(null);

  const {
    carrinhoAtual,
    itens,
    carregarCarrinho,
    atualizarCarrinho,
    finalizarPedido,
    cancelarCarrinho,
    removerItem
  } = useCarrinho();

  const [clientes, setClientes] = useState([]);
  const [parceiros, setParceiros] = useState([]);
  const [observacoes, setObservacoes] = useState('');
  const [modoConsignacao, setModoConsignacao] = useState(false);
  const [prazoConsignacao, setPrazoConsignacao] = useState(null);
  const [itensEmFalta, setItensEmFalta] = useState([]);

  useEffect(() => {
    carregarCarrinho(id);
    fetchClientes();
    fetchParceiros();
  }, [id]);

  useEffect(() => {
    const handler = (e) => {
      if (observacoes?.trim()) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [observacoes]);

  const fetchClientes = async () => {
    const { data } = await api.get('/clientes');
    setClientes(data);
  };

  const fetchParceiros = async () => {
    const { data } = await api.get('/parceiros');
    setParceiros(data);
  };

  const verificarEstoqueInsuficiente = () => {
    return itens.filter(
      (item) => (item.variacao?.estoque_total ?? 0) < item.quantidade
    );
  };

  const handleAtualizarQuantidade = async (item, novaQtd) => {
    if (novaQtd === item.quantidade) return;

    if (novaQtd <= 0) {
      confirmDialog({
        message: 'Deseja remover este item do carrinho?',
        header: 'Confirmação',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Sim',
        rejectLabel: 'Cancelar',
        accept: () => removerItem(item.id),
      });
      return;
    }

    try {
      await api.post('/carrinho-itens', {
        id_carrinho: item.id_carrinho,
        id_variacao: item.id_variacao,
        quantidade: novaQtd,
        preco_unitario: item.preco_unitario
      });
      await carregarCarrinho(item.id_carrinho);
      toast.current.show({ severity: 'success', summary: 'Atualizado', detail: 'Quantidade atualizada' });
    } catch (err) {
      console.error(err);
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao atualizar quantidade' });
    }
  };

  const handleFinalizar = async () => {
    if (modoConsignacao) {
      const faltando = verificarEstoqueInsuficiente();

      if (faltando.length > 0) {
        toast.current.show({
          severity: 'warn',
          summary: 'Não é possível finalizar',
          detail: 'Há itens sem estoque suficiente para consignação.',
          life: 5000,
        });
        setItensEmFalta(faltando.map((i) => i.id));
        return;
      }
    }

    try {
      await finalizarPedido({
        id_parceiro: carrinhoAtual?.id_parceiro,
        observacoes,
        modo_consignacao: modoConsignacao,
        prazo_consignacao: prazoConsignacao
      });

      toast.current.show({ severity: 'success', summary: 'Pedido finalizado!', detail: 'Pedido criado com sucesso.' });
      navigate('/pedidos');
    } catch (err) {
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao finalizar pedido.' });
    }
  };

  const handleSalvarAlteracoes = async () => {
    try {
      await atualizarCarrinho(carrinhoAtual.id, {
        id_cliente: carrinhoAtual.id_cliente,
        id_parceiro: carrinhoAtual.id_parceiro
      });
      toast.current.show({ severity: 'success', summary: 'Alterações salvas', detail: 'Carrinho atualizado.' });
    } catch (err) {
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao salvar alterações.' });
    }
  };

  const handleCancelar = async () => {
    await cancelarCarrinho();
    navigate('/catalogo');
  };

  const total = itens.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);

  return (
    <SakaiLayout>
      <Toast ref={toast} />
      <ConfirmDialog />
      <div className="grid p-4">
        <div className="col-12 md:col-8">
          <h2 className="text-xl font-bold mb-4">Finalizar Pedido</h2>

          <div className="grid mb-4 gap-3">
            <div className="col-12 md:col-6">
              <label className="block mb-1 font-medium">Cliente</label>
              <Dropdown
                value={carrinhoAtual?.id_cliente}
                options={clientes}
                optionLabel="nome"
                optionValue="id"
                onChange={(e) => {
                  const novoId = e.value;
                  if (novoId === carrinhoAtual?.id_cliente) return;
                  confirmDialog({
                    message: 'Deseja alterar o cliente do carrinho?',
                    header: 'Alterar Cliente',
                    icon: 'pi pi-exclamation-triangle',
                    acceptLabel: 'Sim',
                    rejectLabel: 'Cancelar',
                    accept: () => {
                      atualizarCarrinho(carrinhoAtual.id, { id_cliente: novoId });
                      toast.current.show({ severity: 'success', summary: 'Cliente alterado' });
                    }
                  });
                }}
                placeholder="Selecione o cliente"
                className="w-full"
              />
            </div>

            <div className="col-12 md:col-6">
              <label className="block mb-1 font-medium">Parceiro</label>
              <Dropdown
                value={carrinhoAtual?.id_parceiro}
                options={parceiros}
                optionLabel="nome"
                optionValue="id"
                onChange={(e) => {
                  const novoId = e.value;
                  if (novoId === carrinhoAtual?.id_parceiro) return;
                  confirmDialog({
                    message: 'Deseja alterar o parceiro do carrinho?',
                    header: 'Alterar Parceiro',
                    icon: 'pi pi-exclamation-triangle',
                    acceptLabel: 'Sim',
                    rejectLabel: 'Cancelar',
                    accept: () => {
                      atualizarCarrinho(carrinhoAtual.id, { id_parceiro: novoId });
                      toast.current.show({ severity: 'success', summary: 'Parceiro alterado' });
                    }
                  });
                }}
                placeholder="Selecione o parceiro"
                className="w-full"
              />
            </div>
          </div>

          <div className="grid mb-4 gap-3">
            <div className="col-12">
              <div className="flex align-items-center gap-2">
                <input
                  type="checkbox"
                  id="consignacao"
                  checked={modoConsignacao}
                  onChange={(e) => {
                    const checked = e.target.checked;

                    if (checked) {
                      const faltando = verificarEstoqueInsuficiente();

                      if (faltando.length > 0) {
                        setItensEmFalta(faltando.map((i) => i.id));

                        toast.current.show({
                          severity: 'warn',
                          summary: 'Estoque insuficiente',
                          detail: 'Alguns itens não possuem estoque disponível. Corrija antes de ativar consignação.',
                          life: 5000,
                        });
                        return;
                      }
                    }

                    setItensEmFalta([]);
                    setModoConsignacao(checked);
                  }}
                />
                <label htmlFor="consignacao" className="font-medium">Pedido em consignação</label>
              </div>
            </div>

            {modoConsignacao && (
              <div className="col-12 md:col-6">
                <label className="block mb-1 font-medium">Prazo para resposta</label>
                <InputNumber
                  value={prazoConsignacao}
                  onValueChange={(e) => setPrazoConsignacao(e.value)}
                  suffix=" dias"
                  min={1}
                  max={30}
                  placeholder="Informe o prazo"
                  className="w-full"
                />
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium">Observações</label>
            <InputTextarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
              className="w-full"
            />
          </div>

          <div className="border rounded shadow-sm bg-white p-3">
            <h3 className="text-lg font-semibold mb-3">Itens do Pedido</h3>

            {itens.length === 0 ? (
              <p className="text-gray-500">Nenhum item no carrinho.</p>
            ) : (
              itens.map((item) => {
                const estoqueDisponivel = item.variacao?.estoque_total ?? 0;
                const emFalta = estoqueDisponivel < item.quantidade;
                const emFaltaNoConsignado = itensEmFalta.includes(item.id);

                return (
                  <div
                    key={item.id}
                    className={`grid border-bottom pb-4 mb-4 transition-all duration-300 ${emFaltaNoConsignado ? 'border-red-500 bg-red-50' : ''}`}
                  >
                    <div className="col-12 md:col-3 flex justify-content-center">
                      <img
                        src={item.variacao?.produto?.imagem_principal?.url || '/placeholder.jpg'}
                        alt={item.variacao?.nome_completo || 'Produto'}
                        className="shadow-1 border-round"
                        style={{ width: '100%', objectFit: 'cover' }}
                      />
                    </div>

                    <div className="col-12 md:col-9">
                      <div className="font-medium text-lg mb-1">{item.variacao?.nome_completo || 'Produto'}</div>
                      <div className="text-sm text-gray-600 mb-2">{item.variacao?.descricao}</div>

                      {Array.isArray(item.variacao?.atributos) && item.variacao.atributos.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {item.variacao.atributos.map((attr, idx) => (
                            <span key={idx} className="text-sm px-2 py-1 bg-blue-100 border-round">
                              {attr.nome}: {attr.valor}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex align-items-center gap-3 mb-2">
                        <InputNumber
                          value={item.quantidade}
                          min={0}
                          onValueChange={(e) => handleAtualizarQuantidade(item, e.value)}
                          showButtons
                          buttonLayout="horizontal"
                          decrementButtonClassName="p-button-text"
                          incrementButtonClassName="p-button-text"
                          inputStyle={{ width: 60 }}
                        />
                        <Button
                          icon="pi pi-trash"
                          className="p-button-sm p-button-text p-button-danger"
                          onClick={() => {
                            confirmDialog({
                              message: 'Deseja remover este item?',
                              header: 'Remover Item',
                              icon: 'pi pi-exclamation-triangle',
                              acceptLabel: 'Sim',
                              rejectLabel: 'Cancelar',
                              accept: () => removerItem(item.id),
                            });
                          }}
                        />
                      </div>

                      {emFalta && (
                        <div className="text-sm text-red-600 mb-2">
                          Estoque insuficiente: disponível {estoqueDisponivel}
                        </div>
                      )}

                      <div className="flex justify-content-between text-sm text-gray-700">
                        <span>Unit: {formatarValor(item.preco_unitario)}</span>
                        <span>Subtotal: {formatarValor(item.subtotal)}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="col-12 md:col-4">
          <div className="shadow-2 rounded p-4 bg-white sticky top-4">
            <h3 className="text-lg font-semibold mb-3">Resumo do Pedido</h3>
            <div className="flex justify-between mb-2">
              <span className="text-sm">Total de itens: </span>
              <span className="text-sm font-medium">{itens.length}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm">Valor total:</span>
              <span className="text-lg font-bold text-green-700">{formatarValor(total)}</span>
            </div>

            <div className="mt-4 flex flex-column gap-2">
              <Button
                label="Salvar alterações"
                icon="pi pi-save"
                className="p-button-info w-full"
                onClick={handleSalvarAlteracoes}
              />
              <Button
                label="Finalizar Pedido"
                icon="pi pi-check"
                className="p-button-success w-full"
                onClick={handleFinalizar}
                disabled={itens.length === 0}
              />
              <Button
                label="Cancelar Carrinho"
                icon="pi pi-times"
                className="p-button-danger w-full"
                onClick={handleCancelar}
              />
            </div>
          </div>
        </div>
      </div>
    </SakaiLayout>
  );
};

export default FinalizarPedido;
