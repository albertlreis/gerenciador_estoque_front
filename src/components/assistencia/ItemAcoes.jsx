import React, { useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import { Toast } from 'primereact/toast';

import DialogEnvio from './dialogs/DialogEnvio';
import DialogOrcamento from './dialogs/DialogOrcamento';
import DialogRetorno from './dialogs/DialogRetorno';
import DialogConcluirReparo from './dialogs/DialogConcluirReparo';
import DialogSaidaFabrica from './dialogs/DialogSaidaFabrica';
import DialogEntrega from './dialogs/DialogEntrega';
import DialogIniciarReparo from './dialogs/DialogIniciarReparo';

import apiEstoque from '../../services/apiEstoque';

/**
 * @typedef {Object} ItemAssistencia
 * @property {number} id
 * @property {'aberto'|'enviado_fabrica'|'aguardando_resposta_fabrica'|'aguardando_peca'|'aguardando_reparo'|'reparo_concluido'|'em_transito_retorno'|'entregue'|'cancelado'} status_item
 */

/**
 * Botões por item, respeitando status do item/chamado e local de reparo.
 * Ordem: Decisão → (Fábrica) Envio/Trânsito/Retorno → (Geral) Orçamento/Decisão → Execução → Entrega.
 *
 * @param {{ item: ItemAssistencia, onChanged?: (any)=>void, chamadoStatus?: string, chamadoLocal?: 'deposito'|'fabrica'|'cliente' }} props
 */
export default function ItemAcoes({ item, onChanged, chamadoStatus, chamadoLocal }) {
  const toast = useRef(null);

  // Dialog states
  const [dlgEnvio, setDlgEnvio] = useState(false);
  const [dlgOrc, setDlgOrc] = useState(false);
  const [dlgRetorno, setDlgRetorno] = useState(false);
  const [dlgConcluir, setDlgConcluir] = useState(false);
  const [dlgSaida, setDlgSaida] = useState(false);
  const [dlgEntrega, setDlgEntrega] = useState(false);
  const [dlgIniciar, setDlgIniciar] = useState(false);

  const isChamadoBloqueado = ['entregue', 'cancelado'].includes(String(chamadoStatus || '').toLowerCase());
  const st = String(item?.status_item || '').toLowerCase();
  const local = String(chamadoLocal || '').toLowerCase();

  /** Orçamento: visibilidade dos botões de decisão
  *  - Deve aparecer sempre que existir um orçamento (> 0) e a aprovação estiver pendente/nula.
  *  - Independente do local (depósito/fábrica) enquanto não houver decisão.
  *  - O backend hoje só aceita decisão quando st === 'aguardando_reparo'; se o usuário tentar fora disso,
  *    a API retornará erro (o front apenas exibe a intenção enquanto estiver pendente).
  */
  const valorOrcado = Number(item?.valor_orcado ?? 0);
  const aprovacaoRaw = String(item?.aprovacao ?? '').toLowerCase(); // 'pendente' | 'aprovado' | 'reprovado' | ''
  const hasOrcamento = valorOrcado > 0;
  const aprovacaoPendente = hasOrcamento && (!aprovacaoRaw || aprovacaoRaw === 'pendente');

  // Sinalizador: reparo já iniciado?
  // - Para reparo em DEPÓSITO, o backend preenche deposito_assistencia_id ao iniciar;
  // - Para reparo em CLIENTE (se aplicável no futuro), aceite um flag opcional `reparo_iniciado`.
  const startedDeposito = local === 'deposito' && !!item?.deposito_assistencia_id;
  const startedCliente  = local === 'cliente'  && !!item?.reparo_iniciado; // opcional (gancho futuro)
  const repairStarted   = startedDeposito || startedCliente;

  /** ===== REGRAS DE EXIBIÇÃO/HABILITAÇÃO ===== */

    // Decisão prévia
  const showAguardarResposta = st === 'aberto'; // botão só aparece nesse estágio
  const canAguardarResposta = showAguardarResposta && !isChamadoBloqueado;

  // Fluxo de fábrica (somente quando local === 'fabrica')
  const showEnviar = local === 'fabrica' && ['aberto', 'aguardando_resposta_fabrica'].includes(st);
  const canEnviar = showEnviar && !isChamadoBloqueado;

  const showSaidaFabrica = local === 'fabrica' && ['aguardando_reparo', 'aguardando_peca', 'aguardando_resposta_fabrica', 'enviado_fabrica'].includes(st);
  const canSaidaFabrica = showSaidaFabrica && !isChamadoBloqueado;

  // Permite registrar chegada/retorno quando estiver em trânsito ou ainda em etapas na fábrica
  const showRetorno = local === 'fabrica' && ['em_transito_retorno', 'aguardando_reparo', 'aguardando_peca', 'aguardando_resposta_fabrica', 'enviado_fabrica'].includes(st);
  const canRetorno = showRetorno && !isChamadoBloqueado;

  // Orçamento (chega da fábrica, mas também pode existir em reparo local)
  const showOrcamento = ['enviado_fabrica', 'aguardando_reparo', 'aguardando_resposta_fabrica'].includes(st);
  const canOrcamento = showOrcamento && !isChamadoBloqueado;

  // Aprovar/Reprovar orçamento (status permanece em aguardando_reparo; reprovar não cancela)
  const showDecidir = aprovacaoPendente;
  const canDecidir = showDecidir && !isChamadoBloqueado;

  // Aguardar peça (após aprovação de orçamento, antes de executar reparo)
  const showAguardarPeca = st === 'aguardando_reparo';
  const canAguardarPeca = showAguardarPeca && !isChamadoBloqueado;

  // Execução local (depósito/cliente):
  // - INICIAR: aparece também após orçamento (st='aguardando_reparo'), mas some se já tiver iniciado.
  // - CONCLUIR: só aparece após ter iniciado de fato.
  const showIniciarReparo = (
    local !== 'fabrica' &&
    ['aberto', 'aguardando_resposta_fabrica', 'aguardando_peca', 'aguardando_reparo'].includes(st) &&
    !repairStarted
  );
  const canIniciarReparo = showIniciarReparo && !isChamadoBloqueado;

  const showConcluirReparoLocal = (
    local !== 'fabrica' &&
    st === 'aguardando_reparo' &&
    repairStarted
  );
  const canConcluirReparoLocal = showConcluirReparoLocal && !isChamadoBloqueado;

  // Entregar (qualquer local), após reparo concluído
  const showEntregar = st === 'reparo_concluido';
  const canEntregar = showEntregar && !isChamadoBloqueado;

  /** ===== HELPERS ===== */
  async function post(url, payload = {}) {
    const { data } = await apiEstoque.post(url, payload);
    onChanged?.(data?.data || data);
  }

  async function decidir(aprovado) {
    try {
      const url = aprovado
        ? `/assistencias/itens/${item.id}/aprovar-orcamento`
        : `/assistencias/itens/${item.id}/reprovar-orcamento`;
      const { data } = await apiEstoque.post(url, { aprovado, observacao: null });
      onChanged?.(data?.data || data);
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Falha na decisão de orçamento', life: 3000 });
    }
  }

  /** ===== RENDER ===== */
  return (
    <div className="flex gap-2 align-items-center flex-wrap">
      <Toast ref={toast} />

      {/* Tooltips */}
      <Tooltip target=".btn-aguarda-resp" content="Aguardar resposta da fábrica" />
      <Tooltip target=".btn-envio" content="Enviar para assistência" />
      <Tooltip target=".btn-saida-fab" content="Registrar saída da fábrica (em trânsito)" />
      <Tooltip target=".btn-retorno" content="Registrar retorno (chegada ao depósito)" />
      <Tooltip target=".btn-orc" content="Registrar/ajustar orçamento" />
      <Tooltip target=".btn-aprovar" content="Aprovar orçamento" />
      <Tooltip target=".btn-reprovar" content="Reprovar orçamento" />
      <Tooltip target=".btn-aguarda-peca" content="Aguardar peça" />
      <Tooltip target=".btn-iniciar" content="Iniciar reparo (depósito/cliente)" />
      <Tooltip target=".btn-concluir" content="Concluir reparo (sem movimentar estoque)" />
      <Tooltip target=".btn-entregar" content="Entregar ao cliente" />

      {/* ===== ORDEM DO FLUXO ===== */}

      {/* 1) Decisão inicial */}
      {showAguardarResposta && (
        <Button size="small" className="btn-aguarda-resp" icon="pi pi-hourglass" rounded outlined disabled={!canAguardarResposta}
                onClick={() => post(`/assistencias/itens/${item.id}/aguardar-resposta`)} />
      )}

      {/* 2) Fluxo de FÁBRICA */}
      {showEnviar && (
        <Button size="small" className="btn-envio" icon="pi pi-truck" rounded outlined disabled={!canEnviar}
                onClick={() => setDlgEnvio(true)} />
      )}
      {showSaidaFabrica && (
        <Button size="small" className="btn-saida-fab" icon="pi pi-send" rounded outlined disabled={!canSaidaFabrica}
                onClick={() => setDlgSaida(true)} />
      )}
      {showRetorno && (
        <Button size="small" className="btn-retorno" icon="pi pi-reply" rounded outlined disabled={!canRetorno}
                onClick={() => setDlgRetorno(true)} />
      )}

      {/* 3) Orçamento & Decisão */}
      {showOrcamento && (
        <Button size="small" className="btn-orc" icon="pi pi-file-edit" rounded outlined disabled={!canOrcamento}
                onClick={() => setDlgOrc(true)} />
      )}
      {showDecidir && (
        <>
          <Button size="small" className="btn-aprovar" icon="pi pi-check" rounded severity="success" outlined disabled={!canDecidir}
                  onClick={() => decidir(true)} />
          <Button size="small" className="btn-reprovar" icon="pi pi-times" rounded severity="danger" outlined disabled={!canDecidir}
                  onClick={() => decidir(false)} />
        </>
      )}
      {showAguardarPeca && (
        <Button size="small" className="btn-aguarda-peca" icon="pi pi-cog" rounded outlined disabled={!canAguardarPeca}
                onClick={() => post(`/assistencias/itens/${item.id}/aguardar-peca`)} />
      )}

      {/* 4) Execução local (depósito/cliente) */}
      {showIniciarReparo && (
        <Button size="small" className="btn-iniciar" icon="pi pi-wrench" rounded outlined disabled={!canIniciarReparo}
                onClick={() => setDlgIniciar(true)} />
      )}
      {showConcluirReparoLocal && (
        <Button size="small" className="btn-concluir" icon="pi pi-check-circle" rounded outlined disabled={!canConcluirReparoLocal}
                onClick={() => setDlgConcluir(true)} />
      )}

      {/* 5) Entrega */}
      {showEntregar && (
        <Button size="small" className="btn-entregar" icon="pi pi-box" rounded severity="success" outlined disabled={!canEntregar}
                onClick={() => setDlgEntrega(true)} />
      )}

      {/* ===== DIALOGS ===== */}
      <DialogEnvio
        item={item}
        visible={dlgEnvio}
        onHide={() => setDlgEnvio(false)}
        onSuccess={(data) => { onChanged?.(data); setDlgEnvio(false); }}
      />
      <DialogSaidaFabrica
        item={item}
        visible={dlgSaida}
        onHide={() => setDlgSaida(false)}
        onSuccess={(data) => { onChanged?.(data); setDlgSaida(false); }}
      />
      <DialogRetorno
        item={item}
        visible={dlgRetorno}
        onHide={() => setDlgRetorno(false)}
        onSuccess={(data) => { onChanged?.(data); setDlgRetorno(false); }}
      />

      <DialogOrcamento
        item={item}
        visible={dlgOrc}
        onHide={() => setDlgOrc(false)}
        onSuccess={(data) => { onChanged?.(data); setDlgOrc(false); }}
      />

      <DialogConcluirReparo
        item={item}
        visible={dlgConcluir}
        onHide={() => setDlgConcluir(false)}
        onSuccess={(data) => { onChanged?.(data); setDlgConcluir(false); }}
      />

      <DialogEntrega
        item={item}
        visible={dlgEntrega}
        onHide={() => setDlgEntrega(false)}
        onSuccess={(data) => { onChanged?.(data); setDlgEntrega(false); }}
      />

      <DialogIniciarReparo
        item={item}
        visible={dlgIniciar}
        onHide={() => setDlgIniciar(false)}
        onSuccess={(data) => { onChanged?.(data); setDlgIniciar(false); }}
      />
    </div>
  );
}
