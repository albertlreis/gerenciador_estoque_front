import { TIPO } from './relatorios.constants';
import { toIsoDate } from '../../utils/date/dateHelpers';

export function appendFiltros({ tipo, params, filtros }) {
  if (tipo === TIPO.ESTOQUE) {
    const {
      depositoIds,
      somenteOutlet,
      somenteSemEstoque,
      categoria,
      produto,
      fornecedor,
    } = filtros;

    if (depositoIds?.length) depositoIds.forEach((id) => params.append('deposito_ids[]', id));
    if (somenteOutlet) params.append('somente_outlet', 1);
    if (somenteSemEstoque) params.append('somente_sem_estoque', 1);
    if (fornecedor?.id) params.append('fornecedor_id', fornecedor.id);
    if (categoria?.id) params.append('categoria_id', categoria.id);
    if (produto?.id) params.append('produto_id', produto.id);
    return;
  }

  if (tipo === TIPO.PEDIDOS) {
    const { periodoPedidos, clienteId, parceiroId, vendedorId, statusPedido } = filtros;
    const [ini, fim] = Array.isArray(periodoPedidos) ? periodoPedidos : [];

    if (ini) params.append('data_inicio', toIsoDate(ini));
    if (fim) params.append('data_fim', toIsoDate(fim));
    if (clienteId) params.append('cliente_id', clienteId);
    if (parceiroId) params.append('parceiro_id', parceiroId);
    if (vendedorId) params.append('vendedor_id', vendedorId);
    if (statusPedido != null && statusPedido !== '') params.append('status', statusPedido);
    return;
  }

  if (tipo === TIPO.CONSIG) {
    const { statusConsig, periodoEnvio, periodoVencimento, consolidado } = filtros;
    const [ei, ef] = Array.isArray(periodoEnvio) ? periodoEnvio : [];
    const [vi, vf] = Array.isArray(periodoVencimento) ? periodoVencimento : [];

    if (statusConsig != null) params.append('status', statusConsig);
    if (ei) params.append('envio_inicio', toIsoDate(ei));
    if (ef) params.append('envio_fim', toIsoDate(ef));
    if (vi) params.append('vencimento_inicio', toIsoDate(vi));
    if (vf) params.append('vencimento_fim', toIsoDate(vf));
    if (consolidado) params.append('consolidado', '1');
    return;
  }

  if (tipo === TIPO.ASSISTENCIAS) {
    const {
      statusAssistencia,
      periodoAbertura,
      periodoConclusao,
      locaisReparo,
      custoResp,
    } = filtros;

    if (statusAssistencia) params.append('status', statusAssistencia);

    const [ai, af] = Array.isArray(periodoAbertura) ? periodoAbertura : [];
    if (ai) params.append('abertura_inicio', toIsoDate(ai));
    if (af) params.append('abertura_fim', toIsoDate(af));

    const [ci, cf] = Array.isArray(periodoConclusao) ? periodoConclusao : [];
    if (ci) params.append('conclusao_inicio', toIsoDate(ci));
    if (cf) params.append('conclusao_fim', toIsoDate(cf));

    if (Array.isArray(locaisReparo) && locaisReparo.length) {
      locaisReparo.forEach((v) => params.append('locais_reparo[]', v));
    }

    // NOVO: responsável pelo custo
    if (custoResp) params.append('custo_resp', custoResp);

    return;
  }
}

export function buildParams({ tipo, formato, filtros }) {
  const params = new URLSearchParams();
  params.append('formato', formato);
  appendFiltros({ tipo, params, filtros });
  return params;
}
