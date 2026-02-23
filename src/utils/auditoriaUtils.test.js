import { formatarValorAuditoria, parseJsonSafe, toApiDate } from './auditoriaUtils';

describe('auditoriaUtils', () => {
  it('converte datas para formato yyyy-mm-dd', () => {
    expect(toApiDate('2026-02-23T10:30:00Z')).toBe('2026-02-23');
  });

  it('faz parse seguro de json string', () => {
    expect(parseJsonSafe('{"a":1}')).toEqual({ a: 1 });
    expect(parseJsonSafe('texto puro')).toBe('texto puro');
  });

  it('formata valores vazios e json para exibicao', () => {
    expect(formatarValorAuditoria(null)).toBe('-');
    expect(formatarValorAuditoria('{"ok":true}')).toContain('"ok": true');
  });
});
