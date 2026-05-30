import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 20,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.TARGET_URL || 'https://comite-paralimpico.exemplo/api/cadastro';

export default function () {
  const payload = JSON.stringify({
    nome: 'Teste K6',
    cpf: '12345678909',
    email: 'k6.teste@example.com',
    telefone: '+5511999999999',
    categoria: 'atleta',
  });

  const headers = { 'Content-Type': 'application/json' };
  const response = http.post(BASE_URL, payload, { headers });

  check(response, {
    'status 201': (res) => res.status === 201,
    'retorno contém id': (res) => res.json('id') !== undefined,
  });

  sleep(1);
}
