import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import { Toast } from 'primereact/toast';
import ProdutoAutoComplete from './estoque/ProdutoAutoComplete';

const PedidoForm = ({
  initialData = {},
  clientes = [],
  vendedores = [],
  parceiros = [],
  depositos = [],
  onSubmit,
  onCancel,
  permitirSelecionarVendedor = false,
}) => {
  const toast = useRef(null);

  const buildItensFromInitial = (data) =>
    (data?.itens || []).map((item) => ({
      id: item.id,
      id_variacao: item.variacao_id ?? item.id_variacao ?? null,
      produto_id: item.produto_id ?? null,
      nome_produto: item.nome_produto ?? item.variacao?.produto?.nome ?? '-',
      referencia: item.referencia ?? item.variacao?.referencia ?? '-',
      quantidade: Number(item.quantidade) || 1,
      preco_unitario: Number(item.preco_unitario) || 0,
      subtotal: Number(item.subtotal) || 0,
      id_deposito: item.id_deposito ?? null,
      observacoes: item.observacoes ?? '',
    }));

  const [pedido, setPedido] = useState({
    id_cliente: initialData.id_cliente ?? initialData.cliente?.id ?? null,
    id_usuario: initialData.id_usuario ?? initialData.usuario?.id ?? null,
    id_parceiro: initialData.id_parceiro ?? initialData.parceiro?.id ?? null,
    tipo: initialData.tipo ?? 'venda',
    numero_externo: initialData.numero_externo ?? initialData.numero ?? '',
    data_pedido: initialData.data_pedido ? new Date(initialData.data_pedido) : new Date(),
    prazo_dias_uteis: initialData.prazo_dias_uteis ?? 60,
    data_limite_entrega: initialData.data_limite_entrega ? new Date(initialData.data_limite_entrega) : null,
    observacoes: initialData.observacoes ?? '',
    itens: buildItensFromInitial(initialData),
  });

  const [loading, setLoading] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setPedido({
      id_cliente: initialData.id_cliente ?? initialData.cliente?.id ?? null,
      id_usuario: initialData.id_usuario ?? initialData.usuario?.id ?? null,
      id_parceiro: initialData.id_parceiro ?? initialData.parceiro?.id ?? null,
      tipo: initialData.tipo ?? 'venda',
      numero_externo: initialData.numero_externo ?? initialData.numero ?? '',
      data_pedido: initialData.data_pedido ? new Date(initialData.data_pedido) : new Date(),
      prazo_dias_uteis: initialData.prazo_dias_uteis ?? 60,
      data_limite_entrega: initialData.data_limite_entrega ? new Date(initialData.data_limite_entrega) : null,
      observacoes: initialData.observacoes ?? '',
      itens: buildItensFromInitial(initialData),
    });
    setDirty(false);
    setErrors({});
  }, [initialData]);

  const totalPreview = useMemo(
    () => pedido.itens.reduce((sum, i) => sum + (Number(i.quantidade) || 0) * (Number(i.preco_unitario) || 0), 0),
    [pedido.itens]
  );

  const markDirty = () => setDirty(true);

  const handleChangeHeader = (field, value) => {
    markDirty();
    setPedido((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index, field, value) => {
    markDirty();
    const itens = [...pedido.itens];
    itens[index] = { ...itens[index], [field]: value };
    setPedido((prev) => ({ ...prev, itens }));
  };

  const handleAddVariacao = (variacao, produto) => {
    if (!variacao?.id) return;

    const existingIndex = pedido.itens.findIndex((i) => Number(i.id_variacao) === Number(variacao.id));
    if (existingIndex >= 0) {
      const itens = [...pedido.itens];
      itens[existingIndex] = {
        ...itens[existingIndex],
        quantidade: (Number(itens[existingIndex].quantidade) || 0) + 1,
      };
      setPedido((prev) => ({ ...prev, itens }));
      markDirty();
      return;
    }

    const precoBase = Number(variacao.preco) || 0;
    const newItem = {
      id: null,
      id_variacao: variacao.id,
      produto_id: produto?.id ?? variacao.produto_id ?? null,
      nome_produto: produto?.nome ?? variacao.nome_completo ?? variacao.nome ?? '-',
      referencia: variacao.referencia ?? '-',
      quantidade: 1,
      preco_unitario: precoBase,
      subtotal: precoBase,
      id_deposito: null,
      observacoes: '',
    };

    setPedido((prev) => ({ ...prev, itens: [...prev.itens, newItem] }));
    markDirty();
  };

  const handleRemoveItem = (e, index) => {
    confirmPopup({
      target: e.currentTarget,
      message: 'Tem certeza que deseja remover este item?',
      icon: 'pi pi-info-circle',
      accept: () => {
        const novosItens = [...pedido.itens];
        novosItens.splice(index, 1);
        setPedido((prev) => ({ ...prev, itens: novosItens }));
        markDirty();
      },
    });
  };

  const getError = (path) => errors?.[path]?.[0] ?? null;
  const getItemError = (index, field) => getError(`itens.${index}.${field}`);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await onSubmit({ ...initialData, ...pedido });
      setDirty(false);
    } catch (error) {
      const status = error?.response?.status;
      const apiErrors = error?.response?.data?.errors;

      if (status === 422 && apiErrors) {
        setErrors(apiErrors);
        toast.current?.show({
          severity: 'warn',
          summary: 'Validacao',
          detail: 'Revise os campos destacados.',
          life: 4000,
        });
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Erro',
          detail: error?.response?.data?.message || 'Erro ao salvar pedido.',
          life: 4000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (e) => {
    if (!dirty) {
      onCancel?.();
      return;
    }

    confirmPopup({
      target: e.currentTarget,
      message: 'Existem alteracoes nao salvas. Deseja sair mesmo assim?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => onCancel?.(),
    });
  };

  return (
    <>
      <Toast ref={toast} />
      <form onSubmit={handleSubmit} className="formgrid grid">
        <h3 className="col-12">Detalhes do Pedido</h3>
        <ConfirmPopup />

        <div className="field col-12 md:col-4">
          <label htmlFor="numero_externo">Numero do Pedido</label>
          <InputText
            id="numero_externo"
            value={pedido.numero_externo}
            onChange={(e) => handleChangeHeader('numero_externo', e.target.value)}
            className={`w-full ${getError('numero_externo') ? 'p-invalid' : ''}`}
          />
          {getError('numero_externo') && <small className="p-error">{getError('numero_externo')}</small>}
        </div>

        <div className="field col-12 md:col-4">
          <label htmlFor="tipo">Tipo</label>
          <Dropdown
            id="tipo"
            value={pedido.tipo}
            options={[
              { label: 'Venda', value: 'venda' },
              { label: 'Reposicao', value: 'reposicao' },
            ]}
            onChange={(e) => handleChangeHeader('tipo', e.value)}
            className={`w-full ${getError('tipo') ? 'p-invalid' : ''}`}
          />
          {getError('tipo') && <small className="p-error">{getError('tipo')}</small>}
        </div>

        <div className="field col-12 md:col-4">
          <label htmlFor="data_pedido">Data do Pedido</label>
          <Calendar
            id="data_pedido"
            value={pedido.data_pedido}
            onChange={(e) => handleChangeHeader('data_pedido', e.value)}
            dateFormat="dd/mm/yy"
            className={`w-full ${getError('data_pedido') ? 'p-invalid' : ''}`}
          />
          {getError('data_pedido') && <small className="p-error">{getError('data_pedido')}</small>}
        </div>

        <div className="field col-12 md:col-4">
          <label htmlFor="id_cliente">Cliente</label>
          <Dropdown
            id="id_cliente"
            value={pedido.id_cliente}
            options={clientes}
            onChange={(e) => handleChangeHeader('id_cliente', e.value)}
            optionLabel="label"
            optionValue="value"
            placeholder="Selecione um cliente"
            className={`w-full ${getError('id_cliente') ? 'p-invalid' : ''}`}
          />
          {getError('id_cliente') && <small className="p-error">{getError('id_cliente')}</small>}
        </div>

        {permitirSelecionarVendedor && (
          <div className="field col-12 md:col-4">
            <label htmlFor="id_usuario">Vendedor</label>
            <Dropdown
              id="id_usuario"
              value={pedido.id_usuario}
              options={vendedores}
              onChange={(e) => handleChangeHeader('id_usuario', e.value)}
              optionLabel="label"
              optionValue="value"
              placeholder="Selecione um vendedor"
              className={`w-full ${getError('id_usuario') ? 'p-invalid' : ''}`}
            />
            {getError('id_usuario') && <small className="p-error">{getError('id_usuario')}</small>}
          </div>
        )}

        <div className="field col-12 md:col-4">
          <label htmlFor="id_parceiro">Parceiro</label>
          <Dropdown
            id="id_parceiro"
            value={pedido.id_parceiro}
            options={parceiros}
            onChange={(e) => handleChangeHeader('id_parceiro', e.value)}
            optionLabel="label"
            optionValue="value"
            placeholder="Selecione um parceiro"
            className={`w-full ${getError('id_parceiro') ? 'p-invalid' : ''}`}
          />
          {getError('id_parceiro') && <small className="p-error">{getError('id_parceiro')}</small>}
        </div>

        <div className="field col-12 md:col-4">
          <label htmlFor="prazo_dias_uteis">Prazo (dias uteis)</label>
          <InputNumber
            id="prazo_dias_uteis"
            value={pedido.prazo_dias_uteis}
            onValueChange={(e) => handleChangeHeader('prazo_dias_uteis', e.value)}
            min={1}
            className={`w-full ${getError('prazo_dias_uteis') ? 'p-invalid' : ''}`}
          />
          {getError('prazo_dias_uteis') && <small className="p-error">{getError('prazo_dias_uteis')}</small>}
        </div>

        <div className="field col-12 md:col-4">
          <label htmlFor="data_limite_entrega">Entrega prevista</label>
          <Calendar
            id="data_limite_entrega"
            value={pedido.data_limite_entrega}
            onChange={(e) => handleChangeHeader('data_limite_entrega', e.value)}
            dateFormat="dd/mm/yy"
            className={`w-full ${getError('data_limite_entrega') ? 'p-invalid' : ''}`}
          />
          {getError('data_limite_entrega') && <small className="p-error">{getError('data_limite_entrega')}</small>}
        </div>

        <div className="field col-12">
          <label htmlFor="observacoes">Observacoes</label>
          <InputTextarea
            id="observacoes"
            value={pedido.observacoes}
            onChange={(e) => handleChangeHeader('observacoes', e.target.value)}
            rows={3}
            className={`w-full ${getError('observacoes') ? 'p-invalid' : ''}`}
          />
          {getError('observacoes') && <small className="p-error">{getError('observacoes')}</small>}
        </div>

        <h3 className="col-12">Itens do Pedido</h3>

        <div className="col-12 md:col-8">
          <ProdutoAutoComplete
            depositoId={pedido.itens?.[0]?.id_deposito || null}
            onSelectVariacao={handleAddVariacao}
          />
        </div>

        {pedido.itens.map((item, index) => (
          <div key={item.id ?? `${item.id_variacao}-${index}`} className="col-12 border-1 surface-border border-round p-3 mb-3">
            <div className="flex justify-content-between align-items-center mb-2">
              <div>
                <strong>{item.nome_produto || 'Produto'}</strong>
                <div className="text-sm text-500">Ref: {item.referencia || '-'}</div>
              </div>
              <Button
                type="button"
                icon="pi pi-times"
                className="p-button-text p-button-danger"
                onClick={(e) => handleRemoveItem(e, index)}
              />
            </div>

            <div className="formgrid grid">
              <div className="field col-12 md:col-3">
                <label>Quantidade</label>
                <InputNumber
                  value={item.quantidade}
                  onValueChange={(e) => handleItemChange(index, 'quantidade', e.value)}
                  integerOnly
                  min={1}
                  className={`w-full ${getItemError(index, 'quantidade') ? 'p-invalid' : ''}`}
                />
                {getItemError(index, 'quantidade') && (
                  <small className="p-error">{getItemError(index, 'quantidade')}</small>
                )}
              </div>

              <div className="field col-12 md:col-3">
                <label>Preco unitario</label>
                <InputNumber
                  value={item.preco_unitario}
                  onValueChange={(e) => handleItemChange(index, 'preco_unitario', e.value)}
                  mode="currency"
                  currency="BRL"
                  locale="pt-BR"
                  className={`w-full ${getItemError(index, 'preco_unitario') ? 'p-invalid' : ''}`}
                />
                {getItemError(index, 'preco_unitario') && (
                  <small className="p-error">{getItemError(index, 'preco_unitario')}</small>
                )}
              </div>

              <div className="field col-12 md:col-3">
                <label>Deposito</label>
                <Dropdown
                  value={item.id_deposito}
                  options={depositos}
                  onChange={(e) => handleItemChange(index, 'id_deposito', e.value)}
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Selecione"
                  className={`w-full ${getItemError(index, 'id_deposito') ? 'p-invalid' : ''}`}
                />
                {getItemError(index, 'id_deposito') && (
                  <small className="p-error">{getItemError(index, 'id_deposito')}</small>
                )}
              </div>

              <div className="field col-12 md:col-3">
                <label>Subtotal</label>
                <InputNumber
                  value={(Number(item.quantidade) || 0) * (Number(item.preco_unitario) || 0)}
                  mode="currency"
                  currency="BRL"
                  locale="pt-BR"
                  readOnly
                  className="w-full"
                />
              </div>

              <div className="field col-12">
                <label>Observacoes</label>
                <InputTextarea
                  value={item.observacoes}
                  onChange={(e) => handleItemChange(index, 'observacoes', e.target.value)}
                  rows={2}
                  className={`w-full ${getItemError(index, 'observacoes') ? 'p-invalid' : ''}`}
                />
                {getItemError(index, 'observacoes') && (
                  <small className="p-error">{getItemError(index, 'observacoes')}</small>
                )}
              </div>
            </div>
          </div>
        ))}

        <div className="col-12 flex justify-content-end">
          <div className="text-right">
            <div className="text-sm text-500">Total (preview)</div>
            <div className="text-lg font-semibold">{totalPreview.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
          </div>
        </div>

        <div className="field col-12 flex justify-content-end gap-2 mt-2">
          <Button
            label="Salvar Pedido"
            type="submit"
            icon="pi pi-check"
            loading={loading}
            className="p-button-primary"
            disabled={loading}
          />
          <Button
            label="Cancelar"
            type="button"
            className="p-button-secondary"
            onClick={handleCancel}
            disabled={loading}
          />
        </div>
      </form>
    </>
  );
};

export default PedidoForm;
