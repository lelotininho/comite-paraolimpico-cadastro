import { RegistrationPage } from '../../pages/registrationPage.js';
import { generateRegistrationData } from '../../support/dataGenerator.js';

const registrationPage = new RegistrationPage();

describe('Cadastro - Cenários Negativos', () => {
  beforeEach(() => {
    registrationPage.visit();
  });

  it('Não deve cadastrar sem CPF', () => {
    const data = generateRegistrationData({ cpf: '' });
    registrationPage.fillRegistration(data);
    registrationPage.submit();
    registrationPage.assertFieldError('cpf', 'CPF é obrigatório');
  });

  it('Não deve cadastrar com e-mail inválido', () => {
    const data = generateRegistrationData({ email: 'usuario-invalido' });
    registrationPage.fillRegistration(data);
    registrationPage.submit();
    registrationPage.assertFieldError('email', 'Digite um e-mail válido');
  });
});
