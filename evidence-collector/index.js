import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const screenshotsDir = path.resolve('cypress', 'screenshots');
const outputDir = path.resolve('evidence-collector', 'output');
const outputFile = path.join(outputDir, 'evidence-summary.json');

// Coleta recursivamente todos os .png dentro de screenshotsDir.
// Estrutura esperada: screenshots/<categoria>/<spec>.cy.js/<arquivo>.png
async function collectPngs(dir, evidence, baseDir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await collectPngs(fullPath, evidence, baseDir);
    } else if (entry.name.endsWith('.png')) {
      const relativePath = path.relative(baseDir, fullPath);
      // Extrai a categoria (positive, negative, flow, api) do caminho relativo
      const parts = relativePath.split(path.sep);
      const category = parts[0];
      const failed = entry.name.includes('(failed)');
      const testName = entry.name
        .replace(/ \(failed\)( \(\d+\))?\.png$/, '')
        .replace(/\.png$/, '');
      evidence.push({
        category,
        test: testName,
        status: failed ? 'FAILED' : 'PASSED',
        screenshot: path.join('cypress', 'screenshots', relativePath),
        capturedAt: new Date().toISOString(),
      });
    }
  }
}

async function collectEvidence() {
  await fs.mkdir(outputDir, { recursive: true });

  const evidence = [];

  if (!existsSync(screenshotsDir)) {
    console.warn('Nenhuma screenshot encontrada. Execute os testes primeiro.');
  } else {
    await collectPngs(screenshotsDir, evidence, screenshotsDir);
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    environment: process.env.BASE_URL || 'https://homologcadastroweb.cpb.org.br/cadastro-geral-web',
    total: evidence.length,
    failures: evidence.filter((e) => e.status === 'FAILED').length,
    passed: evidence.filter((e) => e.status === 'PASSED').length,
    byCategory: ['flow', 'positive', 'negative', 'api'].reduce((acc, cat) => {
      const items = evidence.filter((e) => e.category === cat);
      acc[cat] = { total: items.length, failures: items.filter((e) => e.status === 'FAILED').length };
      return acc;
    }, {}),
    evidence,
  };

  await fs.writeFile(outputFile, JSON.stringify(summary, null, 2), 'utf8');
  console.log(`Evidências gravadas em: ${outputFile}`);
  console.log(`Total: ${summary.total} | Falhas: ${summary.failures} | Passou: ${summary.passed}`);
  for (const [cat, stat] of Object.entries(summary.byCategory)) {
    if (stat.total > 0) console.log(`  ${cat}: ${stat.total} screenshot(s), ${stat.failures} falha(s)`);
  }
}

collectEvidence().catch((err) => {
  console.error('Erro ao coletar evidências:', err.message);
  process.exit(1);
});
