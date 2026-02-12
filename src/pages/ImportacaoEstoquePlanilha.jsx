import React, { useMemo, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FileUpload } from 'primereact/fileupload';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import SakaiLayout from '../layouts/SakaiLayout';
import apiEstoque from '../services/apiEstoque';
import { ESTOQUE_ENDPOINTS } from '../constants/endpointsEstoque';

const toArray = (value) => (Array.isArray(value) ? value : []);

const parseErroRows = (payload) =>
  toArray(payload?.erros).map((item) => ({
    linha: item?.linha ?? '-',
    nome: item?.nome || '-',
    referencia: item?.referencia || '-',
    categoria: item?.categoria || '-',
    status: item?.status || '-',
    erros: toArray(item?.erros).join(' | '),
    warnings: toArray(item?.warnings).join(' | '),
  }));

const resumoFromResponse = (payload) => {
  const data = payload?.data || {};
  const resumo = payload?.resumo || data?.resumo || data;
  return {
    total_linhas: resumo?.total_linhas ?? data?.linhas_total ?? 0,
    linhas_validas: resumo?.linhas_validas ?? data?.linhas_validas ?? 0,
    linhas_invalidas: resumo?.linhas_invalidas ?? data?.linhas_invalidas ?? 0,
    produtos_criados: resumo?.produtos_criados ?? 0,
    variacoes_criadas: resumo?.variacoes_criadas ?? 0,
    registros_atualizados: resumo?.registros_atualizados ?? 0,
    movimentacoes_criadas: resumo?.movimentacoes_criadas ?? 0,
    outlets_criados: resumo?.outlets_criados ?? 0,
    fornecedores_criados: resumo?.fornecedores_criados ?? 0,
    layout: data?.metricas?.layout || resumo?.layout || '-',
  };
};

