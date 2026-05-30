import './commands';

Cypress.on('uncaught:exception', () => false);

// Gera screenshot ao final de cada teste (passa ou falha) para evidência
afterEach(function () {
  const status = this.currentTest.state === 'passed' ? 'PASSED' : 'FAILED';
  const title = this.currentTest.title.replace(/[^a-zA-Z0-9 _-]/g, '').trim().substring(0, 80);
  cy.screenshot(`${title} -- ${status}`, { overwrite: true });
});
