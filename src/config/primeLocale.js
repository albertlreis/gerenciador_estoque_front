import { addLocale, locale } from 'primereact/api';

addLocale('pt', {
  // Botões
  accept: 'Sim',
  reject: 'Não',
  choose: 'Escolher',
  upload: 'Enviar',
  cancel: 'Cancelar',

  // MultiSelect
  emptyFilterMessage: 'Nenhum resultado encontrado', // quando filtro não retorna nada
  emptySelectionMessage: 'Nenhum item selecionado', // placeholder quando nada está marcado
  selectAll: 'Selecionar todos',
  unselectAll: 'Remover todos',
  filterPlaceholder: 'Pesquisar',
  emptyMessage: 'Nenhuma opção disponível',
  noOptionsLabel: 'Nenhuma opção disponível',

  // Data e hora (caso use DatePicker, Calendar etc.)
  dayNames: ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'],
  dayNamesShort: ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'],
  dayNamesMin: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
  monthNames: [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ],
  monthNamesShort: [
    'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
    'jul', 'ago', 'set', 'out', 'nov', 'dez'
  ],
  today: 'Hoje',
  clear: 'Limpar'
});

// Define como idioma padrão
locale('pt');
