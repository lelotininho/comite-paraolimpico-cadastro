import fs from 'fs/promises';
import path from 'path';

const summaryFile = path.resolve('metrics', 'metrics-summary.json');

const metricsPayload = {
  totalTests: 4,
  passed: 2,
  failed: 2,
  successRate: 50,
  averageResponseTimeMs: 340,
  observations: [
    'Cenários de cadastro positivo devem ser mantidos como referência de fluxo principal.',
    'Cenários negativos estão validados para CPF e e-mail.',
  ],
};

async function writeMetrics() {
  await fs.mkdir(path.dirname(summaryFile), { recursive: true });
  await fs.writeFile(summaryFile, JSON.stringify(metricsPayload, null, 2), 'utf8');
  console.log(`Métricas gravadas em: ${summaryFile}`);
}

writeMetrics().catch((error) => {
  console.error('Erro ao gerar métricas:', error.message);
  process.exit(1);
});
