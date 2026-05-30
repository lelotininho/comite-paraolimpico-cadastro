import { ClubRegistrationPage } from '../../pages/clubRegistrationPage.js';
import { LoginPage } from '../../pages/loginPage.js';
import { generateClubData } from '../../support/dataGenerator.js';

const page = new ClubRegistrationPage();
const loginPage = new LoginPage();
const API = Cypress.env('API_BASE_URL');

describe('Registrar Clube - Cenários Positivos', () => {
  // ── CT-P01 ────────────────────────────────────────────────────────────────
  it('CT-P01 | Acesso via botão "Registrar Clube" na tela de login', () => {
    loginPage.visit();
    loginPage.clickRegistrarClube();
    page.assertOnRegistrationPage();
    page.waitForDialog();
  });

  // ── CT-P02 ────────────────────────────────────────────────────────────────
  it('CT-P02 | Formulário exibido após confirmar aviso da popup', () => {
    page.visit();
    page.confirmDialog();
    cy.get('[name="cnpjClube"]').should('exist').and('be.visible');
  });

  // ── CT-P03 ────────────────────────────────────────────────────────────────
  it('CT-P03 | Busca de CNPJ não cadastrado habilita preenchimento manual', () => {
    const data = generateClubData();
    page.visit();
    page.confirmDialog();

    // Stub API so we control the CNPJ lookup result (404 = não encontrado)
    cy.intercept('GET', `**/public/clubes/cnpj/**`, { statusCode: 404, body: {} }).as('cnpjNotFound');

    page.fillCNPJ(data.cnpjClube);
    page.searchCNPJ();

    cy.wait('@cnpjNotFound');
    page.assertCNPJNotFound();
    cy.dismissSwal();

    // Form fields should be enabled for manual fill
    cy.get('[name="nomeCompletoClube"]').should('not.be.disabled');
  });

  // ── CT-P04 ────────────────────────────────────────────────────────────────
  it('CT-P04 | Cadastro completo do clube com stub da submissão', () => {
    const data = generateClubData();

    cy.intercept('GET', '**/paises/1/estados', {
      body: { data: [{ id: 1, nome: 'SÃO PAULO', uf: 'SP' }, { id: 2, nome: 'RIO DE JANEIRO', uf: 'RJ' }] },
    }).as('estados');
    cy.intercept('GET', '**/public/clubes/cnpj/**', { statusCode: 404, body: {} }).as('cnpjLookup');
    cy.intercept('POST', '**/public/clubes', { statusCode: 201, body: { id: 1 } }).as('createClub');
    cy.intercept('GET', '**/cep/**', { statusCode: 404, body: {} }).as('cepApi');
    cy.intercept('GET', 'https://viacep.com.br/**', { body: { erro: 'true' } }).as('viacep');
    cy.intercept('GET', '**/estados/*/cidades', { body: { data: [{ id: 1, nome: 'São Paulo' }] } }).as('cidades');
    cy.intercept('GET', '**/public/clubes/gestor/**', { statusCode: 404, body: {} }).as('cpfLookup');

    page.visit();
    cy.wait('@estados', { timeout: 15000 });
    page.confirmDialog();

    page.fillCNPJ(data.cnpjClube);
    page.searchCNPJ();
    cy.wait('@cnpjLookup');
    cy.dismissSwal();

    page.fillClubData(data);
    page.fillCEP(data.cepClube);
    page.fillEndereco(data.enderecoClube);
    page.fillNumero(data.numeroClube);
    page.fillBairro(data.bairroClube);
    page.selectEstado();
    cy.wait('@cidades');
    page.selectCidade();

    // Presidente — pesquisa CPF para habilitar os campos do formulário
    page.fillCPFPresidente(data.cpfPresidente);
    page.searchCPFPresidente();
    cy.wait('@cpfLookup');
    cy.dismissSwal();
    page.fillNomePresidente(data.nomePresidente);
    page.selectGeneroPresidente();
    page.fillEmailPresidente(data.emailPresidente);
    page.fillDataNascimentoPresidente(data.dataNascimentoPresidente);
    page.fillTelefonePresidente(data.telefonePresidente);
    page.fillDataEleicaoPresidente(data.dataEleicaoPresidente);
    page.fillDataInicioMandato(data.dataInicioMandatoPresidente);
    page.fillDataTerminoMandato(data.dataTerminoMandatoPresidente);

    // Diretor — mesma lógica de pesquisa de CPF
    page.fillCPFDiretor(data.cpfDiretor);
    page.searchCPFDiretor();
    cy.wait('@cpfLookup');
    cy.dismissSwal();
    page.fillNomeDiretor(data.nomeDiretor);
    page.selectGeneroDiretor();
    page.fillEmailDiretor(data.emailDiretor);
    page.fillDataNascimentoDiretor(data.dataNascimentoDiretor);
    page.fillTelefoneDiretor(data.telefoneDiretor);

    page.selectFirstModalidade();
    page.save();
    cy.wait('@createClub');
    page.assertSuccessMessage();
  });

  // ── CT-P05 ────────────────────────────────────────────────────────────────
  it('CT-P05 | Endpoint de modalidades retorna lista para exibição', () => {
    cy.request({
      method: 'GET',
      url: `${API}/public/clubes/modalidades`,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(200);
      const items = res.body.data ?? res.body;
      expect(items).to.be.an('array').and.not.be.empty;
    });
  });
});
