import { ClubRegistrationPage } from '../../pages/clubRegistrationPage.js';
import { generateClubData, generateCPF, INVALID_CPF, INVALID_CNPJ } from '../../support/dataGenerator.js';

const page = new ClubRegistrationPage();

// Todos os campos além do cnpjClube ficam desabilitados até a busca de CNPJ.
// enableForm() habilita o formulário via lookup 404.
function enableForm() {
  const cnpj = generateClubData().cnpjClube;
  cy.intercept('GET', '**/public/clubes/cnpj/**', { statusCode: 404, body: {} }).as('cnpjLookup');
  page.fillCNPJ(cnpj);
  page.searchCNPJ();
  cy.wait('@cnpjLookup');
  cy.dismissSwal();
}

// enablePresidenteSection() habilita os campos do presidente via busca de CPF.
function enablePresidenteSection() {
  cy.intercept('GET', '**/public/clubes/gestor/**', { statusCode: 404, body: {} }).as('cpfLookup');
  page.fillCPFPresidente(generateCPF());
  page.searchCPFPresidente();
  cy.wait('@cpfLookup');
}

// enableDiretorSection() habilita os campos do diretor via busca de CPF.
function enableDiretorSection() {
  cy.intercept('GET', '**/public/clubes/gestor/**', { statusCode: 404, body: {} }).as('cpfLookupDiretor');
  page.fillCPFDiretor(generateCPF());
  page.searchCPFDiretor();
  cy.wait('@cpfLookupDiretor');
}

function touchField(name) {
  cy.get(`[name="${name}"]`).focus({ force: true }).blur({ force: true });
}

