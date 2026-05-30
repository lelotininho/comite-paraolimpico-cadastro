import { RegistrationPage } from '../../pages/registrationPage.js';
import { generateRegistrationData } from '../../support/dataGenerator.js';

const registrationPage = new RegistrationPage();

describe('Cadastro - Cenários Positivos', () => {
  beforeEach(() => {
    registrationPage.visit();
  });

  it('Deve cadastrar atleta com dados válidos', () => {
    const data = generateRegistrationData({ categoria: 'atleta' });
    registrationPage.fillRegistration(data);
    registrationPage.submit();
    registrationPage.assertSuccessMessage();
  });

  it('Deve cadastrar representante com tipo correto', () => {
    const data = generateRegistrationData({ categoria: 'representante' });
    registrationPage.fillRegistration(data);
    registrationPage.submit();
    registrationPage.assertSuccessMessage();
    registrationPage.assertUserCategory('Representante');
  });
});
