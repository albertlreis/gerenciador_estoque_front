const fs = require('fs');
const path = require('path');

const versionData = {
  version: new Date().toISOString(),
};

fs.writeFileSync(
  path.resolve(__dirname, '../build/version.json'),
  JSON.stringify(versionData, null, 2)
);

console.log('✔ version.json gerado com sucesso.');
