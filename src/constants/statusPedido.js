export const STATUS_MAP = {
  pedido_criado: {
    label: 'Criado',
    color: 'secondary',
    icon: 'pi pi-plus'
  },
  pedido_enviado_fabrica: {
    label: 'Enviado à Fábrica',
    color: 'info',
    icon: 'pi pi-send'
  },
  nota_emitida: {
    label: 'Nota Emitida',
    color: 'success',
    icon: 'pi pi-file'
  },
  previsao_embarque_fabrica: {
    label: 'Previsão de Embarque',
    color: 'warning',
    icon: 'pi pi-calendar-clock'
  },
  embarque_fabrica: {
    label: 'Embarque da Fábrica',
    color: 'info',
    icon: 'pi pi-truck'
  },
  nota_recebida_compra: {
    label: 'Nota Recebida',
    color: 'success',
    icon: 'pi pi-file-check'
  },
  previsao_entrega_estoque: {
    label: 'Previsão de Entrega ao Estoque',
    color: 'warning',
    icon: 'pi pi-calendar-clock'
  },
  entrega_estoque: {
    label: 'Entrega no Estoque',
    color: 'success',
    icon: 'pi pi-box'
  },
  previsao_envio_cliente: {
    label: 'Previsão de Envio ao Cliente',
    color: 'warning',
    icon: 'pi pi-calendar-minus'
  },
  envio_cliente: {
    label: 'Enviado ao Cliente',
    color: 'warning',
    icon: 'pi pi-send'
  },
  entrega_cliente: {
    label: 'Entregue ao Cliente',
    color: 'success',
    icon: 'pi pi-check'
  },
  consignado: {
    label: 'Consignado',
    color: 'info',
    icon: 'pi pi-briefcase'
  },
  devolucao_consignacao: {
    label: 'Devolução de Consignação',
    color: 'danger',
    icon: 'pi pi-undo'
  },
  finalizado: {
    label: 'Finalizado',
    color: 'success',
    icon: 'pi pi-check-circle'
  },
  cancelado: {
    label: 'Cancelar',
    color: 'danger',
    icon: 'pi pi-undo'
  },
};

export const OPCOES_STATUS = Object.entries(STATUS_MAP).map(([value, { label }]) => ({
  label,
  value
}));
