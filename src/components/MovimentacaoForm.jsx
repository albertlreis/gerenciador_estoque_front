import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';

const MovimentacaoForm = ({ initialData = {}, onSubmit, onCancel }) => {
  const [movimentacao, setMovimentacao] = useState({
    id_deposito_origem: initialData.id_deposito_origem || '',
    id_deposito_destino: initialData.id_deposito_destino || '',
    tipo: initialData.tipo || '',
    quantidade: initialData.quantidade || 0,
    observacao: initialData.observacao || '',
    data_movimentacao: initialData.data_movimentacao || '',
  });
  const [loading, setLoading] = useState(false);

  // Exemplo estático de opções; em produção, você pode buscar essas opções via API.
  const depositoOptions = [
    { label: 'Depósito A', value: 1 },
    { label: 'Depósito B', value: 2 },
  ];

  const handleChange = (field, value) => {
    setMovimentacao({ ...movimentacao, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(movimentacao);
    } catch (error) {
      console.error('Erro no processamento do formulário:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-fluid p-formgrid p-grid" style={{ gap: '1rem' }}>
      {/* Depósito de Origem */}
      <div className="p-field p-col-12 p-md-6">
        <label htmlFor="id_deposito_origem">Depósito Origem</label>
        <Dropdown
          id="id_deposito_origem"
          value={movimentacao.id_deposito_origem}
          options={depositoOptions}
          onChange={(e) => handleChange('id_deposito_origem', e.value)}
          placeholder="Selecione o depósito de origem"
        />
      </div>
      {/* Depósito de Destino */}
      <div className="p-field p-col-12 p-md-6">
        <label htmlFor="id_deposito_destino">Depósito Destino</label>
        <Dropdown
          id="id_deposito_destino"
          value={movimentacao.id_deposito_destino}
          options={depositoOptions}
          onChange={(e) => handleChange('id_deposito_destino', e.value)}
          placeholder="Selecione o depósito de destino"
        />
      </div>
      {/* Tipo */}
      <div className="p-field p-col-12 p-md-6">
        <label htmlFor="tipo">Tipo</label>
        <InputText id="tipo" value={movimentacao.tipo} onChange={(e) => handleChange('tipo', e.target.value)} />
      </div>
      {/* Quantidade */}
      <div className="p-field p-col-12 p-md-6">
        <label htmlFor="quantidade">Quantidade</label>
        <InputText id="quantidade" type="number" value={movimentacao.quantidade} onChange={(e) => handleChange('quantidade', e.target.value)} />
      </div>
      {/* Observação */}
      <div className="p-field p-col-12">
        <label htmlFor="observacao">Observação</label>
        <InputText id="observacao" value={movimentacao.observacao} onChange={(e) => handleChange('observacao', e.target.value)} />
      </div>
      {/* Data da Movimentação */}
      <div className="p-field p-col-12 p-md-6">
        <label htmlFor="data_movimentacao">Data da Movimentação</label>
        <Calendar id="data_movimentacao" value={movimentacao.data_movimentacao} onChange={(e) => handleChange('data_movimentacao', e.value)} dateFormat="dd/mm/yy" />
      </div>
      {/* Botões */}
      <div className="p-field p-col-12" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
        <Button label="Salvar" type="submit" icon="pi pi-check" loading={loading} className="p-mr-2" />
        <Button label="Cancelar" type="button" icon="pi pi-times" className="p-button-secondary" onClick={onCancel} style={{ marginLeft: '0.5rem' }} />
      </div>
    </form>
  );
};

export default MovimentacaoForm;
