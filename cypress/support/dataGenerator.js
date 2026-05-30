import { faker } from '@faker-js/faker';

export function generateRegistrationData(overrides = {}) {
  const categories = ['atleta', 'representante'];
  const defaultData = {
    nome: faker.person.fullName(),
    cpf: faker.string.numeric(11),
    email: faker.internet.email({ firstName: faker.person.firstName(), lastName: faker.person.lastName() }).toLowerCase(),
    telefone: `+55${faker.phone.number('##9########')}`,
    categoria: faker.helpers.arrayElement(categories),
  };

  return { ...defaultData, ...overrides };
}
