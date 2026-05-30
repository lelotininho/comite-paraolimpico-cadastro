export class RegistrationPage {
  visit() {
    cy.visit('/');
  }

  fillField(selector, value) {
    if (value !== undefined) {
      cy.get(selector).clear();
      if (value !== '') {
        cy.get(selector).type(value);
      }
    }
  }

  fillRegistration(data) {
    this.fillField('#nome', data.nome);
    this.fillField('#cpf', data.cpf);
    this.fillField('#email', data.email);
    this.fillField('#telefone', data.telefone);
    if (data.categoria) {
      cy.get('#categoria').select(data.categoria);
    }
  }

  submit() {
    cy.get('#btn-enviar').click();
  }

  assertSuccessMessage() {
    cy.get('.toast-success').should('contain.text', 'Cadastro realizado com sucesso');
  }

  assertFieldError(fieldName, expectedMessage) {
    cy.get(`.field-error[for="${fieldName}"]`).should('contain.text', expectedMessage);
  }

  assertUserCategory(category) {
    cy.get('.user-category').should('contain.text', category);
  }
}
