import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { Timeline } from 'primereact/timeline';
import { formatarReal } from '../utils/formatters';

const statusMapDetalhado = {
  pedido_criado:     { label: 'Criado', color: 'secondary', icon: 'pi pi-plus' },
  pedido_enviado_fabrica: { label: 'Enviado à Fábrica', color: 'info', icon: 'pi pi-send' },
  nota_emitida:      { label: 'Nota Emitida', color: 'success', icon: 'pi pi-file' },
  previsao_envio_cliente: { label: 'Previsão de Envio', color: 'warning', icon: 'pi pi-clock' },
  embarque_fabrica:  { label: 'Embarcado', color: 'info', icon: 'pi pi-truck' },
  nota_recebida_compra: { label: 'Nota Recebida', color: 'success', icon: 'pi pi-file-check' },
  entrega_estoque:   { label: 'Entrega Estoque', color: 'success', icon: 'pi pi-box' },
  envio_cliente:     { label: 'Enviado ao Cliente', color: 'warning', icon: 'pi pi-send' },
  entrega_cliente:   { label: 'Entregue', color: 'success', icon: 'pi pi-check' },
  consignado:        { label: 'Consignado', color: 'info', icon: 'pi pi-briefcase' },
  devolucao_consignacao: { label: 'Devolvido', color: 'danger', icon: 'pi pi-undo' },
  finalizado:        { label: 'Finalizado', color: 'success', icon: 'pi pi-check-circle' },
};

const PedidoDetalhado = ({ visible, onHide, pedido }) => {
  if (!pedido) return null;

  const status = statusMapDetalhado[pedido.status] ?? { label: pedido.status };

  const dataPedido = pedido.data_pedido ? new Date(pedido.data_pedido).toLocaleDateString('pt-BR') : '—';

  return (
    <Dialog
      header={<>📦 Detalhes do Pedido <strong>#{pedido.id}</strong></>}
      visible={visible}
      onHide={onHide}
      modal
      style={{width: '65vw'}}
    >
      <div className="mb-4">
        <h3 className="mb-1">{pedido.cliente?.nome ?? 'Cliente não informado'}</h3>
        <div className="text-sm text-gray-700 mb-2">
          <div>📌 <strong>Parceiro:</strong> {pedido.parceiro?.nome ?? '—'}</div>
          <div>📅 <strong>Data:</strong> {dataPedido}</div>
          <div>💰 <strong>Valor Total:</strong> {formatarReal(pedido.valor_total)}</div>
          <div className="flex align-items-center gap-2 mt-1">
            <strong>Status:</strong>
            <Tag value={status.label} severity={status.color} icon={status.icon}/>
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
                      src={item.imagem ?? '/placeholder.jpg'}
                      alt={item.nome_produto}
                      className="shadow-1"
                      style={{width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px'}}
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
                    Qtde: <strong>{item.quantidade}</strong> <br/>
                    Unitário: <strong>{formatarReal(item.preco_unitario)}</strong> <br/>
                    Subtotal: <strong>{formatarReal(item.subtotal)}</strong>
                  </div>
                </div>
              </div>
            ))}

            {/* RESUMO FINAL */}
            <div className="col-12 mt-4">
              <div className="flex justify-content-end border-top pt-3">
                <div className="text-right">
                  <div className="text-sm text-gray-600">Total de
                    Itens: {pedido.itens.reduce((s, i) => s + i.quantidade, 0)}</div>
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

      {pedido.historico?.length > 0 && (
        <>
          <h4 className="mt-4 mb-2">🕓 Histórico de Status</h4>
          <div className="timeline-container">
            <Timeline
              value={pedido.historico}
              layout="horizontal"
              content={(item) => (
                <div className="text-center w-10rem">
                  <div className="font-semibold text-sm mb-1">{statusMapDetalhado[item.status]?.label ?? item.status}</div>
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
