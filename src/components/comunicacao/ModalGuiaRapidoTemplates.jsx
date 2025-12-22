import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

export default function ModalGuiaRapidoTemplates({ visible, onHide }) {
  const footer = (
    <div className="flex justify-content-end gap-2">
      <Button label="Entendi" icon="pi pi-check" className="p-button-sm" onClick={onHide} />
    </div>
  );

  return (
    <Dialog
      header="Guia rápido • Templates"
      visible={visible}
      onHide={onHide}
      footer={footer}
      modal
      draggable={false}
      style={{ width: 'min(920px, 96vw)' }}
      contentStyle={{ maxHeight: '70vh', overflow: 'auto' }}
    >
      <div className="text-sm">
        <p style={{ marginTop: 0 }}>
          Este guia te ajuda a entender <b>como editar templates</b> sem se perder.
        </p>

        <h4 className="mt-3 mb-2">1) Informações básicas</h4>
        <ul className="m-0 pl-3">
          <li><b>Nome</b>: nome interno para organização.</li>
          <li><b>Código</b>: identificador único usado pelos sistemas (ex: <code>password_reset</code>).</li>
          <li><b>Canal</b>: define o canal (Email / SMS / WhatsApp).</li>
          <li><b>Ativo</b>: ativo pode ser usado nos envios; inativo apenas desabilita o uso.</li>
        </ul>

        <h4 className="mt-3 mb-2">2) Versões</h4>
        <ul className="m-0 pl-3">
          <li>O seletor <b>Versões</b> mostra o histórico do template.</li>
          <li>A versão marcada como <b>atual</b> é a que será usada nos envios.</li>
          <li><b>Carregar no editor</b> só copia o conteúdo da versão para o editor (não salva automaticamente).</li>
        </ul>

        <h4 className="mt-3 mb-2">3) Conteúdo (versão)</h4>
        <ul className="m-0 pl-3">
          <li><b>Assunto</b>: apenas para Email.</li>
          <li><b>Corpo</b>: conteúdo da mensagem. Email pode usar HTML; SMS/WhatsApp é texto.</li>
          <li><b>Variáveis</b>: descreve as variáveis permitidas (JSON).</li>
        </ul>

        <div className="p-2 mt-2" style={{ background: 'var(--surface-50)', border: '1px solid var(--surface-200)', borderRadius: 8 }}>
          <div className="font-semibold mb-1">⚠️ Importante</div>
          <div>
            Ao salvar, se você alterar <b>body</b>, <b>subject</b> ou <b>variables_schema</b>, o sistema cria uma <b>nova versão</b>.
          </div>
        </div>

        <h4 className="mt-3 mb-2">4) Meta (JSON)</h4>
        <ul className="m-0 pl-3">
          <li>Campo opcional para configurações extras (ex: categoria, layout, flags).</li>
          <li>Não muda o texto enviado; é mais para organização/parametrização.</li>
        </ul>

        <h4 className="mt-3 mb-2">5) Preview</h4>
        <ol className="m-0 pl-3">
          <li>Preencha <b>Preview vars</b> com um JSON de teste.</li>
          <li>Clique em <b>Preview</b>.</li>
          <li>Veja o resultado em <b>Resultado preview</b>.</li>
        </ol>

        <div className="p-2 mt-3" style={{ background: 'var(--yellow-50)', border: '1px solid var(--yellow-200)', borderRadius: 8 }}>
          <div className="font-semibold mb-1">Dica rápida</div>
          <div>
            Para reaproveitar uma versão antiga: selecione a versão ➜ <b>Carregar no editor</b> ➜ ajuste ➜ <b>Salvar</b>.
          </div>
        </div>
      </div>
    </Dialog>
  );
}
