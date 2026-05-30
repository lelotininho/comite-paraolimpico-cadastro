# Comitê Paralímpico Brasileiro — Automação QA: Registrar Clube

Projeto de automação de testes para a funcionalidade **Registrar Clube** do Sistema de Cadastro do CPB.

## Autor

Wesley Leal

## Objetivo

- Levantar e documentar cenários de teste relevantes para a funcionalidade.
- Implementar automação E2E com Cypress (Page Object Model + dados dinâmicos).
- Cobrir validações de API diretamente no ambiente de homologação.
- Identificar e documentar bugs e oportunidades de melhoria.
- Fornecer indicadores de performance com k6.

## Ambiente

| Recurso       | URL                                                                        |
|---------------|----------------------------------------------------------------------------|
| Frontend      | `https://homologcadastroweb.cpb.org.br/cadastro-geral-web/`               |
| Rota pública  | `.../public/clubes-externos`                                               |
| API REST      | `https://homologcadastroweb.cpb.org.br/api/cadastro-geral-web/v1`         |
| Keycloak      | `https://homologlogin.cpb.org.br`                                          |

## Estrutura do projeto

```
features/          → Cenários em Gherkin (comportamento esperado)
cypress/
  e2e/
    flow/          → Testes de fluxo de navegação e popup (CT-F)
    positive/      → Cenários de caminho feliz (CT-P)
    negative/      → Validações e rejeições (CT-N)
    api/           → Testes diretos de API (CT-A)
  pages/           → Page Objects (loginPage, clubRegistrationPage)
  support/         → Comandos customizados e geração de dados
k6/                → Testes de performance
evidence-collector/ → Coleta de screenshots após execução
metrics/           → Geração de sumário de resultados
BUGS_AND_IMPROVEMENTS.md         → Bugs e melhorias identificados
SCENARIOS_ISSUES_AND_API_MAPPING.md → Problemas, causas e mapeamento de APIs
```

## Instalação

```bash
npm install
npx cypress install
```

> Para testes de performance: `brew install k6` (macOS)

## Instalação automática

```bash
bash setup.sh
```

## Execução dos testes

```bash
npm run test:flow       # Testes de fluxo (popup, navegação)
npm run test:positive   # Cenários de caminho feliz
npm run test:negative   # Cenários de validação/rejeição
npm run test:api        # Testes diretos de API
npm run test            # Todos os testes Cypress
npm run test:open       # Interface gráfica do Cypress
npm run perf            # Teste de carga com k6
```

## Pós-execução

```bash
npm run collect:evidence   # Gera evidence-collector/output/evidence-summary.json
npm run generate:metrics   # Gera metrics/metrics-summary.json
```

## Cenários cobertos

| Categoria   | Qtde | Faixa         |
|-------------|------|---------------|
| Fluxo       | 7    | CT-F01–CT-F07 |
| Positivos   | 5    | CT-P01–CT-P05 |
| Negativos   | 19   | CT-N01–CT-N19 |
| API         | 8    | CT-A01–CT-A08 |
| Performance | 2    | CT-PERF-01/02 |

## Documentação de problemas

- `BUGS_AND_IMPROVEMENTS.md` — bugs identificados durante exploração.
- `SCENARIOS_ISSUES_AND_API_MAPPING.md` — causas, soluções e mapeamento completo de APIs.
