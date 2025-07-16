import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import apiEstoque from '../services/apiEstoque';

const LocalizacaoEstoqueDialog = ({ visible, onHide, estoqueId, localizacaoId, toastRef, onSaveSuccess }) => {
  const [localizacao, setLocalizacao] = useState({
    id: null,
    corredor: '',
    prateleira: '',
    coluna: '',
    nivel: '',
    observacoes: ''
  });

  const [loading, setLoading] = useState(false);
  const [loadingDialog, setLoadingDialog] = useState(false);

  useEffect(() => {
    if (visible && estoqueId) {
      if (localizacaoId) {
        carregarLocalizacao();
      } else {
        setLocalizacao({
          id: null,
          corredor: '',
          prateleira: '',
          coluna: '',
          nivel: '',
          observacoes: ''
        });
      }
    }
  }, [visible, estoqueId, localizacaoId]);

  const carregarLocalizacao = async () => {
    setLoadingDialog(true);
    try {
      const { data } = await apiEstoque.get(`/localizacoes-estoque/${estoqueId}`);
      setLocalizacao({
        id: data.id,
        corredor: data.corredor || '',
        prateleira: data.prateleira || '',
        coluna: data.coluna || '',
        nivel: data.nivel || '',
        observacoes: data.observacoes || ''
      });
    } catch (error) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao carregar localização',
        life: 3000,
      });
    } finally {
      setLoadingDialog(false);
    }
  };

  const salvar = async () => {
    setLoading(true);
    try {
      const payload = { ...localizacao, estoque_id: estoqueId };

      if (localizacao.id) {
        await apiEstoque.put(`/localizacoes-estoque/${localizacao.id}`, payload);
        toastRef.current?.show({ severity: 'success', summary: 'Atualizado', detail: 'Localização atualizada' });
      } else {
        await apiEstoque.post('/localizacoes-estoque', payload);
        toastRef.current?.show({ severity: 'success', summary: 'Criado', detail: 'Localização registrada' });
      }
      onSaveSuccess?.();
      onHide();
    } catch (error) {
      toastRef.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao salvar localização' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setLocalizacao((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog header="Localização do Estoque" visible={visible} onHide={onHide} modal style={{ width: '500px' }}>
      {loadingDialog ? (
        <div className="flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
          <i className="pi pi-spin pi-spinner text-3xl" />
        </div>
      ) : (
        <div className="p-fluid">
          <div className="field">
            <label>Corredor</label>
            <InputText value={localizacao.corredor} onChange={(e) => handleChange('corredor', e.target.value)}/>
          </div>
          <div className="field">
            <label>Prateleira</label>
            <InputText value={localizacao.prateleira} onChange={(e) => handleChange('prateleira', e.target.value)}/>
          </div>
          <div className="field">
            <label>Coluna</label>
            <InputText value={localizacao.coluna} onChange={(e) => handleChange('coluna', e.target.value)}/>
          </div>
          <div className="field">
            <label>Nível</label>
            <InputText value={localizacao.nivel} onChange={(e) => handleChange('nivel', e.target.value)}/>
          </div>
          <div className="field">
            <label>Observações</label>
            <InputTextarea value={localizacao.observacoes} onChange={(e) => handleChange('observacoes', e.target.value)}
                           rows={3}/>
          </div>
          <div className="flex justify-content-end mt-3">
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={onHide} disabled={loading}/>
            <Button label="Salvar" icon="pi pi-check" onClick={salvar} loading={loading} autoFocus/>
          </div>
        </div>
      )}
    </Dialog>
  );
};

export default LocalizacaoEstoqueDialog;
