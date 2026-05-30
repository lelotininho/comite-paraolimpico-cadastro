import { faker } from '@faker-js/faker';

// ── CPF generator (valid checksum) ────────────────────────────────────────

function generateCPF() {
  const digits = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));

  const d1 = (() => {
    const sum = digits.reduce((acc, d, i) => acc + d * (10 - i), 0);
    const rem = sum % 11;
    return rem < 2 ? 0 : 11 - rem;
  })();
  digits.push(d1);

  const d2 = (() => {
    const sum = digits.reduce((acc, d, i) => acc + d * (11 - i), 0);
    const rem = sum % 11;
    return rem < 2 ? 0 : 11 - rem;
  })();
  digits.push(d2);

  const raw = digits.join('');
  return raw.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
}

// ── CNPJ generator (valid checksum) ──────────────────────────────────────

function generateCNPJ() {
  // First digit must be non-zero to avoid sequences like 00.000.000/0000-00
  const digits = [
    Math.floor(Math.random() * 8) + 1,
    ...Array.from({ length: 11 }, () => Math.floor(Math.random() * 10)),
  ];

  const calcDigit = (arr, weights) => {
    const sum = arr.reduce((acc, d, i) => acc + d * weights[i], 0);
    const rem = sum % 11;
    return rem < 2 ? 0 : 11 - rem;
  };

  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const d1 = calcDigit(digits, w1);
  digits.push(d1);

  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const d2 = calcDigit(digits, w2);
  digits.push(d2);

  const raw = digits.join('');
  return raw.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

// ── Invalid CPF / CNPJ examples ───────────────────────────────────────────

export const INVALID_CPF = '111.111.111-11';
// CNPJ com checksum propositalmente errado (dígitos verificadores incorretos)
// Dígitos puros com checksum incorreto — a máscara Angular aplica depois
export const INVALID_CNPJ = '12345678000199';

// ── Date helpers ──────────────────────────────────────────────────────────

function brDate(date) {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

function pastDate(yearsAgo) {
  const d = new Date();
  d.setFullYear(d.getFullYear() - yearsAgo);
  return brDate(d);
}

function futureDate(yearsAhead) {
  const d = new Date();
  d.setFullYear(d.getFullYear() + yearsAhead);
  return brDate(d);
}

// ── Main data factory ────────────────────────────────────────────────────

export function generateClubData(overrides = {}) {
  const defaults = {
    // CNPJ
    cnpjClube: generateCNPJ(),

    // Dados do clube
    nomeCompletoClube: `CLUBE ESPORTIVO ${faker.word.noun().toUpperCase()} PARALIMPICO`,
    siglaClube: faker.string.alpha({ length: { min: 3, max: 8 }, casing: 'upper' }),
    emailClube: faker.internet.email().toLowerCase(),
    dataFundacaoClube: pastDate(faker.number.int({ min: 5, max: 30 })),
    siteClube: '',
    telefoneClube: `(${faker.number.int({ min: 11, max: 99 })}) ${faker.number.int({ min: 3000, max: 9999 })}-${faker.number.int({ min: 1000, max: 9999 })}`,

    // Endereço
    cepClube: `${faker.number.int({ min: 10000, max: 99999 })}-${faker.number.int({ min: 100, max: 999 })}`,
    enderecoClube: `RUA ${faker.location.streetAddress().toUpperCase()}`,
    numeroClube: String(faker.number.int({ min: 1, max: 9999 })),
    complementoClube: '',
    bairroClube: faker.location.county().toUpperCase(),

    // Presidente
    cpfPresidente: generateCPF(),
    nomePresidente: faker.person.fullName().toUpperCase(),
    emailPresidente: faker.internet.email().toLowerCase(),
    dataNascimentoPresidente: pastDate(faker.number.int({ min: 30, max: 60 })),
    telefonePresidente: `(${faker.number.int({ min: 11, max: 99 })}) 9${faker.number.int({ min: 1000, max: 9999 })}-${faker.number.int({ min: 1000, max: 9999 })}`,
    celularPresidente: '',
    dataEleicaoPresidente: pastDate(2),
    dataInicioMandatoPresidente: pastDate(2),
    dataTerminoMandatoPresidente: futureDate(2),

    // Diretor
    cpfDiretor: generateCPF(),
    nomeDiretor: faker.person.fullName().toUpperCase(),
    emailDiretor: faker.internet.email().toLowerCase(),
    dataNascimentoDiretor: pastDate(faker.number.int({ min: 30, max: 60 })),
    telefoneDiretor: `(${faker.number.int({ min: 11, max: 99 })}) ${faker.number.int({ min: 3000, max: 9999 })}-${faker.number.int({ min: 1000, max: 9999 })}`,
    celularDiretor: '',
  };

  return { ...defaults, ...overrides };
}

export { generateCPF, generateCNPJ };
