import React from 'react';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import ProdutoAutoComplete from './ProdutoAutoComplete';

export default function ToolbarLeitura({
                                         mode, setMode,
                                         tipo, setTipo,
                                         depositos, depositoId, setDepositoId,
                                         origemId, setOrigemId,
                                         destinoId, setDestinoId,
                                         useCamera, setUseCamera,
                                         qtdRapida, setQtdRapida,
                                         autoResetQtd, setAutoResetQtd,
                                         qtdRef, inputRef,
                                         toast, itens, totalPecas, lastScan,
                                         setShowBulk, finalizarLote, askClearAll,
                                       }) {
  const TIPO_OPCOES = [
    { label: 'Entrada', value: 'entrada' },
    { label: 'Saída', value: 'saida' },
  ];

  return (
    <>
      {/* Linha 1 */}
      <div className="grid align-items-end mb-2">
        <div className="col-12 sm:col-6 lg:col-3">
          <Button
            label={mode === 'transfer' ? 'Modo: TRANSFERÊNCIA (F3)' : 'Modo: NORMAL (F3)'}
            icon={mode === 'transfer' ? 'pi pi-external-link' : 'pi pi-bars'}
            className={(mode === 'transfer' ? 'p-button-warning' : 'p-button-secondary') + ' w-full'}
            onClick={() => setMode(mode === 'transfer' ? 'normal' : 'transfer')}
          />
        </div>
        <div className="col-12 sm:col-6 lg:col-3">
          <Button
            label={useCamera ? 'Câmera: ON (F8)' : 'Câmera: OFF (F8)'}
            icon="pi pi-camera"
            className={(useCamera ? '' : 'p-button-outlined') + ' w-full'}
            onClick={() => setUseCamera(!useCamera)}
          />
        </div>

        {mode === 'transfer' ? (
          <>
            <div className="col-12 md:col-6 lg:col-3">
              <label className="text-sm mb-1 block">Origem</label>
              <Dropdown
                value={origemId}
                options={depositos}
                onChange={(e) => setOrigemId(e.value)}
                placeholder="Origem"
                className="w-full"
              />
            </div>
            <div className="col-12 md:col-6 lg:col-3">
              <label className="text-sm mb-1 block">Destino</label>
              <Dropdown
                value={destinoId}
                options={depositos.filter((d) => d.value !== origemId)}
                onChange={(e) => setDestinoId(e.value)}
                placeholder="Destino"
                className="w-full"
              />
            </div>
          </>
        ) : (
          <>
            <div className="col-12 md:col-6 lg:col-3">
              <label className="text-sm mb-1 block">Depósito</label>
              <Dropdown
                value={depositoId}
                options={depositos}
                onChange={(e) => setDepositoId(e.value)}
                className="w-full"
              />
            </div>
            <div className="col-12 md:col-6 lg:col-3">
              <label className="text-sm mb-1 block">Operação</label>
              <Dropdown
                value={tipo}
                options={TIPO_OPCOES}
                onChange={(e) => setTipo(e.value)}
                className="w-full"
              />
            </div>
          </>
        )}
      </div>

      {/* Linha 2: Quantidade e busca */}
      <div className="grid mb-2">
        <div className="col-12 md:col-5 lg:col-4 xl:col-3">
          <label className="text-sm mb-1 block">
            Qtd rápida <span className="text-xs text-color-secondary">(F6/F7)</span>
          </label>
          <InputNumber
            inputRef={qtdRef}
            value={qtdRapida}
            onValueChange={(e) => setQtdRapida(e.value || 1)}
            showButtons
            buttonLayout="horizontal"
            decrementButtonIcon="pi pi-minus"
            incrementButtonIcon="pi pi-plus"
            min={1}
            max={99999}
            inputClassName="w-7rem text-center"
          />
          <div className="flex align-items-center gap-2 md:flex-row mt-1">
            <Checkbox
              inputId="autoResetQtd"
              checked={autoResetQtd}
              onChange={(e) => setAutoResetQtd(e.checked)}
            />
            <label htmlFor="autoResetQtd" className="text-xs">
              Auto-reset após usar
            </label>
          </div>
        </div>

        <div className="col-12 md:col-7 lg:col-8 xl:col-9">
          <label className="text-sm mb-1 block">Leitura (escaneie, busque ou digite)</label>
          <ProdutoAutoComplete
            depositoId={mode === 'transfer' ? origemId : depositoId}
            onSelectVariacao={(variacao, produto) => {
              console.log('🟡 onSelectVariacao RECEBIDO no Toolbar:', { variacao, produto });

              if (!depositoId && mode !== 'transfer') {
                console.warn('⚠️ Depósito não selecionado (modo normal). Abortando.');
                toast.current?.show({
                  severity: 'warn',
                  summary: 'Depósito',
                  detail: 'Selecione um depósito antes de buscar produtos.',
                });
                return;
              }

              const item = {
                variacao_id: variacao.id,
                codigo_barras: variacao.codigo_barras,
                referencia: variacao.referencia,
                nome: variacao.nome_completo ?? produto?.nome ?? 'Produto sem nome',
                estoque_atual:
                  variacao.estoque_atual ??
                  variacao.estoque?.quantidade ??
                  variacao.estoque_total ??
                  0,
              };

              console.log('🟡 Disparando evento produto-adicionado com item=', item);
              const evt = new CustomEvent('produto-adicionado', { detail: item });
              window.dispatchEvent(evt);
            }}
          />
        </div>
      </div>

      {/* Linha 3: Botões */}
      <div className="grid mb-2">
        <div className="col-12">
          <div className="flex gap-2 flex-wrap lg:flex-nowrap justify-content-start md:justify-content-end">
            <Button
              label="Colar lista"
              icon="pi pi-clipboard"
              onClick={() => setShowBulk(true)}
              className="p-button-help w-full sm:w-auto"
            />
            <Button
              label="Finalizar (F9)"
              icon="pi pi-check"
              severity="success"
              onClick={finalizarLote}
              disabled={!itens.length}
              className="w-full sm:w-auto"
            />
            <Button
              label="Limpar (F4)"
              icon="pi pi-trash"
              severity="danger"
              onClick={askClearAll}
              disabled={!itens.length}
              className="w-full sm:w-auto"
            />
          </div>
        </div>
      </div>

      {/* Linha 4: indicadores */}
      <div className="flex flex-wrap align-items-center gap-2 mb-2">
        <Tag value={`Itens: ${itens.length}`} rounded />
        <Tag severity="info" value={`Peças: ${totalPecas}`} rounded />
        {lastScan && (
          <Tag
            severity="success"
            value={`Último: ${lastScan.codigo_barras || lastScan.referencia}`}
            rounded
            icon="pi pi-check"
          />
        )}
        <span className="text-sm text-color-secondary">
          Atalhos: <b>F2</b> Entrada/Saída · <b>F3</b> Normal/Transferência ·{' '}
          <b>F4</b> limpar · <b>F6/F7</b> Qtd rápida · <b>Shift+F7</b> zera ·{' '}
          <b>F8</b> câmera · <b>Ctrl+Z</b> desfaz · <b>F9</b> finaliza
        </span>
      </div>
    </>
  );
}
