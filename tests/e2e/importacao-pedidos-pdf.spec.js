const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');

const FRONT_URL = process.env.E2E_FRONT_URL || 'http://localhost:3000';
const ESTOQUE_BASE_URL = process.env.E2E_ESTOQUE_API_URL || 'http://localhost:8001';
const PDF_DIR = process.env.E2E_PDF_DIR || path.resolve(__dirname, '../../../leitor_pdf_sierra');
const REPORT_PATH = path.resolve(__dirname, '../../e2e-results/import-pdf-report.json');
const SCREENSHOT_DIR = path.resolve(__dirname, '../../e2e-results/screenshots');

const E2E_EMAIL = process.env.E2E_EMAIL || 'e2e@local.test';
const E2E_PASSWORD = process.env.E2E_PASSWORD || 'Senha@123';

function sanitizeFileName(fileName) {
  return fileName.replace(/[\\/:*?"<>| ]+/g, '-');
}

function guessTipoImportacao(fileName) {
  const normalized = fileName.toUpperCase();
  if (normalized.includes('AVANTI')) return 'Produtos PDF Avanti';
  if (normalized.includes('QUAKER')) return 'Produtos PDF Quaker';
  return 'Produtos PDF Sierra';
}

async function selectPrimeDropdownOption(page, dropdownLocator, optionText) {
  await dropdownLocator.click();

  if (optionText) {
    const panel = page.locator('.p-dropdown-panel:visible').last();
    await expect(panel).toBeVisible();
    const option = panel.locator('li[role="option"]', { hasText: optionText }).first();
    await option.click();
    return;
  }

  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
}

async function preencherClienteSeNecessario(page) {
  const clienteCard = page.locator('.p-card', { hasText: 'Cliente do Pedido' }).first();
  if (!(await clienteCard.isVisible())) return;

  const clienteDropdown = clienteCard.locator('.p-dropdown').first();
  if (!(await clienteDropdown.isVisible())) return;
  await selectPrimeDropdownOption(page, clienteDropdown);
}

async function preencherCategoriasPendentes(page) {
  const pendentes = page.locator('.field:has(label:has-text("Categoria")) .p-dropdown.p-invalid');
  const total = await pendentes.count();

  for (let i = 0; i < total; i += 1) {
    const dropdown = pendentes.nth(i);
    await selectPrimeDropdownOption(page, dropdown);
  }
}

test('E2E: importar e confirmar 5 PDFs via tela real', async ({ page, request }) => {
  test.setTimeout(1_200_000);

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const pdfFiles = fs
    .readdirSync(PDF_DIR)
    .filter((file) => file.toLowerCase().endsWith('.pdf'))
    .sort();

  expect(pdfFiles.length).toBe(5);

  const report = [];

  await page.goto(`${FRONT_URL}/login`);
  await page.getByLabel('E-mail').fill(E2E_EMAIL);
  await page.locator('#senha').fill(E2E_PASSWORD);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.waitForURL(/\/$/);

  for (const fileName of pdfFiles) {
    const startedAt = Date.now();
    const safeName = sanitizeFileName(fileName);
    const filePath = path.join(PDF_DIR, fileName);

    const result = {
      arquivo: fileName,
      status: 'FAIL',
      tempo_ms: 0,
      mensagem_ui: null,
      importacao_id: null,
      pedido_id: null,
      backend_validacao: null,
      erro: null,
    };

    try {
      await page.goto(`${FRONT_URL}/pedidos/importar`);
      await expect(page.getByText('Enviar Arquivo PDF')).toBeVisible();

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${safeName}-antes.png`), fullPage: true });

      const tipoLabel = guessTipoImportacao(fileName);
      const tipoDropdown = page
        .locator('div.w-full.md\\:w-6')
        .filter({ hasText: 'Tipo de importacao' })
        .locator('.p-dropdown')
        .first();
      await selectPrimeDropdownOption(page, tipoDropdown, tipoLabel);

      const importResponsePromise = page.waitForResponse(
        (resp) => resp.url().includes('/api/v1/pedidos/import') && resp.request().method() === 'POST'
      );

      await page.locator('input[type="file"]').setInputFiles(filePath);
      const importResponse = await importResponsePromise;
      const importBody = await importResponse.json();

      if (!importResponse.ok()) {
        throw new Error(`Importação falhou (${importResponse.status()}): ${JSON.stringify(importBody)}`);
      }

      result.importacao_id = importBody?.importacao_id ?? null;

      await expect(page.getByText('PDF importado com sucesso!')).toBeVisible();

      const tipoPedidoDropdown = page
        .locator('.p-card:has(.p-card-title:has-text("Dados do Pedido")) .field:has(label:has-text("Tipo")) .p-dropdown')
        .first();
      await selectPrimeDropdownOption(page, tipoPedidoDropdown, 'Reposição (Estoque)');

      const numeroInput = page
        .locator('.p-card:has(.p-card-title:has-text("Dados do Pedido")) input[placeholder="Ex: 12345"]')
        .first();
      if (await numeroInput.isVisible()) {
        const numeroAtual = ((await numeroInput.inputValue()) || '').trim();
        if (numeroAtual) {
          const sufixo = `-E2E-${Date.now().toString().slice(-6)}`;
          const numeroNovo = `${numeroAtual}${sufixo}`.slice(0, 50);
          await numeroInput.fill(numeroNovo);
        }
      }

      await preencherCategoriasPendentes(page);

      const confirmResponsePromise = page.waitForResponse(
        (resp) => resp.url().includes('/api/v1/pedidos/import/pdf/confirm') && resp.request().method() === 'POST',
        { timeout: 120_000 }
      );

      await page.getByRole('button', { name: 'Confirmar e Salvar Pedido' }).click();

      const confirmResponse = await confirmResponsePromise;
      const confirmBody = await confirmResponse.json();

      if (!confirmResponse.ok()) {
        throw new Error(`Confirmação falhou (${confirmResponse.status()}): ${JSON.stringify(confirmBody)}`);
      }

      result.pedido_id = confirmBody?.id ?? confirmBody?.pedido_id ?? null;
      result.mensagem_ui = 'Pedido Confirmado';

      await expect(page.getByText('Pedido Confirmado')).toBeVisible();

      let userToken = null;
      try {
        const storedUser = await page.evaluate(() => localStorage.getItem('user'));
        const parsed = storedUser ? JSON.parse(storedUser) : null;
        userToken = parsed?.token || null;
      } catch (error) {
        userToken = null;
      }

      if (result.pedido_id && userToken) {
        const backendResponse = await request.get(
          `${ESTOQUE_BASE_URL}/api/v1/pedidos/${result.pedido_id}`,
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
              Accept: 'application/json',
            },
          }
        );

        const backendBody = await backendResponse.json();
        const itens = Array.isArray(backendBody?.itens) ? backendBody.itens : [];
        const total = Number(backendBody?.valor_total ?? backendBody?.pedido?.valor_total ?? 0);

        result.backend_validacao = {
          status: backendResponse.status(),
          pedido_id: backendBody?.id ?? null,
          itens: itens.length,
          total,
        };
      }

      result.status = 'OK';
    } catch (error) {
      result.erro = error?.stack || String(error);

      if (!page.isClosed()) {
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${safeName}-erro.png`), fullPage: true });
      }
    } finally {
      result.tempo_ms = Date.now() - startedAt;
      if (!page.isClosed()) {
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${safeName}-depois.png`), fullPage: true });
      }
      report.push(result);
    }
  }

  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf-8');

  const failures = report.filter((item) => item.status === 'FAIL');
  expect(failures, `Falhas no relatório: ${JSON.stringify(failures, null, 2)}`).toHaveLength(0);
});
