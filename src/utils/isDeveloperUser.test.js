import isDeveloperUser from './isDeveloperUser';

describe('isDeveloperUser', () => {
  it('retorna true quando perfil string for Desenvolvedor', () => {
    expect(isDeveloperUser({ perfil: 'Desenvolvedor' })).toBe(true);
  });

  it('retorna true quando perfil estiver em array de perfis', () => {
    expect(isDeveloperUser({ perfis: [{ nome: 'Desenvolvedor' }] })).toBe(true);
  });

  it('retorna false para usuario sem perfil dev', () => {
    expect(isDeveloperUser({ perfil: 'Vendedor' })).toBe(false);
  });
});