const ImportacaoEstoquePlanilha = () => {
  const toast = useRef(null);
  const [arquivo, setArquivo] = useState(null);
  const [importacaoId, setImportacaoId] = useState(null);

  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingConfirm, setLoadingConfirm] = useState(false);

  const [resumo, setResumo] = useState(null);
  const [erroRows, setErroRows] = useState([]);
  const [previewExecutada, setPreviewExecutada] = useState(false);

  const loading = loadingUpload || loadingPreview || loadingConfirm;

  const resumoCards = useMemo(() => {
    if (!resumo) return [];
    return [
      { label: 'Total de linhas', value: resumo.total_linhas },
      { label: 'Linhas válidas', value: resumo.linhas_validas },
      { label: 'Linhas inválidas', value: resumo.linhas_invalidas },
      { label: 'Produtos criados', value: resumo.produtos_criados },
      { label: 'Variações criadas', value: resumo.variacoes_criadas },
      { label: 'Atualizados', value: resumo.registros_atualizados },
      { label: 'Movimentações', value: resumo.movimentacoes_criadas },
      { label: 'Outlets criados', value: resumo.outlets_criados },
      { label: 'Fornecedores criados', value: resumo.fornecedores_criados },
    ];
  }, [resumo]);

  const showError = (message) => {
    toast.current?.show({
      severity: 'error',
      summary: 'Erro',
      detail: message || 'Falha ao processar importação.',
      life: 5000,
    });
  };

  const handleUpload = async () => {
    if (!arquivo) {
      showError('Selecione uma planilha .xlsx ou .xls.');
      return;
    }

    setLoadingUpload(true);
    try {
      const formData = new FormData();
      formData.append('arquivo', arquivo);

      const { data } = await apiEstoque.post(
        ESTOQUE_ENDPOINTS.importacoesEstoque.base,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      const importId = data?.data?.import_id;
      setImportacaoId(importId);
      setResumo(resumoFromResponse(data));
      setErroRows(parseErroRows(data));
      setPreviewExecutada(false);

      toast.current?.show({
        severity: 'success',
        summary: 'Upload concluído',
        detail: `Arquivo em staging${importId ? ` (#${importId})` : ''}.`,
        life: 3500,
      });
    } catch (error) {
      showError(error?.response?.data?.message || 'Falha no upload da planilha.');
    } finally {
      setLoadingUpload(false);
    }
  };

  const processar = async (dryRun) => {
    if (!importacaoId) {
      showError('Faça o upload antes de processar.');
      return;
    }

    if (dryRun) setLoadingPreview(true);
    else setLoadingConfirm(true);

    try {
      const endpoint = ESTOQUE_ENDPOINTS.importacoesEstoque.processar(importacaoId);
      const { data } = await apiEstoque.post(endpoint, null, {
        params: { dry_run: dryRun ? 1 : 0 },
      });

      setResumo(resumoFromResponse(data));
      setErroRows(parseErroRows(data));
      if (dryRun) setPreviewExecutada(true);

      toast.current?.show({
        severity: 'success',
        summary: dryRun ? 'Prévia concluída' : 'Importação concluída',
        detail: dryRun
          ? 'Validação executada sem persistir dados.'
          : 'Dados importados com sucesso.',
        life: 3500,
      });
    } catch (error) {
      const payload = error?.response?.data;
      if (payload?.erros) {
        setErroRows(parseErroRows(payload));
      }
      showError(payload?.erro || payload?.message || 'Falha ao processar importação.');
    } finally {
      if (dryRun) setLoadingPreview(false);
      else setLoadingConfirm(false);
    }
  };

  return (
    <SakaiLayout>
      <Toast ref={toast} />

      <div className="p-4 md:p-6">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold m-0">Importação de Estoque (Dev)</h1>
          <p className="text-600 mt-2 mb-0">
            Upload de planilha com prévia (`dry_run`) e confirmação final. Acesso restrito a desenvolvedor.
          </p>
        </div>

        <Card className="mb-4">
          <div className="flex flex-column md:flex-row gap-3 md:align-items-end">
            <div className="flex-1">
              <label className="block mb-2 font-medium">Planilha</label>
              <FileUpload
                mode="basic"
                accept=".xlsx,.xls"
                maxFileSize={10 * 1024 * 1024}
                chooseLabel={arquivo ? arquivo.name : 'Selecionar planilha'}
                customUpload
                auto={false}
                onSelect={(e) => setArquivo(e.files?.[0] || null)}
                onClear={() => setArquivo(null)}
              />
            </div>

            <div className="flex gap-2">
              <Button
                label="Enviar para staging"
                icon="pi pi-upload"
                onClick={handleUpload}
                loading={loadingUpload}
                disabled={loading}
              />
              <Button
                label="Validar / Prévia"
                icon="pi pi-search"
                onClick={() => processar(true)}
                loading={loadingPreview}
                disabled={!importacaoId || loading}
                severity="secondary"
              />
              <Button
                label="Confirmar importação"
                icon="pi pi-check"
                onClick={() => processar(false)}
                loading={loadingConfirm}
                disabled={!importacaoId || loading || !previewExecutada}
                severity="success"
              />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {importacaoId && <Tag value={`Importação #${importacaoId}`} />}
            {resumo?.layout && <Tag value={`Layout: ${resumo.layout}`} severity="info" />}
            {previewExecutada && <Tag value="Prévia executada" severity="warning" />}
          </div>
        </Card>

        {!!resumoCards.length && (
          <div className="grid mb-4">
            {resumoCards.map((item) => (
              <div key={item.label} className="col-12 md:col-6 lg:col-4 xl:col-3">
                <Card>
                  <div className="text-sm text-500">{item.label}</div>
                  <div className="text-2xl font-semibold mt-2">{item.value ?? 0}</div>
                </Card>
              </div>
            ))}
          </div>
        )}

        <Card title="Erros e avisos da planilha">
          <DataTable
            value={erroRows}
            paginator
            rows={10}
            rowsPerPageOptions={[10, 25, 50]}
            emptyMessage="Nenhum erro encontrado."
            responsiveLayout="scroll"
          >
            <Column field="linha" header="Linha" style={{ width: '90px' }} />
            <Column field="referencia" header="Referência" />
            <Column field="nome" header="Nome" />
            <Column field="categoria" header="Categoria" />
            <Column field="status" header="Status" />
            <Column field="erros" header="Erros" />
            <Column field="warnings" header="Warnings" />
          </DataTable>
        </Card>
      </div>
    </SakaiLayout>
  );
};

export default ImportacaoEstoquePlanilha;

