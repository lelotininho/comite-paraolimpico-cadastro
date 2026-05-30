// Opção force: true usada em todos os fills — necessário porque:
// 1. Alguns campos ficam desabilitados até a busca de CNPJ
// 2. O modal Bootstrap pode ainda estar animando em headless Chrome

export class ClubRegistrationPage {
  // ── Navigation ────────────────────────────────────────────────────────────

  visit() {
    cy.visit('/public/clubes-externos');
  }

  // ── Info dialog (shown on component load) ─────────────────────────────────

  waitForDialog() {
    cy.get('#clubeExternoDialog', { timeout: 10000 }).should('be.visible');
  }

  confirmDialog() {
    this.waitForDialog();
    cy.get('#clubeExternoDialog').contains('button', 'Continuar').click();
    // Em headless Chrome o Bootstrap não dispara transitionend → forçamos o fechamento via jQuery
    cy.window().then((win) => {
      if (win.$ && win.$('#clubeExternoDialog').hasClass('show')) {
        win.$('#clubeExternoDialog').modal('hide');
        win.$('#clubeExternoDialog').removeClass('show').css('display', 'none');
        win.$('body').removeClass('modal-open');
        win.$('.modal-backdrop').remove();
      }
    });
    cy.get('[name="cnpjClube"]', { timeout: 10000 }).should('not.be.disabled');
  }

  cancelDialog() {
    this.waitForDialog();
    cy.get('#clubeExternoDialog').contains('button', 'Cancelar').click();
    // Cancelar → sair() → signOut() → redireciona para fora da página
  }

  // ── CNPJ lookup ──────────────────────────────────────────────────────────

  fillCNPJ(cnpj) {
    cy.get('[name="cnpjClube"]').clear({ force: true }).type(cnpj, { force: true });
  }

  searchCNPJ() {
    cy.get('button[title="Pesquisar CNPJ"]').click({ force: true });
  }

  clearCNPJ() {
    cy.get('button[title="Limpar campo CNPJ"]').click({ force: true });
  }

  // ── Dados do Clube ────────────────────────────────────────────────────────

  fillNomeCompleto(nome) {
    cy.get('[name="nomeCompletoClube"]').clear({ force: true }).type(nome, { force: true });
  }

  fillSigla(sigla) {
    cy.get('[name="siglaClube"]').clear({ force: true }).type(sigla, { force: true });
  }

  fillEmail(email) {
    cy.get('[name="emailClube"]').clear({ force: true }).type(email, { force: true });
  }

  fillDataFundacao(data) {
    cy.get('[name="dataFundacaoClube"]').clear({ force: true }).type(data, { force: true });
  }

  fillSite(site) {
    cy.get('[name="siteClube"]').clear({ force: true }).type(site, { force: true });
  }

  fillTelefone(telefone) {
    cy.get('[name="telefoneClube"]').clear({ force: true }).type(telefone, { force: true });
  }

  // ── Endereço ──────────────────────────────────────────────────────────────

  fillCEP(cep) {
    cy.get('[name="cepClube"]').clear({ force: true }).type(cep, { force: true }).trigger('keyup');
  }

  fillEndereco(endereco) {
    cy.get('[name="enderecoClube"]').clear({ force: true }).type(endereco, { force: true });
  }

  fillNumero(numero) {
    cy.get('[name="numeroClube"]').clear({ force: true }).type(numero, { force: true });
  }

  fillComplemento(complemento) {
    cy.get('[name="complementoClube"]').clear({ force: true }).type(complemento, { force: true });
  }

  fillBairro(bairro) {
    cy.get('[name="bairroClube"]').clear({ force: true }).type(bairro, { force: true });
  }

  selectEstado(sigla = null) {
    cy.selectNgOption('#estadoClube', sigla);
  }

  selectCidade(nome = null) {
    cy.selectNgOption('#cidadeClube', nome);
  }

  // ── Presidente ────────────────────────────────────────────────────────────

  fillCPFPresidente(cpf) {
    cy.get('[name="cpfPresidente"]').clear({ force: true }).type(cpf, { force: true });
  }

  searchCPFPresidente() {
    cy.get('button[title="Pesquisar CPF Presidente"]').click({ force: true });
  }

  fillNomePresidente(nome) {
    cy.get('[name="nomePresidente"]').clear({ force: true }).type(nome, { force: true });
  }

  selectGeneroPresidente(genero = null) {
    cy.selectNgOption('#generoPresidente', genero);
  }

  fillEmailPresidente(email) {
    cy.get('[name="emailPresidente"]').clear({ force: true }).type(email, { force: true });
  }

  fillDataNascimentoPresidente(data) {
    cy.get('[name="dataNascimentoPresidente"]').clear({ force: true }).type(data, { force: true });
  }

  fillTelefonePresidente(telefone) {
    cy.get('[name="telefonePresidente"]').clear({ force: true }).type(telefone, { force: true });
  }

  fillCelularPresidente(celular) {
    cy.get('[name="celularPresidente"]').clear({ force: true }).type(celular, { force: true });
  }

  fillDataEleicaoPresidente(data) {
    cy.get('[name="dataEleicaoPresidente"]').clear({ force: true }).type(data, { force: true });
  }

  fillDataInicioMandato(data) {
    cy.get('[name="dataInicioMandatoPresidente"]').clear({ force: true }).type(data, { force: true });
  }

