import { generateRegistrationData } from '../../support/dataGenerator.js';

const API_BASE_URL = Cypress.env('API_BASE_URL') || 'http://localhost:3000/api/cadastro';

describe('API - Cadastro de atletas e representantes', () => {
  it('Deve criar um cadastro válido via API', () => {
    const payload = generateRegistrationData({ categoria: 'atleta' });

    cy.request({
      method: 'POST',
      url: API_BASE_URL,
      body: payload,
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.be.oneOf([200, 201]);
      expect(response.body).to.have.property('id');
      expect(response.body).to.include({ categoria: 'atleta' });
    });
  });

  it('Deve retornar erro ao enviar e-mail inválido', () => {
    const payload = generateRegistrationData({ email: 'usuario-invalido' });

    cy.request({
      method: 'POST',
      url: API_BASE_URL,
      body: payload,
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.be.oneOf([400, 422]);
      expect(response.body).to.have.property('error');
    });
  });
});
