import { TIPO } from './relatorios.constants';

export function montarEndpoint(tipo) {
  if (tipo === TIPO.ESTOQUE) return '/relatorios/estoque/atual';
  if (tipo === TIPO.PEDIDOS) return '/relatorios/pedidos';
  if (tipo === TIPO.CONSIG) return '/relatorios/consignacoes/ativas';
  if (tipo === TIPO.ASSISTENCIAS) return '/relatorios/assistencias';
  return '';
}