describe('Registrar Clube - Cenários Negativos', () => {
  beforeEach(() => {
    page.visit();
    page.confirmDialog();
  });

  // ── CNPJ ──────────────────────────────────────────────────────────────────

  it('CT-N01 | Não deve aceitar CNPJ com formato inválido', () => {
    // "123" é curto demais — Angular marca ng-invalid imediatamente (sem precisar de ng-touched)
    cy.get('[name="cnpjClube"]').type('123', { force: true });
    cy.get('[name="cnpjClube"]').should('have.class', 'ng-invalid');
  });

  it('CT-N02 | Alerta exibido para CNPJ já cadastrado no sistema', () => {
    cy.intercept('GET', '**/public/clubes/cnpj/**', {
      statusCode: 200,
      body: { data: { status: 'APROVADO', id: 99 } },
    }).as('cnpjFound');
    page.fillCNPJ(generateClubData().cnpjClube);
    page.searchCNPJ();
    cy.wait('@cnpjFound');
    page.assertCNPJAlreadyRegistered();
  });

  // ── Dados do Clube ────────────────────────────────────────────────────────

  it('CT-N03 | Não deve submeter sem nome completo do clube', () => {
    enableForm();
    page.fillSigla('TESTE');
    page.save();
    touchField('nomeCompletoClube');
    cy.get('[name="nomeCompletoClube"]').should('have.class', 'is-invalid');
  });

  it('CT-N04 | Não deve submeter com e-mail do clube inválido', () => {
    enableForm();
    page.fillEmail('email-invalido');
    touchField('emailClube');
    cy.get('[name="emailClube"]').should('have.class', 'is-invalid');
  });

  it('CT-N05 | Não deve submeter sem e-mail do clube', () => {
    enableForm();
    page.fillNomeCompleto('CLUBE PARALIMPICO TESTE');
    page.save();
    touchField('emailClube');
    cy.get('[name="emailClube"]').should('have.class', 'is-invalid');
  });

  it('CT-N06 | Sigla do clube não deve aceitar mais de 15 caracteres', () => {
    enableForm();
    page.fillSigla('SIGLACOMMAISDEQUINZECARACTERES');
    cy.get('[name="siglaClube"]').invoke('val').should('have.length.at.most', 15);
  });

  it('CT-N07 | Formulário não deve concluir sem telefone do clube', () => {
    enableForm();
    page.fillNomeCompleto('CLUBE PARALIMPICO TESTE');
    page.fillEmail('clube@teste.com');
    page.save();
    // Sem telefone, o form é inválido: não deve exibir mensagem de sucesso
    cy.get('body').should('not.contain.text', 'Clube incluído com sucesso');
  });

  // ── Endereço ──────────────────────────────────────────────────────────────

  it('CT-N08 | Não deve submeter sem CEP', () => {
    enableForm();
    page.fillClubData(generateClubData());
    page.save();
    touchField('cepClube');
    cy.get('[name="cepClube"]').should('have.class', 'is-invalid');
  });

  it('CT-N09 | Não deve submeter sem bairro', () => {
    enableForm();
    const data = generateClubData();
    page.fillClubData(data);
    page.fillCEP(data.cepClube);
    page.fillEndereco(data.enderecoClube);
    page.fillNumero(data.numeroClube);
    page.save();
    touchField('bairroClube');
    cy.get('[name="bairroClube"]').should('have.class', 'is-invalid');
  });

  // ── Presidente ────────────────────────────────────────────────────────────

  it('CT-N10 | Não deve aceitar CPF inválido para o presidente', () => {
    enableForm();
    page.fillCPFPresidente(INVALID_CPF);
    touchField('cpfPresidente');
    cy.get('[name="cpfPresidente"]').should('have.class', 'is-invalid');
  });

  it('CT-N11 | Nome do presidente é obrigatório', () => {
    enableForm();
    enablePresidenteSection(); // habilita campos do presidente via busca CPF
    page.save();
    touchField('nomePresidente');
    cy.get('[name="nomePresidente"]').should('have.class', 'is-invalid');
  });

  it('CT-N12 | Gênero do presidente é obrigatório — formulário não conclui sem seleção', () => {
    enableForm();
    enablePresidenteSection();
    page.fillNomePresidente('JOSE DA SILVA PARALIMPICO');
    page.save();
    cy.get('body').should('not.contain.text', 'Clube incluído com sucesso');
  });

  it('CT-N13 | Data de eleição do presidente é obrigatória', () => {
    enableForm();
    enablePresidenteSection();
    page.fillNomePresidente('JOSE DA SILVA PARALIMPICO');
    page.save();
    touchField('dataEleicaoPresidente');
    cy.get('[name="dataEleicaoPresidente"]').should('have.class', 'is-invalid');
  });

  it('CT-N14 | Data de início de mandato é obrigatória', () => {
    enableForm();
    enablePresidenteSection();
    page.fillNomePresidente('JOSE DA SILVA PARALIMPICO');
    page.save();
    touchField('dataInicioMandatoPresidente');
    cy.get('[name="dataInicioMandatoPresidente"]').should('have.class', 'is-invalid');
  });

  it('CT-N15 | Data de término de mandato é obrigatória', () => {
    enableForm();
    enablePresidenteSection();
    page.fillNomePresidente('JOSE DA SILVA PARALIMPICO');
    page.save();
    touchField('dataTerminoMandatoPresidente');
    cy.get('[name="dataTerminoMandatoPresidente"]').should('have.class', 'is-invalid');
  });

  // ── Diretor ───────────────────────────────────────────────────────────────

  it('CT-N16 | Não deve aceitar CPF inválido para o diretor', () => {
    enableForm();
    page.fillCPFDiretor(INVALID_CPF);
    touchField('cpfDiretor');
    cy.get('[name="cpfDiretor"]').should('have.class', 'is-invalid');
  });

  it('CT-N17 | Nome do diretor técnico é obrigatório', () => {
    enableForm();
    enableDiretorSection(); // habilita campos do diretor via busca CPF
    page.save();
    touchField('nomeDiretor');
    cy.get('[name="nomeDiretor"]').should('have.class', 'is-invalid');
  });

  it('CT-N18 | Gênero do diretor técnico é obrigatório — formulário não conclui sem seleção', () => {
    enableForm();
    enableDiretorSection();
    page.fillNomeDiretor('MARIA SANTOS PARALIMPICA');
    page.save();
    cy.get('body').should('not.contain.text', 'Clube incluído com sucesso');
  });

  // ── Formulário vazio ──────────────────────────────────────────────────────

  it('CT-N19 | Submissão com formulário vazio não exibe mensagem de sucesso', () => {
    page.save();
    cy.get('body').should('not.contain.text', 'Clube incluído com sucesso');
    touchField('cnpjClube');
    cy.get('[name="cnpjClube"]').should('have.class', 'is-invalid');
  });
});
