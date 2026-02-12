const normalize = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export default function isDeveloperUser(user) {
  if (!user || typeof user !== 'object') return false;

  const perfis = [];

  if (typeof user.perfil === 'string') perfis.push(user.perfil);
  if (user.perfil && typeof user.perfil === 'object') {
    perfis.push(user.perfil.nome, user.perfil.slug, user.perfil.label);
  }

  if (Array.isArray(user.perfis)) {
    user.perfis.forEach((p) => {
      if (typeof p === 'string') {
        perfis.push(p);
      } else if (p && typeof p === 'object') {
        perfis.push(p.nome, p.slug, p.label);
      }
    });
  }

  if (Array.isArray(user.roles)) {
    user.roles.forEach((r) => {
      if (typeof r === 'string') {
        perfis.push(r);
      } else if (r && typeof r === 'object') {
        perfis.push(r.nome, r.slug, r.label);
      }
    });
  }

  return perfis
    .filter(Boolean)
    .map(normalize)
    .some((nome) => nome.includes('desenvolvedor') || nome.includes('developer'));
}

