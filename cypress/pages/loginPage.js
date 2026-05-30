export class LoginPage {
  visit() {
    cy.visit('/');
    // Angular redireciona automaticamente para o Keycloak quando não autenticado.
    // Cypress 12 segue o redirect — após isso estamos no domínio homologlogin.cpb.org.br.
    cy.url().should('include', 'homologlogin.cpb.org.br', { timeout: 20000 });
  }

  clickRegistrarClube() {
    // Já estamos no domínio do Keycloak após o redirect — sem cy.origin() necessário
    cy.get('a[href*="public/clubes-externos"]').click();
  }

  assertOnLoginPage() {
    cy.get('#kc-form-login').should('exist');
  }
}
