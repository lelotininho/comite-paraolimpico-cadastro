// Comandos personalizados para o projeto de cadastro do Comitê Paralímpico.

Cypress.Commands.add('fillRegistrationForm', (data) => {
  cy.get('#nome').type(data.nome);
  cy.get('#cpf').type(data.cpf);
  cy.get('#email').type(data.email);
  cy.get('#telefone').type(data.telefone);
  cy.get('#categoria').select(data.categoria);
});
