import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { useState, useRef } from 'react';
import { Toast } from 'primereact/toast';

const ParceiroForm = ({ initialData = {}, onSubmit, onCancel }) => {
  const [parceiro, setParceiro] = useState({
    nome: initialData.nome || '',
    email: initialData.email || '',
    telefone: initialData.telefone || ''
  });
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(parceiro);
    } catch (error) {
      console.error('Erro ao salvar parceiro:', error);
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao salvar parceiro', life: 3000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <form onSubmit={handleSubmit} className="formgrid grid">
        <div className="field col-12 md:col-6">
          <label htmlFor="nome">Nome</label>
          <InputText
            id="nome"
            value={parceiro.nome}
            onChange={(e) => setParceiro({ ...parceiro, nome: e.target.value })}
            required
            className="w-full"
          />
        </div>

        <div className="field col-12 md:col-6">
          <label htmlFor="email">Email</label>
          <InputText
            id="email"
            value={parceiro.email}
            onChange={(e) => setParceiro({ ...parceiro, email: e.target.value })}
            required
            className="w-full"
          />
        </div>

        <div className="field col-12 md:col-6">
          <label htmlFor="telefone">Telefone</label>
          <InputText
            id="telefone"
            value={parceiro.telefone}
            onChange={(e) => setParceiro({ ...parceiro, telefone: e.target.value })}
            className="w-full"
          />
        </div>

        <div className="field col-12 flex justify-content-end gap-2 mt-2">
          <Button
            label="Salvar"
            type="submit"
            icon="pi pi-check"
            loading={loading}
            className="p-button-primary"
          />
          <Button
            label="Cancelar"
            type="button"
            icon="pi pi-times"
            className="p-button-secondary"
            onClick={onCancel}
          />
        </div>
      </form>
    </>
  );
};

export default ParceiroForm;
