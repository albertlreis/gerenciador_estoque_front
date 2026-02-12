const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

const FILES = [
  'src/utils/menuItems.js',
  'src/layouts/SakaiLayout.js',
  'src/layouts/Topbar.js',
];

const REQUIRED_LABELS = {
  'src/utils/menuItems.js': [
    'Consignações',
    'Catálogo',
    'Catálogo Outlet',
    'Lançamentos',
    'Transferências entre Contas',
    'Depósitos',
    'Movimentações de Estoque',
    'Transferir entre Depósitos',
    'Administração',
    'Relatórios',
    'Assistências',
    'Autorizadas',
    'Configurações',
  ],
  'src/layouts/Topbar.js': [
    'Usuário',
    'Página inicial',
  ],
  'src/layouts/SakaiLayout.js': [],
};

const INVALID_MARKERS = ['�', 'Ã', 'Â', 'ï¿½'];

const failures = [];

for (const relativeFile of FILES) {
  const fullPath = path.join(ROOT, relativeFile);
  if (!fs.existsSync(fullPath)) {
    failures.push(`[arquivo ausente] ${relativeFile}`);
    continue;
  }

  const content = fs.readFileSync(fullPath, 'utf8').replace(/^\uFEFF/, '');

  for (const marker of INVALID_MARKERS) {
    if (content.includes(marker)) {
      failures.push(`[encoding suspeito] ${relativeFile} contém "${marker}"`);
      break;
    }
  }

  for (const expectedLabel of REQUIRED_LABELS[relativeFile] || []) {
    if (!content.includes(expectedLabel)) {
      failures.push(`[label ausente] ${relativeFile} não contém "${expectedLabel}"`);
    }
  }
}

if (failures.length > 0) {
  console.error('Falha na verificação de encoding/acentuação do menu:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Check de encoding do menu concluído com sucesso.');
