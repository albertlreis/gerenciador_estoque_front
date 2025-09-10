import React from 'react';
import { Tag } from 'primereact/tag';

/**
 * Exibe o prazo restante (ou atraso) de forma amigável.
 * Não exibe nada se o chamado já foi entregue ou cancelado.
 *
 * @param {{ dateStr?: string, status?: string }} props
 * @returns {JSX.Element|null}
 */
const PrazoTag = ({ dateStr, status }) => {
  if (!dateStr) return <Tag value="Prazo N/D" severity="secondary" />;

  // Se já foi finalizado ou cancelado, não faz sentido exibir prazo
  if (['entregue', 'cancelado'].includes(status)) {
    return <Tag value="—" severity="secondary" />;
  }

  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const today = startOfDay(new Date());
  const limit = startOfDay(new Date(`${dateStr}T00:00:00`));

  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const diff = Math.round((limit - today) / MS_PER_DAY);

  const dLabel = (n) => `${n} ${Math.abs(n) === 1 ? 'dia' : 'dias'}`;

  let label;
  let sev = 'success';

  if (diff < 0) {
    label = `${dLabel(Math.abs(diff))} em atraso`;
    sev = 'danger';
  } else if (diff === 0) {
    label = 'Hoje';
    sev = 'warning';
  } else {
    label = `em ${dLabel(diff)}`;
    if (diff <= 5) sev = 'warning';
    else sev = 'success';
  }

  return <Tag value={label} severity={sev} />;
};

export default PrazoTag;
