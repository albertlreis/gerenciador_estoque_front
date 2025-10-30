import React, { useState, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { ConfirmPopup } from 'primereact/confirmpopup';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import apiEstoque from '../../services/apiEstoque';

import ImportacaoUpload from './ImportacaoUpload';
import ImportacaoTabela from './ImportacaoTabela';
import ImportacaoDialogs from './ImportacaoDialogs';
import AtributosEditor from './AtributosEditor';

export default function ImportacaoProdutoXML() {
  const [nota, setNota] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [deposito, setDeposito] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingUpload, setLoadingUpload] = useState(false);

  // dialogs
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [dialogAtributosVisible, setDialogAtributosVisible] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const [tokenXml, setTokenXml] = useState(null);

  const toast = useRef(null);

  /** Upload do XML */
  const handleUpload = async ({ files }) => {
    const formData = new FormData();
    formData.append('arquivo', files[0]);
    setLoadingUpload(true);

    try {
      const { data } = await apiEstoque.post('/produtos/importar-xml', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setTokenXml(data.token_xml);

      const produtosNormalizados = (data.produtos || []).map((p, idx) => ({
        ...p,
        atributos: Array.isArray(p.atributos)
          ? p.atributos.map(a => ({ atributo: a.atributo, valor: a.valor }))
          : [],
        __key: `${p.descricao_xml || ''}|${p.referencia || ''}|${idx}`,
      }));

      setNota(data.nota || null);
      setProdutos(produtosNormalizados);

      toast.current?.show({
        severity: 'success',
        summary: 'XML importado',
        detail: `NF ${data.nota?.numero ?? ''} carregada com ${produtosNormalizados.length} item(ns). Revise antes de confirmar.`,
        life: 5000,
      });
    } catch (e) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro ao importar',
        detail: e?.response?.data?.message || 'Falha ao importar o arquivo XML.',
        life: 5000,
      });
    } finally {
      setLoadingUpload(false);
    }
  };

  /** Confirma importação */
  const handleConfirm = async (dataEntrada) => {
    setShowConfirmDialog(false);
    setLoading(true);

    try {
      const payload = {
        nota,
        produtos,
        deposito_id: deposito,
        token_xml: tokenXml,
        data_entrada: dataEntrada,
      };

      const { data } = await apiEstoque.post('/produtos/importar-xml/confirmar', payload);

      toast.current?.show({
        severity: 'success',
        summary: 'Importação concluída',
        detail: data?.message || 'Produtos importados com sucesso!',
        life: 5000,
      });

      // limpa estado
      setProdutos([]);
      setNota(null);
      setDeposito(null);
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro ao confirmar',
        detail:
          err?.response?.data?.message ||
          'Falha ao confirmar importação. Verifique os dados e tente novamente.',
        life: 6000,
      });
    } finally {
      setLoading(false);
    }
  };

  /** Verifica e abre confirmação */
  const abrirConfirmacao = () => {
    if (!deposito) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Depósito obrigatório',
        detail: 'Selecione o depósito de destino antes de confirmar.',
        life: 4000,
      });
      return;
    }

    const produtosInvalidos = produtos.filter(p => !p.id_categoria || !p.referencia);
    if (produtosInvalidos.length > 0) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Campos obrigatórios',
        detail: `${produtosInvalidos.length} produto(s) sem categoria ou referência.`,
        life: 5000,
      });
      return;
    }

    if (produtos.length === 0) {
      toast.current?.show({
        severity: 'info',
        summary: 'Nenhum produto',
        detail: 'Nenhum item a confirmar.',
      });
      return;
    }

    setShowConfirmDialog(true);
  };

  return (
    <div className="p-fluid">
      <Toast ref={toast} />
      <ConfirmDialog />
      <ConfirmPopup />

      {(loading || loadingUpload) && (
        <div className="fixed inset-0 bg-white/60 flex items-center justify-center z-50">
          <ProgressSpinner style={{ width: 60, height: 60 }} />
        </div>
      )}

      {/* Upload + Seleção depósito */}
      <ImportacaoUpload
        nota={nota}
        deposito={deposito}
        produtos={produtos}
        onUpload={handleUpload}
        onDepositoChange={setDeposito}
        loadingUpload={loadingUpload}
      />

      {/* Tabela de produtos */}
      {produtos.length > 0 && (
        <ImportacaoTabela
          produtos={produtos}
          setProdutos={setProdutos}
          onEditAtributos={produto => {
            setProdutoSelecionado(produto);
            setDialogAtributosVisible(true);
          }}
        />
      )}

      {/* Modal de atributos */}
      <Dialog
        header={`Atributos - ${produtoSelecionado?.descricao_final || produtoSelecionado?.descricao_xml || ''}`}
        visible={dialogAtributosVisible}
        modal
        style={{ width: '90vw', maxWidth: '850px' }}
        onHide={() => setDialogAtributosVisible(false)}
      >
        {produtoSelecionado && (
          <AtributosEditor
            value={produtoSelecionado.atributos || []}
            toast={toast}
            onChange={novoAtributos => {
              setProdutoSelecionado(prev => ({ ...prev, atributos: novoAtributos }));
              setProdutos(prev =>
                prev.map(p =>
                  p.__key === produtoSelecionado.__key ? { ...p, atributos: novoAtributos } : p
                )
              );
            }}
          />
        )}
        <div className="flex justify-end mt-3">
          <Button
            label="Fechar"
            icon="pi pi-check"
            onClick={() => setDialogAtributosVisible(false)}
          />
        </div>
      </Dialog>

      {/* Diálogo de confirmação */}
      <ImportacaoDialogs
        visible={showConfirmDialog}
        nota={nota}
        onHide={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirm}
      />

      {/* Rodapé de status */}
      {produtos.length > 0 && (
        <div className="bg-white border-t px-4 py-3 mt-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex flex-wrap gap-2 items-center">
              <Tag value={`Itens: ${produtos.length}`} />
              <Tag
                value={`Novos: ${produtos.filter(p => !p.variacao_id && !p.variacao_id_manual).length}`}
                severity="warning"
              />
              <Tag
                value={`Vinculados: ${produtos.filter(p => p.variacao_id || p.variacao_id_manual).length}`}
                severity="success"
              />
            </div>
            <Button
              label="Confirmar importação"
              icon="pi pi-save"
              className="p-button-success"
              onClick={abrirConfirmacao}
              disabled={loading}
            />
          </div>
        </div>
      )}
    </div>
  );
}