  fillDataTerminoMandato(data) {
    cy.get('[name="dataTerminoMandatoPresidente"]').clear({ force: true }).type(data, { force: true });
  }

  // ── Diretor Técnico ───────────────────────────────────────────────────────

  fillCPFDiretor(cpf) {
    cy.get('[name="cpfDiretor"]').clear({ force: true }).type(cpf, { force: true });
  }

  searchCPFDiretor() {
    cy.get('button[title="Pesquisar CPF Diretor"]').click({ force: true });
  }

  fillNomeDiretor(nome) {
    cy.get('[name="nomeDiretor"]').clear({ force: true }).type(nome, { force: true });
  }

  selectGeneroDiretor(genero = null) {
    cy.selectNgOption('#generoDiretor', genero);
  }

  fillEmailDiretor(email) {
    cy.get('[name="emailDiretor"]').clear({ force: true }).type(email, { force: true });
  }

  fillDataNascimentoDiretor(data) {
    cy.get('[name="dataNascimentoDiretor"]').clear({ force: true }).type(data, { force: true });
  }

  fillTelefoneDiretor(telefone) {
    cy.get('[name="telefoneDiretor"]').clear({ force: true }).type(telefone, { force: true });
  }

  fillCelularDiretor(celular) {
    cy.get('[name="celularDiretor"]').clear({ force: true }).type(celular, { force: true });
  }

  // ── Bulk fill helpers ─────────────────────────────────────────────────────

  fillClubData(data) {
    this.fillNomeCompleto(data.nomeCompletoClube);
    this.fillSigla(data.siglaClube);
    this.fillEmail(data.emailClube);
    this.fillDataFundacao(data.dataFundacaoClube);
    if (data.siteClube) this.fillSite(data.siteClube);
    this.fillTelefone(data.telefoneClube);
  }

  fillAddress(data) {
    this.fillCEP(data.cepClube);
    this.fillEndereco(data.enderecoClube);
    this.fillNumero(data.numeroClube);
    if (data.complementoClube) this.fillComplemento(data.complementoClube);
    this.fillBairro(data.bairroClube);
    this.selectEstado();
    cy.get('#cidadeClube .ng-spinner-loader, #cidadeClube .ng-option-loading').should('not.exist');
    this.selectCidade();
  }

  fillPresidenteData(data) {
    this.fillCPFPresidente(data.cpfPresidente);
    this.fillNomePresidente(data.nomePresidente);
    this.selectGeneroPresidente();
    this.fillEmailPresidente(data.emailPresidente);
    this.fillDataNascimentoPresidente(data.dataNascimentoPresidente);
    this.fillTelefonePresidente(data.telefonePresidente);
    this.fillDataEleicaoPresidente(data.dataEleicaoPresidente);
    this.fillDataInicioMandato(data.dataInicioMandatoPresidente);
    this.fillDataTerminoMandato(data.dataTerminoMandatoPresidente);
  }

  fillDiretorData(data) {
    this.fillCPFDiretor(data.cpfDiretor);
    this.fillNomeDiretor(data.nomeDiretor);
    this.selectGeneroDiretor();
    this.fillEmailDiretor(data.emailDiretor);
    this.fillDataNascimentoDiretor(data.dataNascimentoDiretor);
    this.fillTelefoneDiretor(data.telefoneDiretor);
  }

  // ── Modalidades ───────────────────────────────────────────────────────────

  selectFirstModalidade() {
    cy.contains('Modalidades do Clube')
      .closest('section, div, fieldset')
      .find('input[type="checkbox"]')
      .first()
      .check({ force: true });
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  save() {
    cy.contains('button', 'Salvar').click({ force: true });
  }

  goBack() {
    cy.contains('button', 'Voltar').click({ force: true });
  }

  // ── Assertions ────────────────────────────────────────────────────────────

  assertOnRegistrationPage() {
    cy.url().should('include', '/public/clubes-externos');
  }

  assertSuccessMessage() {
    cy.get('.swal2-popup').should('be.visible');
    cy.get('.swal2-html-container').should('contain.text', 'Clube incluído com sucesso');
  }

  assertCNPJAlreadyRegistered() {
    cy.get('.swal2-popup').should('be.visible');
    cy.get('.swal2-html-container').should('contain.text', 'CNPJ já cadastrado');
  }

  assertCNPJNotFound() {
    cy.get('.swal2-popup').should('be.visible');
    cy.get('.swal2-html-container').should('contain.text', 'CNPJ não encontrado');
  }

  // Aciona blur no campo para marcar como "touched" no Angular antes de verificar is-invalid
  assertFieldIsInvalid(fieldName) {
    cy.get(`[name="${fieldName}"]`)
      .focus({ force: true })
      .blur({ force: true });
    cy.get(`[name="${fieldName}"]`).should('have.class', 'is-invalid');
  }

  assertNgSelectIsInvalid(fieldId) {
    cy.get(`[id="${fieldId}"]`).click({ force: true });
    cy.get('body').click(0, 0); // fecha o dropdown sem selecionar
    cy.get(`[id="${fieldId}"]`).should('have.class', 'is-invalid');
  }

  assertFormShowsValidationErrors() {
    cy.get('.invalid-feedback').should('be.visible');
  }

  assertFieldError(fieldName) {
    cy.get(`[name="${fieldName}"]`)
      .closest('.form-group')
      .find('.invalid-feedback')
      .should('be.visible');
  }
}
