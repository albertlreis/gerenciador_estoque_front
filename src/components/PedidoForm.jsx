import React, {useRef, useState, useEffect} from 'react';
import {Calendar} from 'primereact/calendar';
import {Dropdown} from 'primereact/dropdown';
import {InputTextarea} from 'primereact/inputtextarea';
import {InputNumber} from 'primereact/inputnumber';
import {Button} from 'primereact/button';
import {ConfirmPopup, confirmPopup} from 'primereact/confirmpopup';
import {Toast} from 'primereact/toast';
import apiEstoque from '../services/apiEstoque';

const PedidoForm = ({
                      initialData = {},
                      clientes = [],
                      produtos = [],
                      vendedores = [],
                      parceiros = [],
                      statusOptions = [],
                      onSubmit,
                      onCancel
                    }) => {

  const [pedido, setPedido] = useState({
    id_cliente: initialData.id_cliente || initialData.cliente || null,
    data_pedido: initialData.data_pedido ? new Date(initialData.data_pedido) : new Date(),
    status: initialData.status || (statusOptions.length > 0 ? statusOptions[0] : ''),
    observacoes: initialData.observacoes || '',
    itens: initialData.itens || []
  });
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);

  // Atualiza o estado se o initialData mudar (modo edição)
  useEffect(() => {
    setPedido({
      id_cliente: initialData.id_cliente || initialData.cliente || null,
      data_pedido: initialData.data_pedido ? new Date(initialData.data_pedido) : new Date(),
      status: initialData.status || (statusOptions.length > 0 ? statusOptions[0] : ''),
      observacoes: initialData.observacoes || '',
      itens: initialData.itens || []
    });
  }, [initialData, statusOptions]);

  const handleChangeHeader = (field, value) => {
    setPedido(prev => ({...prev, [field]: value}));
  };

  const handleItemChange = (index, field, value) => {
    const itens = [...pedido.itens];
    if (field === 'id_produto') {
      itens[index][field] = value;
      const selectedProduct = produtos.find(p => p.id === value);
      if (selectedProduct) {
        itens[index]['preco_unitario'] = selectedProduct.preco;
      }
    } else {
      itens[index][field] = value;
    }
    setPedido(prev => ({...prev, itens}));
  };

  const handleAddItem = () => {
    const newItem = {id_produto: null, quantidade: 1, preco_unitario: 0};
    setPedido(prev => ({...prev, itens: [...prev.itens, newItem]}));
  };

  // Remoção de item com confirmPopup e requisição ao back, se necessário
  const handleRemoveItem = (e, index) => {
    confirmPopup({
      target: e.currentTarget,
      message: 'Tem certeza que deseja remover este item?',
      icon: 'pi pi-info-circle',
      accept: async () => {
        const item = pedido.itens[index];
        if (item.id && initialData && initialData.id) {
          try {
            await apiEstoque.delete(`/pedidos/${initialData.id}/itens/${item.id}`);
            toast.current.show({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Item removido com sucesso!',
              life: 3000
            });
          } catch (error) {
            console.error('Erro ao remover item:', error.response?.data || error.message);
            toast.current.show({severity: 'error', summary: 'Erro', detail: 'Erro ao remover o item!', life: 3000});
            return;
          }
        }
        const novosItens = [...pedido.itens];
        novosItens.splice(index, 1);
        setPedido(prev => ({...prev, itens: novosItens}));
      }
    });
  };

  // Espera o retorno de onSubmit para manter o loading ativo até que o processo do pai seja concluído
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({...initialData, ...pedido});
    } catch (error) {
      console.error('Erro no envio:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast ref={toast}/>
      <form onSubmit={handleSubmit} className="formgrid grid">
        <h3 className="col-12">Detalhes do Pedido</h3>
        <ConfirmPopup/>
        <div className="field col-12 md:col-4">
          <label htmlFor="id_cliente">Cliente</label>
          <Dropdown
            id="id_cliente"
            value={pedido.id_cliente}
            options={clientes}
            onChange={(e) => handleChangeHeader('id_cliente', e.value)}
            optionLabel="nome"
            optionValue="id"
            placeholder="Selecione um cliente"
            className="w-full"
          />
        </div>

        <div className="field col-12 md:col-4">
          <label htmlFor="data_pedido">Data do Pedido</label>
          <Calendar
            id="data_pedido"
            value={pedido.data_pedido}
            onChange={(e) => handleChangeHeader('data_pedido', e.value)}
            dateFormat="dd/mm/yy"
            className="w-full"
          />
        </div>

        <div className="field col-12 md:col-4">
          <Dropdown
            value={pedido.id_vendedor}
            options={vendedores}
            onChange={(e) => setPedido({...pedido, id_vendedor: e.value})}
            optionLabel="nome"
            placeholder="Selecione um vendedor"
          />
        </div>

        <div className="field col-12 md:col-4">
          <Dropdown
            value={pedido.id_parceiro}
            options={parceiros}
            onChange={(e) => setPedido({...pedido, id_parceiro: e.value})}
            optionLabel="nome"
            placeholder="Selecione um parceiro"
          />
        </div>

        <div className="field col-12 md:col-4">
          <label htmlFor="status">Status</label>
          <Dropdown
            id="status"
            value={pedido.status}
            options={statusOptions.map(s => ({
              label: s.charAt(0).toUpperCase() + s.slice(1),
              value: s
            }))}
            onChange={(e) => handleChangeHeader('status', e.value)}
            placeholder="Selecione o status"
            className="w-full"
          />
        </div>

        <div className="field col-12">
          <label htmlFor="observacoes">Observações</label>
          <InputTextarea
            id="observacoes"
            value={pedido.observacoes}
            onChange={(e) => handleChangeHeader('observacoes', e.target.value)}
            rows={3}
            className="w-full"
          />
        </div>

        <h3 className="col-12">Itens do Pedido</h3>

        {pedido.itens.map((item, index) => (
          <div key={index} className="col-12 border-1 surface-border border-round p-3 mb-3">
            <div className="formgrid grid">
              <div className="field col-12 md:col-4">
                <label htmlFor={`item-${index}-produto`}>Produto</label>
                <Dropdown
                  id={`item-${index}-produto`}
                  value={item.id_produto}
                  options={produtos}
                  onChange={(e) => handleItemChange(index, 'id_produto', e.value)}
                  optionLabel="nome"
                  placeholder="Selecione o produto"
                  optionValue="id"
                  className="w-full"
                />
              </div>

              <div className="field col-12 md:col-3">
                <label htmlFor={`item-${index}-quantidade`}>Quantidade</label>
                <InputNumber
                  id={`item-${index}-quantidade`}
                  value={item.quantidade}
                  onValueChange={(e) => handleItemChange(index, 'quantidade', e.value)}
                  integerOnly
                  min={1}
                  className="w-full"
                />
              </div>

              <div className="field col-12 md:col-3">
                <label htmlFor={`item-${index}-preco`}>Preço Unitário</label>
                <InputNumber
                  id={`item-${index}-preco`}
                  value={item.preco_unitario}
                  onValueChange={(e) => handleItemChange(index, 'preco_unitario', e.value)}
                  mode="currency"
                  currency="BRL"
                  locale="pt-BR"
                  className="w-full"
                />
              </div>

              <div className="field col-12 md:col-1"
                   style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Button
                  type="button"
                  label=""
                  icon="pi pi-times"
                  className="p-button-danger"
                  onClick={(e) => handleRemoveItem(e, index)}
                />
              </div>
            </div>
          </div>
        ))}

        <div className="field col-12">
          <Button
            type="button"
            label="Adicionar Produto"
            icon="pi pi-plus"
            className="p-button-success"
            onClick={handleAddItem}
          />
        </div>

        <div className="field col-12 flex justify-content-end gap-2 mt-2">
          <Button
            label="Salvar Pedido"
            type="submit"
            icon="pi pi-check"
            loading={loading}
            className="p-button-primary"
          />
          <Button
            label="Cancelar"
            type="button"
            className="p-button-secondary"
            onClick={onCancel}
          />
        </div>
      </form>
    </>
  );
};

export default PedidoForm;
