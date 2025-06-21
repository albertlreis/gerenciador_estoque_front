import React from 'react';
import { Calendar } from 'primereact/calendar';
import { addLocale } from 'primereact/api';

// Define locale pt-BR uma única vez
addLocale('pt-BR', {
  firstDayOfWeek: 0,
  dayNames: ['domingo','segunda','terça','quarta','quinta','sexta','sábado'],
  dayNamesShort: ['dom','seg','ter','qua','qui','sex','sáb'],
  dayNamesMin: ['D','S','T','Q','Q','S','S'],
  monthNames: ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'],
  monthNamesShort: ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'],
  today: 'Hoje',
  clear: 'Limpar',
});

const CalendarBR = ({ value, onChange, ...props }) => {
  return (
    <Calendar
      value={value || null}
      onChange={(e) => onChange?.(e)}
      className="w-full"
      locale="pt-BR"
      dateFormat="dd/mm/yy"
      showIcon
      showButtonBar
      {...props}
    />
  );
};

export default CalendarBR;
