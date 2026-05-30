# Cenários com problemas e mapeamento de APIs

## 1. Cenários problemáticos identificados

### 1.1. Cadastro com e-mail inválido (UI)
- Cenário: `Não deve cadastrar com e-mail inválido`
- Comportamento observado: o teste falhou porque o navegador não apresentou a mensagem de erro esperada no campo de e-mail.

#### Possíveis causas
- O formulário HTML estava usando `type="email"` sem `novalidate`, então o navegador interceptou a submissão e impediu o fluxo normal de validação.
- A página mock não estava tratando corretamente a resposta de erro do backend para o campo de `email`.

#### Solução aplicada
- Adicionamos `novalidate` ao elemento `<form>` em `server/public/index.html`.
- Isso permite que a validação seja controlada pelo JavaScript e pelo servidor mock, gerando a mensagem `Digite um e-mail válido` conforme esperado pelo teste.

### 1.2. Testes de API rodando contra URL placeholder
- Cenário: `API - Cadastro de atletas e representantes`
- Comportamento observado: os testes falharam inicialmente ao tentar conectar em `https://comite-paralimpico.exemplo/api/cadastro`.

#### Possíveis causas
- A constante de URL estava configurada para um domínio de exemplo que não existe no ambiente local.
- A variável de ambiente `API_BASE_URL` não estava definida durante a execução.

#### Solução aplicada
- Alteramos o `cypress/e2e/api/registration_api.cy.js` para usar `http://localhost:3000/api/cadastro` como padrão local.
- Mantivemos o uso de `Cypress.env('API_BASE_URL')` para permitir override quando necessário.

### 1.3. Aviso do Cypress: `spawn Unknown system error -86`
- Observação: o Cypress exibe repetidamente um warning no início da execução.

#### Possíveis causas
- Incompatibilidade entre o binário do Cypress/Electron e o ambiente local ou arquitetura de CPU.
- O Electron embarcado pode estar tentando iniciar um processo que não é suportado pela configuração atual do macOS.
- O comando `npx cypress run` ainda funciona, mas a mensagem indica que o ambiente possui alguma limitação de execução de binários.

#### Possíveis soluções
- Verificar se a versão do Cypress instalada é compatível com `arm64` no macOS.
- Reinstalar Cypress com `npx cypress install` após configurar o Node local corretamente.
- Se o problema persistir, forçar o uso do Chrome com `--browser chrome` ou executar em `cypress open`.

## 2. Status atual dos testes após correções

- `cypress/e2e/positive/registration_positive.cy.js`: passou com 2 testes.
- `cypress/e2e/negative/registration_negative.cy.js`: passou com 2 testes após ajuste de `novalidate`.
- `cypress/e2e/api/registration_api.cy.js`: passou com 2 testes após corrigir o endpoint para localhost.

## 3. Mapeamento das APIs envolvidas

### POST /api/cadastro
- Finalidade: criar um novo cadastro de atleta ou representante.
- Payload esperado:
  - `nome` (string)
  - `cpf` (string)
  - `email` (string)
  - `telefone` (string)
  - `categoria` (string) — `atleta` ou `representante`

- Respostas esperadas:
  - `201` com JSON de sucesso:
    - `id`
    - `nome`
    - `cpf`
    - `email`
    - `telefone`
    - `categoria`
    - `message`
  - `400` quando `cpf` estiver em branco
  - `422` quando `email` tiver formato inválido

### GET /ping
- Finalidade: endpoint de saúde simples.
- Resposta:
  - `200` com corpo `pong`

## 4. Recomendações para estabilizar a automação

- Definir claramente as variáveis de ambiente em `.env.example` e usar `BASE_URL`/`API_BASE_URL` em execução local.
- Manter o servidor mock funcionando em `http://localhost:3000` para testes Cypress locais.
- Revisar e instalar Cypress compatível com a arquitetura do macOS se o warning `spawn Unknown system error -86` continuar.
- Documentar no README os comandos:
  - `npm run serve`
  - `npm run test:positive`
  - `npm run test:negative`
  - `npm run test:api`

## 5. Observações de bugs e melhorias

- O mock HTML atual valida apenas `CPF` e `email`; recomenda-se ampliar a validação para formato de CPF e presença de demais campos.
- O fluxo de resposta da página pode ser melhorado para exibir claramente o número do protocolo ou o tipo de cadastro retornado.
- Para testes de API, adicionar cobertura de casos `GET`/`PUT`/`DELETE` quando esses endpoints estiverem disponíveis.
