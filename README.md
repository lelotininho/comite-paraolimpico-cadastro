# Comitê Paralímpico - Cadastro

Projeto de automação de testes para o fluxo de cadastro de atletas e representantes do Comitê Paralímpico.

## Autor

- Wesley

## Objetivo

- Organizar casos de teste em Gherkin.
- Implementar automação E2E com Cypress usando Page Object Model.
- Utilizar geração de dados dinâmicos para execução de cenários.
- Cobrir testes de API relevantes à funcionalidade.
- Fornecer gerador de métricas e coletor de evidências.
- Incluir validação de performance com `k6`.

## Estrutura do projeto

- `README.md` - visão geral do projeto.
- `features/` - casos de uso escritos em Gherkin.
- `cypress/` - testes end-to-end Cypress, fixtures e suporte.
- `k6/` - script de teste de performance.
- `evidence-collector/` - coletor de evidências do teste.
- `metrics/` - gerador de métricas e relatórios.
- `package.json` - dependências e scripts de execução.
- `BUGS_AND_IMPROVEMENTS.md` - bugs detectados e sugestões de melhoria.

## Instalação

```bash
cd /Users/wesley/Documents/comite-paraolimpico-cadastro
npm install
npx cypress install
```

> Observação: O `k6` precisa estar instalado no sistema para rodar `npm run perf`. Em macOS, use `brew install k6`.

## Instalação automática

Execute o script de bootstrap para instalar dependências e gerar o ambiente inicial:

```bash
bash setup.sh
```

O script faz o seguinte:

- valida `node` e `npm`
- instala dependências do projeto via `npm install`
- instala o binário do Cypress (`npx cypress install`)
- cria `.env` a partir de `.env.example` quando necessário
- em macOS, tenta instalar `gh` se `brew` estiver disponível

Se não houver Homebrew instalado, o script exibirá os comandos necessários para instalar `brew`, `gh` e `k6`.

## Configuração de ambiente

O Cypress usa `http://localhost:3000` por padrão. Se necessário, defina as variáveis abaixo:

```env
BASE_URL=http://localhost:3000
API_BASE_URL=http://localhost:3000/api/cadastro
```

## Execução

- `npm run test:positive` — executa os testes positivos em Cypress.
- `npm run test:negative` — executa os testes negativos em Cypress.
- `npm run test:api` — executa os testes de API do cadastro.
- `npm run test:all` — executa o conjunto completo de testes de UI e API.
- `npm run test:open` — abre a interface do Cypress para execução interativa.
- `npm run perf` — executa o teste de carga com `k6`.
- `npm run collect:evidence` — gera o relatório de evidências estático.
- `npm run generate:metrics` — gera o sumário de métricas.

## Cenários de Teste

- Cadastro de atleta válido com dados dinâmicos.
- Cadastro de representante válido com dados dinâmicos.
- Rejeição de cadastro sem CPF.
- Rejeição de cadastro com e-mail fora de formato.
- Teste de API para criação de cadastro.
- Teste de API para validação de payload inválido.

## Como usar

1. Atualize os dados do endpoint em `cypress/e2e/positive/registration_positive.cy.js` e `k6/registration.js`.
2. Ajuste os seletores do formulário de cadastro de acordo com a página.
3. Execute os scripts conforme a necessidade.

## Boas práticas

- Mantenha os cenários Gherkin claros e voltados ao negócio.
- Separe os dados válidos e inválidos para facilitar manutenção.
- Use o coletor de evidências para registrar resultados e falhas.
- Execute os testes de performance em ambiente isolado.

## Documentação de problemas

- Veja `SCENARIOS_ISSUES_AND_API_MAPPING.md` para detalhes dos cenários com problemas, causas, soluções e mapeamento de APIs.
