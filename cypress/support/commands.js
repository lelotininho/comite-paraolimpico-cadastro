// ── ng-select helper ──────────────────────────────────────────────────────
// Estrutura real no DOM: <div id="estadoClube"> (wrapper) > <ng-select class="ng-select"> > <div class="ng-select-container">
// A verificação de disabled deve ser no .ng-select interno, não no wrapper div.
// O input em ng-select fica em <div class="ng-input"><input ...>, não como input.ng-input.
Cypress.Commands.add('selectNgOption', (selector, text = null) => {
  cy.get(selector).scrollIntoView();
  // Aguarda o ng-select interno ficar habilitado (não o wrapper div)
  cy.get(`${selector} .ng-select`).should('not.have.class', 'ng-select-disabled');
  cy.get(`${selector} .ng-select-container`).click({ force: true });

  cy.get('.ng-dropdown-panel', { timeout: 15000 }).should('be.visible');

  if (text) {
    cy.get(`${selector} .ng-input input`).type(text, { force: true });
    cy.get('.ng-dropdown-panel .ng-option').contains(text).click({ force: true });
  } else {
    cy.get('.ng-dropdown-panel .ng-option').not('.ng-option-disabled').first().click({ force: true });
  }
});

// ── SweetAlert2 helpers ───────────────────────────────────────────────────
Cypress.Commands.add('dismissSwal', () => {
  cy.get('.swal2-confirm', { timeout: 10000 }).click();
});

Cypress.Commands.add('assertSwalContains', (text) => {
  cy.get('.swal2-popup').should('be.visible');
  cy.get('.swal2-html-container, .swal2-content').should('contain.text', text);
});
