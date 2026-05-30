import { generateClubData, generateCNPJ, INVALID_CPF } from '../../support/dataGenerator.js';

const API = Cypress.env('API_BASE_URL');

// ── Helpers ───────────────────────────────────────────────────────────────
// O endpoint POST /public/clubes exige multipart/form-data.

function postClub(fields, alias = 'postClub') {
  const body = new Blob(
    [Object.entries(fields)
      .map(([k, v]) => `--boundary\r\nContent-Disposition: form-data; name="${k}"\r\n\r\n${v}`)
      .join('\r\n') + '\r\n--boundary--'],
    { type: 'multipart/form-data; boundary=boundary' }
  );

  return cy.request({
    method: 'POST',
    url: `${API}/public/clubes`,
    headers: { 'Content-Type': 'multipart/form-data; boundary=boundary' },
    body: Object.entries(fields)
      .map(([k, v]) => `--boundary\r\nContent-Disposition: form-data; name="${k}"\r\n\r\n${v}`)
      .join('\r\n') + '\r\n--boundary--',
    failOnStatusCode: false,
  }).as(alias);
}

// ── Testes de API ─────────────────────────────────────────────────────────

describe('API - Registrar Clube', () => {
  // ── CT-A01 ──────────────────────────────────────────────────────────────
  it('CT-A01 | GET modalidades retorna 200 com lista de esportes paralímpicos', () => {
    cy.request(`${API}/public/clubes/modalidades`).then((res) => {
      expect(res.status).to.eq(200);
      const items = res.body.data ?? res.body;
      expect(items).to.be.an('array').and.have.length.greaterThan(0);
      expect(items[0]).to.have.property('nome');
      cy.log(`✅ ${items.length} modalidades retornadas: ${items.slice(0,3).map(m=>m.nome).join(', ')}...`);
    });
  });

  // ── CT-A02 ──────────────────────────────────────────────────────────────
  it('CT-A02 | GET por CNPJ inexistente retorna 404', () => {
    const cnpj = generateCNPJ().replace(/\D/g, '');
    cy.request({ url: `${API}/public/clubes/cnpj/${cnpj}`, failOnStatusCode: false }).then((res) => {
      expect(res.status).to.eq(404);
    });
  });

  // ── CT-A03 ──────────────────────────────────────────────────────────────
  // BUG-01: CNPJ inválido 00000000000000 retorna 200 com registro interno "SEM CLUBE"
  // em vez de 400. A API não valida o formato CNPJ antes de consultar o banco.
  it('CT-A03 | [BUG-01] CNPJ 00000000000000 expõe registro interno "SEM CLUBE" (esperado: 400)', () => {
    cy.request({ url: `${API}/public/clubes/cnpj/00000000000000`, failOnStatusCode: false }).then((res) => {
      expect(res.status).to.eq(200); // comportamento atual (incorreto)
      const clube = res.body?.data?.clube ?? res.body;
      expect(clube.nomeCompletoClube).to.eq('SEM CLUBE');
      cy.log('⚠️ BUG-01 confirmado: CNPJ inválido expõe registro interno "SEM CLUBE"');
    });
  });

  // ── CT-A04 ──────────────────────────────────────────────────────────────
  // BUG-05: POST com multipart vazio retorna 201 em vez de 400.
  // A API não valida campos obrigatórios no lado servidor — depende apenas do frontend.
  it('CT-A04 | [BUG-05] POST sem campos obrigatórios retorna 201 (esperado: 400)', () => {
    postClub({});
    cy.get('@postClub').then((res) => {
      // Documenta o comportamento atual (bug): API aceita payload vazio
      expect(res.status).to.eq(201);
      cy.log('⚠️ BUG-05 confirmado: POST sem campos retorna 201 — sem validação server-side');
    });
  });

  // ── CT-A05 ──────────────────────────────────────────────────────────────
  it('CT-A05 | [BUG-05] POST com apenas CNPJ inválido também retorna 201 (sem validação)', () => {
    postClub({ cnpjClube: '00000000000000' });
    cy.get('@postClub').its('status').should('eq', 201);
  });

  // ── CT-A06 ──────────────────────────────────────────────────────────────
  it('CT-A06 | GET por CPF do gestor retorna 200 ou 404 (endpoint de busca de presidente/diretor)', () => {
    const cpf = '12345678909'; // CPF de exemplo
    cy.request({ url: `${API}/public/clubes/gestor/${cpf}`, failOnStatusCode: false }).then((res) => {
      expect(res.status).to.be.oneOf([200, 404]);
    });
  });

  // ── CT-A07 ──────────────────────────────────────────────────────────────
  it('CT-A07 | GET modalidades retorna array com propriedades id e nome em cada item', () => {
    cy.request(`${API}/public/clubes/modalidades`).then((res) => {
      const items = res.body.data ?? res.body;
      items.forEach((item) => {
        expect(item).to.have.property('id');
        expect(item).to.have.property('nome');
      });
    });
  });

  // ── CT-A08 ──────────────────────────────────────────────────────────────
  it('CT-A08 | GET por CNPJ retorna estrutura de dados correta quando encontrado', () => {
    // Usa CNPJ sentinela que sabemos existir no ambiente (BUG-01 confirmado)
    cy.request({ url: `${API}/public/clubes/cnpj/00000000000000`, failOnStatusCode: false }).then((res) => {
      if (res.status === 200) {
        const clube = res.body?.data?.clube ?? res.body;
        expect(clube).to.have.property('nomeCompletoClube');
        expect(clube).to.have.property('cnpjClube');
      } else {
        expect(res.status).to.eq(404);
      }
    });
  });
});
