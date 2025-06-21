export const formatarMotivo = (motivo) => {
  const mapa = {
    tempo_estoque: 'Tempo em estoque',
    saiu_linha: 'Saiu de linha',
    avariado: 'Avariado',
    devolvido: 'Devolvido',
    exposicao: 'Exposição em loja',
    embalagem_danificada: 'Embalagem danificada',
    baixa_rotatividade: 'Baixa rotatividade',
    erro_cadastro: 'Erro de cadastro',
    excedente: 'Excedente',
    promocao_pontual: 'Promoção pontual',
  };
  return mapa[motivo] || motivo;
};
