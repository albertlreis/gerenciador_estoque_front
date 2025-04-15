import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

const DepositoForm = ({ initialData = {}, onSubmit, onCancel }) => {
  const [deposito, setDeposito] = useState({
    nome: initialData.nome || '',
    endereco: initialData.endereco || '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setDeposito({ ...deposito, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(deposito);
    } catch (error) {
      console.error('Erro no processamento do formulário:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-fluid p-formgrid p-grid" style={{ gap: '1rem' }}>
      {/* Campo Nome */}
      <div className="p-field p-col-12">
        <label htmlFor="nome">Nome</label>
        <InputText id="nome" value={deposito.nome} onChange={(e) => handleChange('nome', e.target.value)} />
      </div>
      {/* Campo Endereço */}
      <div className="p-field p-col-12">
        <label htmlFor="endereco">Endereço</label>
        <InputText id="endereco" value={deposito.endereco} onChange={(e) => handleChange('endereco', e.target.value)} />
      </div>
      {/* Botões */}
      <div className="p-field p-col-12" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
        <Button label="Salvar" type="submit" icon="pi pi-check" loading={loading} className="p-mr-2" />
        <Button label="Cancelar" type="button" icon="pi pi-times" className="p-button-secondary" onClick={onCancel} style={{ marginLeft: '0.5rem' }} />
      </div>
    </form>
  );
};

export default DepositoForm;
