import { buildOutletExportIds } from './outletExport';

describe('buildOutletExportIds', () => {
  it('retorna ids unicos e ignora valores invalidos', () => {
    const ids = buildOutletExportIds([
      { id: 10 },
      { id: 10 },
      { id: 20 },
      { id: null },
      {},
    ]);

    expect(ids).toEqual([10, 20]);
  });

  it('retorna array vazio quando nao houver selecionados', () => {
    expect(buildOutletExportIds([])).toEqual([]);
    expect(buildOutletExportIds(null)).toEqual([]);
  });
});