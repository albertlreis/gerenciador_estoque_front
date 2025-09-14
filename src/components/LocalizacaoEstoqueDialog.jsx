import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import apiEstoque from '../services/apiEstoque';

/**
 * @typedef {Object} Props
 * @property {boolean} visible - Controle de visibilidade do dialog principal.
 * @property {() => void} onHide - Callback ao fechar o dialog principal.
 * @property {number|null} estoqueId - ID do estoque associado.
 * @property {number|null} localizacaoId - ID da localização (edição) ou null (novo).
 * @property {React.RefObject} toastRef - Ref do Toast para mensagens.
 * @property {() => void} [onSaveSuccess] - Callback após salvar com sucesso.
 */

/**
 * Dialog de Localização de Estoque com criação inline de Áreas.
 * @param {Props} props
 */
const LocalizacaoEstoqueDialog = ({ visible, onHide, estoqueId, localizacaoId, toastRef, onSaveSuccess }) => {
  /** @type {[{id:number|null,setor:string,coluna:string,nivel:string,area_id:number|null,observacoes:string,dimensoes:Object}, Function]} */
  const [form, setForm] = useState({
    id: null,
    setor: '',
    coluna: '',
    nivel: '',
    area_id: null,
    observacoes: '',
    dimensoes: {}
  });

  /** Lista de áreas no formato PrimeReact Dropdown: { label, value } */
  const [areas, setAreas] = useState([]);
  /** Dimensões dinâmicas (mantidas para futuro; hoje pode vir vazio) */
  const [dimensoes, setDimensoes] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingDialog, setLoadingDialog] = useState(false);

  // Estado do modal "Nova Área"
  const [showAreaDialog, setShowAreaDialog] = useState(false);
  const [areaNome, setAreaNome] = useState('');
  const [savingArea, setSavingArea] = useState(false);

  const disableLoc = !!form.area_id; // desabilita campos físicos quando há área selecionada

  useEffect(() => {
    if (visible && estoqueId) {
      carregarLookup();
      if (localizacaoId) carregarLocalizacao();
      else resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, estoqueId, localizacaoId]);

  /**
   * Reseta o formulário (novo registro)
   * @returns {void}
   */
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

  /**
   * Busca listas auxiliares: áreas e dimensões (se existirem)
   * @returns {Promise<void>}
   */
  const carregarLookup = async () => {
    try {
      const [areasRes, dimsRes] = await Promise.all([
        apiEstoque.get('/estoque/areas'),
        apiEstoque.get('/estoque/dimensoes')
      ]);

      setAreas(
        (areasRes.data?.data ?? areasRes.data ?? [])
          .map((a) => ({ label: a.nome, value: a.id }))
      );

      setDimensoes(dimsRes.data?.data ?? dimsRes.data ?? []);
    } catch (e) {
      toastRef.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar áreas/dimensões' });
    }
  };

  /**
   * Carrega dados de uma localização existente
   * @returns {Promise<void>}
   */
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
    } catch (e) {
      toastRef.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar localização' });
    } finally {
      setLoadingDialog(false);
    }
  };

  /**
   * Salva a localização (create/update)
   * @returns {Promise<void>}
   */
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
    } catch (e) {
      toastRef.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao salvar localização' });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handler para mudança em campos físicos (Setor/Coluna/Nível).
   * - Se começar a digitar localização, limpa a área (mantendo exclusividade).
   * @param {'setor'|'coluna'|'nivel'} field
   * @param {string} value
   */
  const onChangeLocal = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      area_id: value ? null : prev.area_id,
    }));
  };

  /**
   * Seleciona uma área; ao selecionar, limpa os campos físicos e desabilita-os.
   * @param {number|null} value
   */
  const onSelectArea = (value) => {
    setForm((prev) => ({
      ...prev,
      area_id: value,
      setor: value ? '' : prev.setor,
      coluna: value ? '' : prev.coluna,
      nivel: value ? '' : prev.nivel,
    }));
  };

  /**
   * Abre o diálogo de Nova Área
   */
  const abrirAreaDialog = () => {
    setAreaNome('');
    setShowAreaDialog(true);
  };

  /**
   * Fecha o diálogo de Nova Área
   */
  const fecharAreaDialog = () => {
    setShowAreaDialog(false);
  };

  /**
   * Cria uma nova área via API e seleciona-a no formulário principal.
   * @returns {Promise<void>}
   */
  const salvarNovaArea = async () => {
    if (!areaNome || !areaNome.trim()) {
      toastRef.current?.show({ severity: 'warn', summary: 'Validação', detail: 'Informe o nome da área.' });
      return;
    }

    setSavingArea(true);
    try {
      // Rotas existentes: POST /v1/estoque/areas  payload: { nome }
      const { data } = await apiEstoque.post('/estoque/areas', { nome: areaNome.trim() });

      const nova = data?.data ?? data; // compatível com Resource ou array simples
      const novoOption = { label: nova.nome, value: nova.id };

      setAreas((prev) => {
        const jaExiste = prev.some((a) => a.value === novoOption.value);
        return jaExiste ? prev : [...prev, novoOption].sort((a, b) => a.label.localeCompare(b.label));
      });

      // Seleciona a nova área e limpa os campos físicos
      setForm((prev) => ({
        ...prev,
        area_id: novoOption.value,
        setor: '',
        coluna: '',
        nivel: ''
      }));

      toastRef.current?.show({ severity: 'success', summary: 'Área criada', detail: `“${nova.nome}” adicionada.` });
      fecharAreaDialog();
    } catch (e) {
      toastRef.current?.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível criar a área.' });
    } finally {
      setSavingArea(false);
    }
  };

  const headerRight = (
    <div className="flex gap-2 items-center">
      {(form.setor || form.coluna || form.nivel) && !disableLoc ? (
        <Tag value={`${form.setor || '-'}-${(form.coluna || '-')}${form.nivel || ''}`} />
      ) : null}
    </div>
  );

  return (
    <>
      {/* Dialog principal */}
      <Dialog header="Localização do Estoque" visible={visible} onHide={onHide} modal style={{ width: '600px' }}>
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
                <div className="flex justify-between items-end gap-2">
                  <div className="w-full">
                    <label>Área</label>
                    <Dropdown
                      value={form.area_id}
                      onChange={(e) => onSelectArea(e.value)}
                      options={areas}
                      placeholder="Selecione a área (opcional)"
                      showClear
                      filter
                      className="w-full"
                    />
                  </div>
                  <div className="mt-4">
                    <Button
                      type="button"
                      icon="pi pi-plus"
                      className="p-button-sm p-button-secondary"
                      onClick={abrirAreaDialog}
                    />
                  </div>
                </div>
              </div>

              {dimensoes.map((d) => (
                <div key={d.id} className="col-12 md:col-6">
                  <label>{d.nome}</label>
                  <InputText
                    value={form.dimensoes[d.id] ?? ''}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, dimensoes: { ...prev.dimensoes, [d.id]: e.target.value } }))
                    }
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

      {/* Dialog secundário: criação de nova área */}
      <Dialog
        header="Nova área"
        visible={showAreaDialog}
        onHide={fecharAreaDialog}
        modal
        style={{ width: '480px' }}
      >
        <div className="p-fluid">
          <div className="field">
            <label>Nome da área</label>
            <InputText
              value={areaNome}
              onChange={(e) => setAreaNome(e.target.value)}
              placeholder="Ex.: Assistência, Avarias..."
              autoFocus
            />
          </div>

          <div className="flex justify-content-end mt-3">
            <Button
              type="button"
              label="Cancelar"
              icon="pi pi-times"
              className="p-button-text"
              onClick={fecharAreaDialog}
              disabled={savingArea}
            />
            <Button
              type="button"
              label="Salvar"
              icon="pi pi-check"
              onClick={salvarNovaArea}
              loading={savingArea}
            />
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default LocalizacaoEstoqueDialog;
