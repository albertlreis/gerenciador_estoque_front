import React, { useEffect, useState, useRef } from 'react';
import { useCarrinho } from '../context/CarrinhoContext';
import { useNavigate, useParams } from 'react-router-dom';
import { InputTextarea } from 'primereact/inputtextarea';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import SakaiLayout from '../layouts/SakaiLayout';
import api from '../services/apiEstoque';
import { useAuth } from '../context/AuthContext';
import { PERFIS } from '../constants/perfis';
import apiAuth from '../services/apiAuth';

import ResumoPedidoCard from '../components/ResumoPedidoCard';
import ItemPedidoCard from '../components/ItemPedidoCard';
import SelecionarEntidades from '../components/SelecionarEntidades';
import ConsignacaoSection from '../components/ConsignacaoSection';
import { formatarValor } from '../utils/formatters';

const FinalizarPedido = () => {
  const { user } = useAuth();
  const isAdmin = user?.perfis?.includes(PERFIS.ADMINISTRADOR.slug);

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

  const fetchVendedores = async () => {
    try {
      const { data } = await apiAuth.get('/usuarios/vendedores');
      setVendedores(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao buscar vendedores:', error);
      setVendedores([]);
    }
  };

  const fetchClientes = async () => {
    const { data } = await api.get('/clientes');
    setClientes(data);
  };

  const fetchParceiros = async () => {
    const { data } = await api.get('/parceiros');
    setParceiros(data);
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

    try {
      const resultado = await finalizarPedido({
        id_parceiro: carrinhoAtual?.id_parceiro,
        observacoes,
        modo_consignacao: modoConsignacao,
        prazo_consignacao: prazoConsignacao,
        id_usuario: isAdmin ? idVendedorSelecionado : carrinhoAtual?.id_usuario,
        depositos_por_item: itens.map(item => ({
          id_carrinho_item: item.id,
          id_deposito: item.id_deposito || null
        }))
      });

      if (resultado?.success) {
        toast.current.show({
          severity: 'success',
          summary: 'Pedido finalizado!',
          detail: 'Pedido criado com sucesso.',
        });
        navigate('/pedidos');
      } else {
        toast.current.show({
          severity: 'error',
          summary: 'Erro ao finalizar pedido',
          detail: resultado?.message || 'Não foi possível criar o pedido.',
          life: 5000,
        });
      }
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

  const total = formatarValor(itens.reduce((sum, item) => sum + Number(item.subtotal || 0), 0));

  return (
    <SakaiLayout>
      <Toast ref={toast} />
      <ConfirmDialog />

      {loading ? (
        <div className="flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
          <ProgressSpinner />
        </div>
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
