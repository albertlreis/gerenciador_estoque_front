import React, { useEffect, useState, useRef } from 'react';
import { useCarrinho } from '../context/CarrinhoContext';
import { useNavigate, useParams } from 'react-router-dom';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import SakaiLayout from '../layouts/SakaiLayout';
import api from '../services/apiEstoque';
import { useAuth } from '../context/AuthContext';
import apiAuth from '../services/apiAuth';

import ResumoPedidoCard from '../components/ResumoPedidoCard';
import ItemPedidoCard from '../components/ItemPedidoCard';
import SelecionarEntidades from '../components/SelecionarEntidades';
import ConsignacaoSection from '../components/ConsignacaoSection';
import LocalizacoesModal from '../components/LocalizacoesModal';
import { formatarValor } from '../utils/formatters';
import FinalizarPedidoSkeleton from "../components/skeletons/FinalizarPedidoSkeleton";
import {PERMISSOES} from "../constants/permissoes";

const FinalizarPedido = () => {
  const { user } = useAuth();
  const isAdmin = user?.permissoes?.includes(PERMISSOES.SELECIONAR_VENDEDOR);

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
  const [depositosPorItem, setDepositosPorItem] = useState({});
  const [vendedores, setVendedores] = useState([]);
  const [idVendedorSelecionado, setIdVendedorSelecionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mostrarLocModal, setMostrarLocModal] = useState(false);
  const [itemLocSelecionado, setItemLocSelecionado] = useState(null);

  useEffect(() => {
    const carregarTudo = async () => {
      try {
        setLoading(true);
        await carregarCarrinho(id);
        await fetchClientes();
        await fetchParceiros();
        if (isAdmin) await fetchVendedores();
      } finally {
        setLoading(false);
      }
    };
    carregarTudo();
  }, [id]);

  useEffect(() => {
    if (isAdmin && carrinhoAtual?.id_usuario) {
      setIdVendedorSelecionado(carrinhoAtual.id_usuario);
    }
  }, [isAdmin, carrinhoAtual]);

  useEffect(() => {
    if (itens.length > 0) carregarDepositosParaItens();
  }, [itens]);

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

  const carregarDepositosParaItens = async () => {
    try {
      const promises = itens.map(item =>
        api.get(`/estoque/por-variacao/${item.id_variacao}`)
          .then(res => ({ itemId: item.id, data: res.data }))
          .catch(() => ({ itemId: item.id, data: [] }))
      );
      const resultados = await Promise.all(promises);
      const mapeado = resultados.reduce((acc, { itemId, data }) => {
        acc[itemId] = data;
        return acc;
      }, {});
      setDepositosPorItem(mapeado);
    } catch (err) {
      console.error('Erro ao carregar depósitos por item', err);
    }
  };

  const toArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (payload == null) return [];
    // tente formatos comuns: {data: [...]}, {results: [...]}, {dados: {results: [...]}}
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.results)) return payload.results;
    if (payload.dados && Array.isArray(payload.dados.results)) return payload.dados.results;
    return [];
  };

  const fetchVendedores = async () => {
    try {
      const { data } = await apiAuth.get('/usuarios/vendedores');
      setVendedores(toArray(data));
    } catch (error) {
      console.error('Erro ao buscar vendedores:', error);
      setVendedores([]);
    }
  };

  const fetchClientes = async () => {
    try {
      const { data } = await api.get('/clientes');
      setClientes(toArray(data));
    } catch (e) {
      console.error('Erro ao buscar clientes:', e);
      setClientes([]);
    }
  };

  const fetchParceiros = async () => {
    try {
      const { data } = await api.get('/parceiros');
      setParceiros(toArray(data));
    } catch (e) {
      console.error('Erro ao buscar parceiros:', e);
      setParceiros([]);
    }
  };

  const verificarEstoqueInsuficiente = () => {
    return itens.filter(item => (item.variacao?.estoque_total ?? 0) < item.quantidade);
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

  const handleAtualizarDeposito = async (itemId, idDeposito) => {
    try {
      await api.post('/carrinho-itens/atualizar-deposito', {
        id_carrinho_item: itemId,
        id_deposito: idDeposito
      });
      await carregarCarrinho(id);
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Não foi possível atualizar o depósito.',
      });
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

    const depositosPayload = itens.map(item => ({
      id_carrinho_item: item.id,
      id_deposito: item.id_deposito || null
    }));

    confirmDialog({
      message: 'Deseja registrar a movimentação de estoque agora?',
      header: 'Confirmar movimentação',
      icon: 'pi pi-box',
      acceptLabel: 'Sim, movimentar',
      rejectLabel: 'Não, apenas reservar',
      accept: async () => {
        try {
          const resultado = await finalizarPedido({
            id_parceiro: carrinhoAtual?.id_parceiro,
            observacoes,
            modo_consignacao: modoConsignacao,
            prazo_consignacao: prazoConsignacao,
            id_usuario: isAdmin ? idVendedorSelecionado : carrinhoAtual?.id_usuario,
            depositos_por_item: depositosPayload,
            registrar_movimentacao: true,
          });

          if (resultado?.success) {
            toast.current.show({ severity: 'success', summary: 'Pedido finalizado', detail: 'Movimentação registrada.' });
            navigate('/pedidos');
          } else {
            toast.current.show({ severity: 'error', summary: 'Erro ao finalizar', detail: resultado?.message || 'Falha ao registrar movimentação.' });
          }
        } catch (err) {
          showApiErrors(err);
        }
      },
      reject: async () => {
        try {
          const resultado = await finalizarPedido({
            id_parceiro: carrinhoAtual?.id_parceiro,
            observacoes,
            modo_consignacao: modoConsignacao,
            prazo_consignacao: prazoConsignacao,
            id_usuario: isAdmin ? idVendedorSelecionado : carrinhoAtual?.id_usuario,
            depositos_por_item: depositosPayload,
            registrar_movimentacao: false,
          });

          if (resultado?.success) {
            toast.current.show({
              severity: 'success',
              summary: 'Pedido finalizado',
              detail: 'Itens reservados no depósito selecionado.',
            });

            // Abre o modal de localizações do primeiro item (sugestão)
            const primeiro = itens[0];
            setItemLocSelecionado(primeiro);
            setMostrarLocModal(true);
          } else {
            toast.current.show({ severity: 'error', summary: 'Erro ao finalizar', detail: resultado?.message || 'Falha ao reservar itens.' });
          }
        } catch (err) {
          showApiErrors(err);
        }
      }
    });
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

  const total = formatarValor(itens.reduce((sum, item) => sum + Number(item.subtotal || 0), 0));

  const showApiErrors = (err) => {
    const errors = err?.response?.data?.errors;
    const message = err?.response?.data?.message;
    if (errors && typeof errors === 'object') {
      const list = Object.values(errors).flat().filter(Boolean);
      if (list.length) {
        toast.current?.show({
          severity: 'error',
          summary: 'Não foi possível finalizar',
          detail: list.slice(0, 3).join(' | '),
          life: 7000,
        });
        return;
      }
    }
    toast.current?.show({
      severity: 'error',
      summary: 'Erro',
      detail: message || 'Falha ao finalizar pedido.',
      life: 6000,
    });
  };

  const abrirLocalizacoes = (item) => {
    setItemLocSelecionado(item);
    setMostrarLocModal(true);
  };

  return (
    <SakaiLayout>
      <Toast ref={toast} />
      <ConfirmDialog />

      <LocalizacoesModal
        visible={mostrarLocModal}
        onHide={() => setMostrarLocModal(false)}
        item={itemLocSelecionado}
        depositos={itemLocSelecionado ? (depositosPorItem[itemLocSelecionado.id] || []) : []}
      />

      {loading ? (
        <FinalizarPedidoSkeleton />
      ) : (
        <div className="grid p-4">
          <div className="col-12 md:col-8">
            <h2 className="text-xl font-bold mb-4">Finalizar Pedido</h2>

            <SelecionarEntidades
              isAdmin={isAdmin}
              vendedores={vendedores}
              clientes={clientes}
              parceiros={parceiros}
              carrinhoAtual={carrinhoAtual}
              idVendedorSelecionado={idVendedorSelecionado}
              setIdVendedorSelecionado={setIdVendedorSelecionado}
              onAtualizarCarrinho={atualizarCarrinho}
              toast={toast}
            />

            <ConsignacaoSection
              modoConsignacao={modoConsignacao}
              prazoConsignacao={prazoConsignacao}
              setModoConsignacao={setModoConsignacao}
              setPrazoConsignacao={setPrazoConsignacao}
              verificarEstoqueInsuficiente={verificarEstoqueInsuficiente}
              setItensEmFalta={setItensEmFalta}
              toast={toast}
            />

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
                itens.map((item) => (
                  <ItemPedidoCard
                    key={item.id}
                    item={item}
                    emFalta={(item.variacao?.estoque_total ?? 0) < item.quantidade}
                    emFaltaNoConsignado={itensEmFalta.includes(item.id)}
                    depositosDisponiveis={depositosPorItem[item.id] || []}
                    onAtualizarQuantidade={handleAtualizarQuantidade}
                    onRemoverItem={removerItem}
                    onAtualizarDeposito={handleAtualizarDeposito}
                    onVerLocalizacao={abrirLocalizacoes}
                  />
                ))
              )}
            </div>
          </div>

          <div className="col-12 md:col-4">
            <ResumoPedidoCard
              total={total}
              quantidadeItens={itens.length}
              onSalvar={handleSalvarAlteracoes}
              onFinalizar={handleFinalizar}
              onCancelar={handleCancelar}
            />
          </div>
        </div>
      )}
    </SakaiLayout>
  );
};

export default FinalizarPedido;
