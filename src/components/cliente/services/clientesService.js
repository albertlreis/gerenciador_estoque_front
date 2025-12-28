import apiEstoque from '../../../services/apiEstoque';

export async function checkDocumentoDuplicado(documento, id) {
  const res = await apiEstoque.get(`/clientes/verifica-documento?documento=${documento}&ignorar_id=${id}`);
  return !!res.data?.existe;
}

export async function saveCliente(clientePayload) {
  const isEdit = !!clientePayload?.id;
  if (isEdit) {
    const { data } = await apiEstoque.put(`/clientes/${clientePayload.id}`, clientePayload);
    return data;
  }
  const { data } = await apiEstoque.post('/clientes', clientePayload);
  return data;
}
