import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import apiEstoque from '../services/apiEstoque';

/**
 * Dialog de Localização
 * - Exclusividade: OU Área OU Localização física (parcial).
 * - Ao selecionar Área, desabilita os campos físicos.
 */
const LocalizacaoEstoqueDialog = ({ visible, onHide, estoqueId, localizacaoId, toastRef, onSaveSuccess }) => {
  const [form, setForm] = useState({
    id: null,
    setor: '',
    coluna: '',
    nivel: '',
    area_id: null,
    observacoes: '',
    dimensoes: {}
  });

  const [areas, setAreas] = useState([]);
  const [dimensoes, setDimensoes] = useState([]); // mantemos para futuro
  const [loading, setLoading] = useState(false);
  const [loadingDialog, setLoadingDialog] = useState(false);

  const disableLoc = !!form.area_id; // desabilita Setor/Coluna/Nível quando há Área

  useEffect(() => {
    if (visible && estoqueId) {
      carregarLookup();
      if (localizacaoId) carregarLocalizacao();
      else resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, estoqueId, localizacaoId]);

  const resetForm = () => {
    setForm({
      id: null,
      setor: '',
      coluna: '',
      nivel: '',
      area_id: null,
      observacoes: '',
      dimensoes: {}
    });
  };

  const carregarLookup = async () => {
    try {
      const [areasRes, dimsRes] = await Promise.all([
        apiEstoque.get('/estoque/areas'),
        apiEstoque.get('/estoque/dimensoes')
      ]);
      setAreas(areasRes.data?.data?.map(a => ({ label: a.nome, value: a.id })) ?? []);
      setDimensoes(dimsRes.data?.data ?? []);
    } catch {
      toastRef.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar áreas/dimensões' });
    }
  };

  const carregarLocalizacao = async () => {
    setLoadingDialog(true);
    try {
      const { data } = await apiEstoque.get(`/localizacoes-estoque/${localizacaoId}`);
      const loc = data?.data ?? data;
      const dimVals = {};
      (loc?.dimensoes ?? []).forEach((d) => { dimVals[d.dimensao_id] = d.valor; });

      setForm({
        id: loc.id,
        setor: loc.setor ?? '',
        coluna: loc.coluna ?? '',
        nivel: loc.nivel ?? '',
        area_id: loc.area?.id ?? loc.area_id ?? null,
        observacoes: loc.observacoes ?? '',
        dimensoes: dimVals
      });
    } catch {
      toastRef.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar localização' });
    } finally {
      setLoadingDialog(false);
    }
  };

  const salvar = async () => {
    setLoading(true);
    try {
      const payload = {
        estoque_id: estoqueId,
        setor: disableLoc ? null : (form.setor || null),
        coluna: disableLoc ? null : (form.coluna || null),
        nivel: disableLoc ? null : (form.nivel || null),
        area_id: form.area_id,
        observacoes: form.observacoes || null,
        dimensoes: form.dimensoes
      };

      if (form.id) {
        await apiEstoque.put(`/localizacoes-estoque/${form.id}`, payload);
        toastRef.current?.show({ severity: 'success', summary: 'Atualizado', detail: 'Localização atualizada' });
      } else {
        await apiEstoque.post('/localizacoes-estoque', payload);
        toastRef.current?.show({ severity: 'success', summary: 'Criado', detail: 'Localização registrada' });
      }
      onSaveSuccess?.();
      onHide();
    } catch {
      toastRef.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao salvar localização' });
    } finally {
      setLoading(false);
    }
  };

  const onChangeLocal = (field, value) => {
    // Se começar a digitar localização, limpa a área (opcional UX; mantém exclusividade na prática)
    setForm((prev) => ({
      ...prev,
      [field]: value,
      area_id: value ? null : prev.area_id,
    }));
  };

  const onSelectArea = (value) => {
    setForm((prev) => ({
      ...prev,
      area_id: value,
      // ao escolher área, limpamos os físicos para evitar conflito no backend
      setor: value ? '' : prev.setor,
      coluna: value ? '' : prev.coluna,
      nivel: value ? '' : prev.nivel,
    }));
  };

  const headerRight = (
    <div className="flex gap-2 items-center">
      {(form.setor || form.coluna || form.nivel) && !disableLoc ? (
        <Tag value={`${form.setor || '-'}-${(form.coluna || '-')}${form.nivel || ''}`} />
      ) : null}
    </div>
  );

  return (
    <Dialog header="Localização do Estoque" visible={visible} onHide={onHide} modal style={{ width: '560px' }}>
      {loadingDialog ? (
        <div className="flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
          <i className="pi pi-spin pi-spinner text-3xl" />
        </div>
      ) : (
        <div className="p-fluid">
          <div className="grid">
            <div className="col-12 md:col-4">
              <label>Setor</label>
              <InputText value={form.setor} onChange={(e) => onChangeLocal('setor', e.target.value)} disabled={disableLoc} />
            </div>
            <div className="col-12 md:col-4">
              <label>Coluna</label>
              <InputText value={form.coluna} onChange={(e) => onChangeLocal('coluna', e.target.value)} disabled={disableLoc} />
            </div>
            <div className="col-12 md:col-4">
              <div className="flex justify-between items-center">
                <label>Nível</label>
                {!disableLoc && headerRight}
              </div>
              <InputText value={form.nivel} onChange={(e) => onChangeLocal('nivel', e.target.value)} disabled={disableLoc} />
            </div>

            <div className="col-12 md:col-12">
              <label>Área</label>
              <Dropdown
                value={form.area_id}
                onChange={(e) => onSelectArea(e.value)}
                options={areas}
                placeholder="Selecione a área (opcional)"
                showClear
              />
            </div>

            {dimensoes.map((d) => (
              <div key={d.id} className="col-12 md:col-6">
                <label>{d.nome}</label>
                <InputText
                  value={form.dimensoes[d.id] ?? ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, dimensoes: { ...prev.dimensoes, [d.id]: e.target.value } }))}
                  placeholder={d.placeholder || ''}
                  disabled={false}
                />
              </div>
            ))}

            <div className="col-12">
              <label>Observações</label>
              <InputTextarea
                value={form.observacoes}
                onChange={(e) => setForm((prev) => ({ ...prev, observacoes: e.target.value }))}
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-content-end mt-3">
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={onHide} disabled={loading} />
            <Button label="Salvar" icon="pi pi-check" onClick={salvar} loading={loading} autoFocus />
          </div>
        </div>
      )}
    </Dialog>
  );
};

export default LocalizacaoEstoqueDialog;
