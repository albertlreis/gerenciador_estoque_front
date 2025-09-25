import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { Timeline } from 'primereact/timeline';
import { Button } from 'primereact/button';
import { formatarReal } from '../utils/formatters';
import { STATUS_MAP } from '../constants/statusPedido';

const severityEntrega = (diasUteisRestantes, atrasado) => {
  if (atrasado) return 'danger';
  if (diasUteisRestantes === 0) return 'warning';
  if (diasUteisRestantes <= 7) return 'info';
  return 'success';
};

const isEstadoFinal = (status) =>
  ['entrega_cliente','finalizado','consignado','devolucao_consignacao'].includes(status ?? '');

const PedidoDetalhado = ({ visible, onHide, pedido }) => {
  if (!pedido) return null;

  const status = STATUS_MAP[pedido.status] ?? { label: pedido.status };
  const dataPedido = pedido.data_pedido ? new Date(pedido.data_pedido).toLocaleDateString('pt-BR') : '—';
  const numeroExterno = pedido.numero ? `#${pedido.numero}` : `ID ${pedido.id}`;

  const entregaPrevista = pedido.data_limite_entrega
    ? new Date(pedido.data_limite_entrega).toLocaleDateString('pt-BR')
    : '—';

  const diasUteisRestantes = typeof pedido.dias_uteis_restantes === 'number'
    ? pedido.dias_uteis_restantes
    : null;

  const atrasadoEntrega = !!pedido.atrasado_entrega;
  const estadoFinal = isEstadoFinal(pedido.status);

  const badgeEstadoFinal = () => {
    const map = {
      entrega_cliente: { label: 'Entregue', severity: 'success', icon: 'pi pi-check-circle' },
      finalizado: { label: 'Finalizado', severity: 'success', icon: 'pi pi-verified' },
      consignado: { label: 'Consignado', severity: 'info', icon: 'pi pi-inbox' },
      devolucao_consignacao: { label: 'Devolução', severity: 'warning', icon: 'pi pi-undo' },
    };
    const cfg = map[pedido.status] ?? null;
    if (!cfg) return null;
    return <Tag value={cfg.label} icon={cfg.icon} severity={cfg.severity} rounded />;
  };

  return (
    <Dialog
      header={<> <i className="pi pi-box mr-2" /> Detalhes do Pedido <strong>{numeroExterno}</strong></>}
      visible={visible}
      onHide={onHide}
      modal
      style={{ width: '65vw' }}
      footer={
        <div className="flex justify-content-end gap-2">
          <Button
            label="Fechar"
            icon="pi pi-times"
            onClick={onHide}
            severity="secondary"
          />
          <Button
            label="Solicitar Devolução ou Troca"
            icon="pi pi-sync"
            severity="warning"
            disabled={!pedido.itens?.length}
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent('abrir-dialog-devolucao', { detail: pedido })
              )
            }
          />
        </div>
      }
    >
      <div className="mb-4">
        <h3 className="mb-1">{pedido.cliente?.nome ?? 'Cliente não informado'}</h3>
        <div className="text-sm text-gray-700 mb-2">
          <div><i className="pi pi-user mr-1" /> <strong>Vendedor:</strong> {pedido.usuario?.nome ?? '—'}</div>
          <div><i className="pi pi-bookmark mr-1" /> <strong>Parceiro:</strong> {pedido.parceiro?.nome ?? '—'}</div>
          <div><i className="pi pi-calendar mr-1" /> <strong>Data:</strong> {dataPedido}</div>
          <div><i className="pi pi-dollar mr-1" /> <strong>Valor Total:</strong> {formatarReal(pedido.valor_total)}</div>

          {/* Bloco de Entrega */}
          <div className="mt-2 flex flex-wrap align-items-center gap-3">
            <div className="text-sm">
              <i className="pi pi-send mr-1" />
              <strong>Entrega prevista:</strong> {estadoFinal ? '—' : entregaPrevista}
            </div>

            {/* Quando o prazo não conta, mostra badge do estado final */}
            {estadoFinal && badgeEstadoFinal()}

            {/* Se ainda conta prazo e houver contador */}
            {!estadoFinal && diasUteisRestantes !== null && (
              <Tag
                value={
                  atrasadoEntrega
                    ? `${Math.abs(diasUteisRestantes)} dia(s) úteis em atraso`
                    : `${diasUteisRestantes} dia(s) úteis restantes`
                }
                severity={severityEntrega(diasUteisRestantes, atrasadoEntrega)}
                rounded
              />
            )}
          </div>

          <div className="flex align-items-center gap-2 mt-2">
            <strong>Status:</strong>
            <Tag value={status.label} severity={status.color} icon={status.icon} />
          </div>

          {pedido.observacoes && (
            <div className="mt-2 text-sm text-gray-600">
              📝 <strong>Observações:</strong> {pedido.observacoes}
            </div>
          )}
        </div>
      </div>

      <h4 className="mt-4 mb-3">🛒 Itens do Pedido</h4>
      <div className="grid">
        {pedido.itens?.length > 0 ? (
          <>
            {pedido.itens.map((item, i) => (
              <div key={i} className="col-12 md:col-6 xl:col-4">
                <div className="border-1 surface-border border-round p-3 mb-3 h-full">
                  <div className="mb-2 flex align-items-center gap-3">
                    <img
                      src={item.imagem ?? 'https://placehold.co/500x300?text=Sem+Imagem'}
                      alt={item.nome_produto}
                      className="shadow-1"
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px' }}
                    />
                    <div>
                      <div className="font-semibold">{item.nome_produto}</div>
                      <div className="text-sm text-gray-600">Ref: {item.referencia}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-sm mb-2">
                    {item.atributos?.map((attr, idx) => (
                      <Tag
                        key={idx}
                        value={`${attr.atributo}: ${attr.valor}`}
                        className="bg-gray-100 text-gray-700"
                      />
                    ))}
                  </div>

                  <div className="text-sm">
                    Qtde: <strong>{item.quantidade}</strong> <br />
                    Unitário: <strong>{formatarReal(item.preco_unitario)}</strong> <br />
                    Subtotal: <strong>{formatarReal(item.subtotal)}</strong>
                  </div>
                </div>
              </div>
            ))}

            <div className="col-12 mt-4">
              <div className="flex justify-content-end border-top pt-3">
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    Total de Itens: {pedido.itens.reduce((s, i) => s + i.quantidade, 0)}
                  </div>
                  <div className="text-xl font-bold text-gray-800">
                    Total do Pedido: {formatarReal(pedido.valor_total)}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="col-12">
            <p className="text-sm text-gray-500">Nenhum item informado.</p>
          </div>
        )}
      </div>

      <h4 className="mt-4 mb-2">🔁 Trocas e Créditos</h4>

      {pedido.devolucoes?.length > 0 ? pedido.devolucoes.map((dev, i) => (
        <div key={i} className="mb-3 border-1 p-3 border-round surface-border">
          <div className="mb-1 text-sm">
            <strong>Tipo:</strong> {dev.tipo === 'troca' ? 'Troca' : 'Crédito em loja'}<br/>
            <strong>Status:</strong> {dev.status}<br/>
            <strong>Motivo:</strong> {dev.motivo}
          </div>

          {dev.itens.map((item, j) => (
            <div key={j} className="text-sm pl-2 mb-2">
              • Devolvido: <strong>{item.nome_produto}</strong> ({item.quantidade})
              {item.trocas?.length > 0 && (
                <div className="ml-3">
                  {item.trocas.map((troca, k) => (
                    <div key={k}>
                      → Trocado por: <strong>{troca.nome_completo}</strong> ({troca.quantidade}) — {formatarReal(troca.preco_unitario)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {dev.credito && (
            <div className="mt-2 text-sm text-green-700">
              💰 Crédito gerado: <strong>{formatarReal(dev.credito.valor)}</strong>
              {dev.credito.utilizado ? ' (utilizado)' : ' (disponível)'}
              {dev.credito.data_validade && <> — válido até {new Date(dev.credito.data_validade).toLocaleDateString('pt-BR')}</>}
            </div>
          )}
        </div>
      )) : (
        <div className="text-sm text-gray-500">Nenhuma devolução registrada.</div>
      )}

      {pedido.historico?.length > 0 && (
        <>
          <h4 className="mt-4 mb-2">🕓 Histórico de Status</h4>
          <div className="timeline-container">
            <Timeline
              value={pedido.historico}
              layout="horizontal"
              content={(item) => (
                <div className="text-center w-10rem">
                  <div className="font-semibold text-sm mb-1">
                    {STATUS_MAP[item.status]?.label ?? item.label ?? item.status}
                  </div>
                  <div className="text-xs text-gray-500 mb-1">
                    {item.data_status ? new Date(item.data_status).toLocaleDateString('pt-BR') : ''}
                  </div>
                  {item.observacoes && (
                    <div className="text-xs text-gray-600">{item.observacoes}</div>
                  )}
                  <div className="text-xs text-gray-400 mt-1">Por: {item.usuario}</div>
                </div>
              )}
              className="mt-2 overflow-x-auto"
            />
          </div>
        </>
      )}
    </Dialog>
  );
};

export default PedidoDetalhado;
