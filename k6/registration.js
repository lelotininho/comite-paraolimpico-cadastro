import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

// ── Métricas customizadas ─────────────────────────────────────────────────
const cnpjLookupDuration = new Trend('cnpj_lookup_duration');
const clubCreationDuration = new Trend('club_creation_duration');
const errorRate = new Rate('errors');

// ── Configuração de carga ─────────────────────────────────────────────────
export const options = {
  stages: [
    { duration: '10s', target: 5 },   // aquecimento
    { duration: '30s', target: 20 },  // carga nominal
    { duration: '10s', target: 0 },   // redução
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],    // 95% das respostas < 2s
    http_req_failed: ['rate<0.05'],       // menos de 5% de erro
    cnpj_lookup_duration: ['p(95)<1500'],
    club_creation_duration: ['p(95)<3000'],
  },
};

const BASE_URL = __ENV.TARGET_URL || 'https://homologcadastroweb.cpb.org.br/api/cadastro-api/v1';
const headers = { 'Content-Type': 'application/json' };

// ── Gerador simples de CNPJ válido ────────────────────────────────────────
function randomDigits(n) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 10));
}

function cnpjCheckDigit(arr, weights) {
  const sum = arr.reduce((acc, d, i) => acc + d * weights[i], 0);
  const rem = sum % 11;
  return rem < 2 ? 0 : 11 - rem;
}

function generateCNPJ() {
  const d = [Math.floor(Math.random() * 8) + 1, ...randomDigits(11)];
  d.push(cnpjCheckDigit(d, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]));
  d.push(cnpjCheckDigit(d, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]));
  return d.join('');
}

// ── Gerador simples de CPF válido ─────────────────────────────────────────
function generateCPF() {
  const d = randomDigits(9);
  const r1 = d.reduce((a, v, i) => a + v * (10 - i), 0) % 11;
  d.push(r1 < 2 ? 0 : 11 - r1);
  const r2 = d.reduce((a, v, i) => a + v * (11 - i), 0) % 11;
  d.push(r2 < 2 ? 0 : 11 - r2);
  return d.join('');
}

// ── Cenário principal ─────────────────────────────────────────────────────
export default function () {
  const cnpj = generateCNPJ();

  // CT-PERF-01: busca de CNPJ (simula pesquisa antes do cadastro)
  const lookupRes = http.get(`${BASE_URL}/public/clubes/cnpj/${cnpj}`, { headers });
  cnpjLookupDuration.add(lookupRes.timings.duration);
  check(lookupRes, {
    'lookup: status 200 ou 404': (r) => r.status === 200 || r.status === 404,
  });
  errorRate.add(lookupRes.status !== 200 && lookupRes.status !== 404);

  sleep(0.5);

  // CT-PERF-02: tentativa de criação (payload inválido — evita poluir o banco)
  const postRes = http.post(
    `${BASE_URL}/public/clubes`,
    JSON.stringify({ cnpjClube: cnpj }),
    { headers }
  );
  clubCreationDuration.add(postRes.timings.duration);
  check(postRes, {
    'create: retorna 4xx para payload incompleto': (r) => r.status >= 400 && r.status < 500,
  });
  errorRate.add(postRes.status < 400 || postRes.status >= 500);

  sleep(1);
}

// ── Sumário final ─────────────────────────────────────────────────────────
export function handleSummary(data) {
  return {
    'metrics/k6-summary.json': JSON.stringify(data, null, 2),
    stdout: `
=== Resumo de Performance ===
Ambiente: ${BASE_URL}
Requisições: ${data.metrics.http_reqs.values.count}
Taxa de erro: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%
p(95) req: ${data.metrics.http_req_duration.values['p(95)'].toFixed(0)}ms
`,
  };
}
