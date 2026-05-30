import { ClubRegistrationPage } from '../../pages/clubRegistrationPage.js';
import { LoginPage } from '../../pages/loginPage.js';

const page = new ClubRegistrationPage();
const loginPage = new LoginPage();

describe('Registrar Clube - Cenários de Fluxo', () => {
  // ── CT-F01 ────────────────────────────────────────────────────────────────
  it('CT-F01 | Popup de aviso é exibida ao acessar o formulário', () => {
    page.visit();
    page.waitForDialog();
    cy.get('#clubeExternoDialog .modal-title').should('contain.text', 'Informações para Cadastro de Clube');
  });

  // ── CT-F02 ────────────────────────────────────────────────────────────────
  // Comportamento real: "Cancelar" chama sair() → signOut() → redireciona para login.
  it('CT-F02 | Clicar em "Cancelar" na popup redireciona para fora do formulário', () => {
    page.visit();
    page.cancelDialog();
    cy.url().should('not.include', '/public/clubes-externos');
  });

  // ── CT-F03 ────────────────────────────────────────────────────────────────
  it('CT-F03 | Clicar em "Continuar" na popup exibe o formulário de cadastro', () => {
    page.visit();
    page.confirmDialog();
    cy.get('[name="cnpjClube"]').should('be.visible').and('not.be.disabled');
  });

  // ── CT-F04 ────────────────────────────────────────────────────────────────
  it('CT-F04 | Popup exibe instruções sobre documentação necessária', () => {
    page.visit();
    page.waitForDialog();
    cy.get('#clubeExternoDialog .modal-body').should('contain.text', 'estatuto');
  });

  // ── CT-F05 ────────────────────────────────────────────────────────────────
  // Requer cy.origin() para cruzar domínio Keycloak → Angular.
  it('CT-F05 | Fluxo completo: login → popup → formulário via botão "Registrar Clube"', () => {
    loginPage.visit();
    loginPage.clickRegistrarClube();
    page.assertOnRegistrationPage();
    page.waitForDialog();
    page.confirmDialog();
    cy.get('[name="cnpjClube"]').should('be.visible');
  });

  // ── CT-F06 ────────────────────────────────────────────────────────────────
  it('CT-F06 | Botão "Voltar" retorna à tela anterior', () => {
    page.visit();
    page.confirmDialog();
    page.goBack();
    // O botão Voltar navega de volta; a URL sai de /public/clubes-externos
    cy.url().should('not.include', '/public/clubes-externos');
  });

  // ── CT-F07 ────────────────────────────────────────────────────────────────
  it('CT-F07 | Campos do formulário iniciam vazios após confirmar popup', () => {
    page.visit();
    page.confirmDialog();
    cy.get('[name="nomeCompletoClube"]').should('have.value', '');
    cy.get('[name="emailClube"]').should('have.value', '');
    cy.get('[name="telefoneClube"]').should('have.value', '');
  });
});
