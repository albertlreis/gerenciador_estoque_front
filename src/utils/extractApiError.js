// Converte erros de API (Axios/Laravel) em mensagens amigáveis
export function extractApiError(err) {
  const fallback = { title: 'Erro', message: 'Ocorreu um erro inesperado.', fieldErrors: {} };

  // Sem response (timeout, rede, CORS, etc.)
  if (!err?.response) {
    return { ...fallback, message: 'Falha de conexão. Verifique sua internet e tente novamente.' };
  }

  const { status, data } = err.response || {};
  const respMsg = (data && (data.message || data.error || data.msg)) || null;

  // Erros de validação do Laravel: 422 { message, errors: { campo: ['msg1','msg2'] } }
  if (status === 422 && data?.errors && typeof data.errors === 'object') {
    const fieldErrors = {};
    Object.entries(data.errors).forEach(([field, msgs]) => {
      if (Array.isArray(msgs) && msgs.length) fieldErrors[field] = msgs[0];
    });
    // Mensagem geral amigável
    return {
      title: 'Corrija os campos',
      message: 'Alguns campos precisam de atenção.',
      fieldErrors
    };
  }

  // Conflitos/negócio
  if (status === 409) {
    return { title: 'Não foi possível concluir', message: respMsg || 'Conflito de dados.', fieldErrors: {} };
  }

  // Requisição inválida
  if (status === 400) {
    return { title: 'Dados inválidos', message: respMsg || 'Revise as informações enviadas.', fieldErrors: {} };
  }

  // Não encontrado
  if (status === 404) {
    return { title: 'Não encontrado', message: respMsg || 'O recurso solicitado não foi encontrado.', fieldErrors: {} };
  }

  // Não autorizado / proibido
  if (status === 401 || status === 403) {
    return { title: 'Acesso negado', message: respMsg || 'Você não tem permissão para esta ação.', fieldErrors: {} };
  }

  // Demais (500 etc.)
  return { title: 'Erro no servidor', message: respMsg || fallback.message, fieldErrors: {} };
}
