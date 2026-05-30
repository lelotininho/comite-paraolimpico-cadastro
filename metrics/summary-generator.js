import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const screenshotsDir = path.resolve('cypress', 'screenshots');
const outputFile = path.resolve('metrics', 'metrics-summary.json');

// ── Conta screenshots por status ──────────────────────────────────────────

async function countScreenshots() {
  const counts = { passed: 0, failed: 0 };
  if (!existsSync(screenshotsDir)) return counts;

  const suites = await fs.readdir(screenshotsDir);
  for (const suite of suites) {
    const suiteDir = path.join(screenshotsDir, suite);
    const stat = await fs.stat(suiteDir);
    if (!stat.isDirectory()) continue;

    const files = await fs.readdir(suiteDir);
    for (const file of files) {
      file.includes('(failed)') ? counts.failed++ : counts.passed++;
    }
  }
  return counts;
}

async function generateMetrics() {
  const { passed, failed } = await countScreenshots();
  const total = passed + failed;
  const successRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 'N/A';

  const metrics = {
    generatedAt: new Date().toISOString(),
    environment: process.env.BASE_URL || 'https://homologcadastroweb.cpb.org.br/cadastro-geral-web',
    totalTests: total,
    passed,
    failed,
    successRate: `${successRate}%`,
    coverage: {
      positive: 5,
      negative: 19,
      flow: 7,
      api: 8,
    },
    notes: [
      'Dados derivados dos screenshots gerados pelo Cypress.',
      'Execute "npm run collect:evidence" para detalhes por teste.',
      'Testes de performance separados: npm run perf',
    ],
  };

  await fs.writeFile(outputFile, JSON.stringify(metrics, null, 2), 'utf8');
  console.log(`Métricas gravadas em: ${outputFile}`);
  console.log(`Total: ${total} | Passou: ${passed} | Falhou: ${failed} | Taxa: ${successRate}%`);
}

generateMetrics().catch((err) => {
  console.error('Erro ao gerar métricas:', err.message);
  process.exit(1);
});
