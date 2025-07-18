import React, { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import api from '../services/apiEstoque';

export default function DialogDevolucao({ pedido, onHide, onSucesso }) {
  const [visible, setVisible] = useState(true);
  const [tipo, setTipo] = useState(null);
  const [motivo, setMotivo] = useState('');
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = React.useRef(null);

  useEffect(() => {
    const listener = (e) => {
      if (e.detail?.id === pedido?.id) {
        setVisible(true);
      }
    };
    window.addEventListener('abrir-dialog-devolucao', listener);
    return () => window.removeEventListener('abrir-dialog-devolucao', listener);
  }, [pedido]);

  useEffect(() => {
    if (pedido?.itens) {
      const trocadosIds = new Set(
        pedido.devolucoes
          ?.filter((dev) => dev.tipo === 'troca')
          .flatMap((dev) => dev.itens.map((item) => item.pedido_item_id))
      );

      setItens(
        pedido.itens.map((item) => ({
          ...item,
          devolve: false,
          quantidade: 1,
          trocas: [],
          variacoesDisponiveis: [],
          jaTrocado: trocadosIds.has(item.id)
        }))
      );
    }
  }, [pedido]);

  const carregarVariacoes = async (item, idx) => {
    try {
      const { data } = await api.get(`/produtos/${item.produto_id}/variacoes`);
      const novas = [...itens];
      novas[idx].variacoesDisponiveis = data.data;
      setItens(novas);
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro ao carregar variações',
        detail: err.response?.data?.message || err.message,
      });
    }
  };

  const handleTrocaChange = (idx, novaTroca) => {
    const novas = [...itens];
    novas[idx].trocas = novaTroca;
    setItens(novas);
  };

  const enviar = async () => {
    const selecionados = itens.filter((i) => i.devolve);
    if (!tipo || !motivo || selecionados.length === 0) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Preencha todos os campos obrigatórios',
      });
      return;
    }

    for (const item of selecionados) {
      if (item.jaTrocado) {
        toast.current?.show({
          severity: 'warn',
          summary: 'Item já foi trocado',
          detail: `O item "${item.nome_produto}" já foi trocado anteriormente e não pode ser trocado novamente.`,
        });
        return;
      }

      const totalTrocado = quantidadeTrocada(item.trocas);
      if (tipo === 'troca' && totalTrocado > item.quantidade) {
        toast.current?.show({
          severity: 'warn',
          summary: 'Quantidade trocada excede a comprada',
          detail: `O item "${item.nome_produto}" não pode ser trocado por uma quantidade maior que ${item.quantidade}.`,
        });
        return;
      }
    }

    const payload = {
      pedido_id: pedido.id,
      tipo,
      motivo,
      itens: selecionados.map((i) => ({
        pedido_item_id: i.id,
        quantidade: i.quantidade,
        trocas:
          tipo === 'troca'
            ? i.trocas.map((t) => ({
              nova_variacao_id: t.variacao?.id,
              quantidade: t.quantidade,
              preco_unitario: t.variacao?.preco,
            }))
            : [],
      })),
    };

    try {
      setLoading(true);
      await api.post('/devolucoes', payload);
      onSucesso?.();
      setVisible(false);
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro ao salvar',
        detail: err.response?.data?.message || err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const quantidadeTrocada = (trocas) => {
    return trocas.reduce((total, t) => total + (t.quantidade || 0), 0);
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header="Solicitar Devolução ou Troca"
        visible={visible}
        onHide={onHide}
        modal
        style={{ width: '70vw' }}
        footer={
          <div className="flex justify-content-end gap-2">
            <Button label="Cancelar" icon="pi pi-times" onClick={onHide} disabled={loading} />
            <Button label="Confirmar" icon="pi pi-check" onClick={enviar} loading={loading} />
          </div>
        }
      >
        <div className="mb-3">
          <label className="block mb-1 font-medium">Tipo</label>
          <Dropdown
            value={tipo}
            options={[
              { label: 'Troca por outro produto', value: 'troca' },
              { label: 'Crédito em loja', value: 'credito' },
            ]}
            onChange={(e) => setTipo(e.value)}
            placeholder="Selecione o tipo de devolução"
            className="w-full"
          />
        </div>

        <div className="mb-3">
          <label className="block mb-1 font-medium">Motivo</label>
          <InputTextarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={3}
            className="w-full"
            autoResize
            placeholder="Descreva o motivo da devolução ou troca"
          />
        </div>

        <h4 className="mb-2">Itens do Pedido</h4>
        {itens.map((item, idx) => (
          <div
            key={idx}
            className={`mb-3 border-2 p-3 border-round surface-border ${
              item.jaTrocado
                ? 'border-yellow-500'
                : item.devolve && tipo === 'troca' && quantidadeTrocada(item.trocas) > item.quantidade
                  ? 'border-red-500'
                  : ''
            }`}
          >
            <div className="flex align-items-center justify-content-between mb-2">
              <div className="flex align-items-center gap-3">
                <img
                  src={item.imagem ?? '/placeholder.jpg'}
                  alt={item.nome_produto}
                  style={{
                    width: '60px',
                    height: '60px',
                    objectFit: 'cover',
                    borderRadius: '6px',
                  }}
                />
                <div>
                  <div className="font-semibold">{item.nome_produto}</div>
                  <div className="text-sm text-gray-600">Ref: {item.referencia}</div>
                  <div className="text-sm text-gray-600">Qtd: {item.quantidade}</div>
                  {item.jaTrocado && (
                    <div className="mt-2 text-sm text-yellow-800 font-medium">
                      ⚠ Este item já foi trocado anteriormente.
                    </div>
                  )}
                </div>
              </div>
              <div className="flex align-items-center gap-2">
                <input
                  type="checkbox"
                  checked={item.devolve}
                  disabled={item.jaTrocado}
                  onChange={(e) => {
                    const novos = [...itens];
                    novos[idx].devolve = e.target.checked;
                    if (e.target.checked && tipo === 'troca') carregarVariacoes(item, idx);
                    setItens(novos);
                  }}
                />
                <label className="text-sm">Devolver</label>
              </div>
            </div>

            {item.devolve && (
              <div className="pl-3 mt-2">
                <label className="block text-sm mb-1">Quantidade a devolver</label>
                <InputNumber
                  value={item.quantidade}
                  min={1}
                  max={item.quantidade}
                  onValueChange={(e) => {
                    const novos = [...itens];
                    novos[idx].quantidade = e.value;
                    setItens(novos);
                  }}
                />

                {quantidadeTrocada(item.trocas) > item.quantidade && (
                  <div className="mt-1 text-red-600 text-sm">
                    ⚠ A quantidade trocada excede a quantidade comprada ({item.quantidade})
                  </div>
                )}

                {tipo === 'troca' && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium mb-1">Itens para Troca</label>
                    {item.trocas.map((troca, i) => (
                      <div key={i} className="mb-2 flex gap-2 align-items-center">
                        <Dropdown
                          value={troca.variacao}
                          options={item.variacoesDisponiveis}
                          optionLabel="nome_completo"
                          placeholder="Selecione a nova variação"
                          onChange={(e) => {
                            const novas = [...item.trocas];
                            novas[i].variacao = e.value;
                            handleTrocaChange(idx, novas);
                          }}
                          className="w-6"
                        />
                        <InputNumber
                          value={troca.quantidade}
                          min={1}
                          className="w-2"
                          onValueChange={(e) => {
                            const novas = [...item.trocas];
                            novas[i].quantidade = e.value;
                            handleTrocaChange(idx, novas);
                          }}
                        />
                        <Button
                          icon="pi pi-trash"
                          severity="danger"
                          text
                          onClick={() => {
                            const novas = item.trocas.filter((_, j) => j !== i);
                            handleTrocaChange(idx, novas);
                          }}
                        />
                      </div>
                    ))}
                    <Button
                      label="Adicionar item de troca"
                      icon="pi pi-plus"
                      text
                      size="small"
                      onClick={() => {
                        const novas = [...item.trocas, { variacao: null, quantidade: 1 }];
                        handleTrocaChange(idx, novas);
                      }}
                      disabled={item.jaTrocado}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </Dialog>
    </>
  );
}
