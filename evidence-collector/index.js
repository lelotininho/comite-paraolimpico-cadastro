import fs from 'fs/promises';
import path from 'path';

const outputDir = path.resolve('evidence-collector', 'output');
const evidenceFile = path.join(outputDir, 'evidence-summary.json');

const evidenceItems = [
  {
    name: 'Teste cadastro válido',
    status: 'OK',
    file: '../tests/positive/registration_positive.spec.js',
    notes: 'Registra fluxo de cadastro de atleta e representante.',
  },
  {
    name: 'Teste cadastro sem CPF',
    status: 'NOK',
    file: '../tests/negative/registration_negative.spec.js',
    notes: 'Validação de campo obrigatório deve ser exibida.',
  },
];

async function writeEvidence() {
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(evidenceFile, JSON.stringify(evidenceItems, null, 2), 'utf8');
  console.log(`Evidências gravadas em: ${evidenceFile}`);
}

writeEvidence().catch((error) => {
  console.error('Erro ao gerar evidências:', error.message);
  process.exit(1);
});
