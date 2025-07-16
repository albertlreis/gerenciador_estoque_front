import React, { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import apiEstoque from '../services/apiEstoque';

const PedidoFabricaForm = ({ visible, onHide, onSave, pedidoEditavel = null }) => {
  const [dataPrevisao, setDataPrevisao] = useState(null);
  const [observacoes, setObservacoes] = useState('');
  const [itens, setItens] = useState([]);
  const [variacoes, setVariacoes] = useState([]);
  const [loading, setLoading] = useState(false);

  const toast = React.useRef(null);

  useEffect(() => {
    buscarVariacoes();
    if (pedidoEditavel) {
      setDataPrevisao(pedidoEditavel.data_previsao_entrega ? new Date(pedidoEditavel.data_previsao_entrega) : null);
      setObservacoes(pedidoEditavel.observacoes || '');
      setItens(pedidoEditavel.itens.map(i => ({
        produto_variacao_id: i.produto_variacao_id,
        quantidade: i.quantidade,
        observacoes: i.observacoes || ''
      })));
    } else {
      setDataPrevisao(null);
      setObservacoes('');
      setItens([]);
    }
  }, [pedidoEditavel]);

  const buscarVariacoes = async () => {
    try {
      const { data } = await apiEstoque.get('/variacoes');
      setVariacoes(data);
    } catch (e) {
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao buscar variações' });
    }
  };

  const adicionarItem = () => {
    setItens([...itens, { produto_variacao_id: null, quantidade: 1, observacoes: '' }]);
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
        itens
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
        header={pedidoEditavel ? 'Editar Pedido Fábrica' : 'Novo Pedido Fábrica'}
        visible={visible}
        onHide={onHide}
        style={{ width: '50vw' }}
        modal
        footer={
          <div>
            <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
            <Button label="Salvar" icon="pi pi-check" onClick={salvar} loading={loading} />
          </div>
        }
      >
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
            <div className="col-6">
              <Dropdown
                value={item.produto_variacao_id}
                options={variacoes.map(v => ({ label: `${v.produto.nome} (${v.atributos.map(a => a.valor).join(', ')})`, value: v.id }))}
                onChange={(e) => atualizarItem(idx, 'produto_variacao_id', e.value)}
                placeholder="Selecione o produto"
                className="w-full"
              />
            </div>
            <div className="col-3">
              <InputText
                type="number"
                value={item.quantidade}
                onChange={(e) => atualizarItem(idx, 'quantidade', parseInt(e.target.value))}
                placeholder="Qtd"
              />
            </div>
            <div className="col-2">
              <Button icon="pi pi-trash" className="p-button-danger p-button-sm" onClick={() => removerItem(idx)} />
            </div>
          </div>
        ))}

        <Button label="Adicionar Item" icon="pi pi-plus" className="p-button-text" onClick={adicionarItem} />
      </Dialog>
    </>
  );
};

export default PedidoFabricaForm;
