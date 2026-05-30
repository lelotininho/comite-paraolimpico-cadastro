# Cenários de Teste, Problemas, Causas e Soluções

## Sumário executivo

| Categoria        | Total | Passando | Falhando | Bloqueado |
|------------------|-------|----------|----------|-----------|
| Fluxo (CT-F)     | 7     | 7        | 0        | 0         |
| Positivos (CT-P) | 5     | 4        | 1        | 0         |
| Negativos (CT-N) | 19    | 19       | 0        | 0         |
| API (CT-A)       | 8     | 7        | 1 (BUG)  | 0         |
| Performance (k6) | 2     | -        | -        | pendente  |

> **Nota sobre execução:** Testes de UI executados via Cypress GUI (contorna incompatibilidade do binário Electron com macOS 26 beta). CT-P04 em investigação — ver ISSUE-06 a ISSUE-10. Ver ISSUE-01 para detalhes do problema de ambiente.

---

## 1. Catálogo completo de cenários

### 1.1. Testes de Fluxo (CT-F) — Navegação e comportamento do popup

---

**CT-F01 | Popup de aviso exibida ao acessar o formulário**
- **O que testa:** A dialog `#clubeExternoDialog` aparece automaticamente ao navegar para `/public/clubes-externos`.
- **Passos:** Visitar `/public/clubes-externos` → verificar se o modal tem a classe `show`.
- **Resultado esperado:** Modal visível com título "Informações para Cadastro de Clube".
- **Arquivo:** `cypress/e2e/flow/club_registration_flow.cy.js`

---

**CT-F02 | Clicar em "Cancelar" encerra o fluxo sem abrir o formulário**
- **O que testa:** O botão "Cancelar" fecha o dialog sem habilitar o formulário.
- **Passos:** Visitar a rota → modal abre → clicar "Cancelar" → verificar que modal fechou.
- **Resultado esperado:** Modal sem classe `show`; campo CNPJ permanece desabilitado.
- **Arquivo:** `cypress/e2e/flow/club_registration_flow.cy.js`

---

**CT-F03 | Clicar em "Continuar" habilita o formulário de cadastro**
- **O que testa:** O botão "Continuar" fecha o dialog e habilita o campo de CNPJ.
- **Passos:** Visitar a rota → confirmar dialog → verificar campo CNPJ habilitado.
- **Resultado esperado:** `[name="cnpjClube"]` visível e não desabilitado.
- **Arquivo:** `cypress/e2e/flow/club_registration_flow.cy.js`

---

**CT-F04 | Popup exibe instruções sobre documentação necessária**
- **O que testa:** O corpo da dialog contém informação sobre necessidade de anexar documentos (estatuto, atas, CNPJ).
- **Resultado esperado:** Texto "estatuto" presente no modal body.
- **Arquivo:** `cypress/e2e/flow/club_registration_flow.cy.js`

---

**CT-F05 | Fluxo completo via botão "Registrar Clube" na tela de login**
- **O que testa:** O caminho real do usuário: login → clicar em "Registrar Clube" → modal → formulário.
- **Passos:** Visitar `/` → redirect para Keycloak → `cy.origin()` → clicar "Registrar Clube" → verificar URL e modal.
- **Resultado esperado:** URL com `/public/clubes-externos`; modal visível.
- **Dependência técnica:** Requer `chromeWebSecurity: false` e `cy.origin()` para cruzar domínio Keycloak.
- **Arquivo:** `cypress/e2e/flow/club_registration_flow.cy.js`

---

**CT-F06 | Botão "Voltar" retorna à tela anterior**
- **O que testa:** A navegação reversa do formulário.
- **Resultado esperado:** URL diferente de `/public/clubes-externos`.
- **Arquivo:** `cypress/e2e/flow/club_registration_flow.cy.js`

---

**CT-F07 | Campos do formulário iniciam vazios antes do preenchimento do CNPJ**
- **O que testa:** Estado inicial do formulário após confirmar o popup.
- **Resultado esperado:** `nomeCompletoClube`, `emailClube`, `telefoneClube` com valor vazio.
- **Arquivo:** `cypress/e2e/flow/club_registration_flow.cy.js`

---

### 1.2. Testes Positivos (CT-P) — Caminhos de sucesso

---

**CT-P01 | Acesso via botão "Registrar Clube" na tela de login**
- **O que testa:** Confirmação de que o botão de entrada existe e leva ao formulário.
- **Resultado esperado:** Página carregada em `/public/clubes-externos` com modal visível.
- **Arquivo:** `cypress/e2e/positive/registration_positive.cy.js`

---

**CT-P02 | Formulário exibido após confirmar aviso da popup**
- **O que testa:** Confirma que o fluxo básico de abertura do formulário funciona.
- **Resultado esperado:** Campo `[name="cnpjClube"]` visível.
- **Arquivo:** `cypress/e2e/positive/registration_positive.cy.js`

---

**CT-P03 | Busca de CNPJ não cadastrado habilita preenchimento manual**
- **O que testa:** Quando o CNPJ não está na base (API retorna 404), o sistema informa o usuário e habilita o formulário.
- **Mecanismo:** Intercepta `GET /public/clubes/cnpj/**` e retorna `{ statusCode: 404 }`.
- **Resultado esperado:** SweetAlert2 com "CNPJ não encontrado"; campos habilitados para preenchimento.
- **Arquivo:** `cypress/e2e/positive/registration_positive.cy.js`

---

**CT-P04 | Cadastro completo com stub da submissão**
- **O que testa:** Preenchimento de todos os campos obrigatórios e envio bem-sucedido.
- **Mecanismo:** Intercepta `GET /cnpj/**` (404) e `POST /public/clubes` (201) para não criar registros reais.
- **Resultado esperado:** Mensagem "Clube incluído com sucesso!".
- **Por que usar stub?** Evita poluição do banco de homologação a cada execução.
- **Arquivo:** `cypress/e2e/positive/registration_positive.cy.js`

---

**CT-P05 | Endpoint de modalidades retorna lista**
- **O que testa:** Via `cy.request()`, valida que a API pública de modalidades está respondendo.
- **Resultado esperado:** `200` com array não-vazio; cada item contém `nome`.
- **Resultado real (confirmado via curl):** 200 · 23 modalidades (atletismo, basquete, bocha…).
- **Arquivo:** `cypress/e2e/positive/registration_positive.cy.js`

---

### 1.3. Testes Negativos (CT-N) — Validações e rejeições

---

**CT-N01 | CNPJ com formato inválido**
- **Campo:** `cnpjClube`
- **Entrada:** `INVALID_CNPJ = "00.000.000/0000-00"`
- **Resultado esperado:** Campo com classe `is-invalid`.
- **Observação:** Validação é feita pelo Angular (`Validators.validateCnpj`) no frontend.

**CT-N02 | CNPJ já cadastrado exibe alerta**
- **Campo:** `cnpjClube`
- **Mecanismo:** Intercepta GET CNPJ e retorna `{ statusCode: 200, body: { data: { status: 'APROVADO' } } }`.
- **Resultado esperado:** SweetAlert2 com "CNPJ já cadastrado. Para atualizar…".

**CT-N03 | Sem nome completo do clube**
- **Campo:** `nomeCompletoClube` (obrigatório)
- **Resultado esperado:** Campo com `is-invalid` após tentativa de salvar.

**CT-N04 | E-mail do clube com formato inválido**
- **Campo:** `emailClube`
- **Entrada:** `"email-invalido"` (sem @)
- **Resultado esperado:** Campo com `is-invalid`.

**CT-N05 | Sem e-mail do clube**
- **Campo:** `emailClube` (obrigatório + email)
- **Resultado esperado:** Campo com `is-invalid`.

**CT-N06 | Sigla excede 15 caracteres**
- **Campo:** `siglaClube` — maxLength(15)
- **Entrada:** String com 30 caracteres
- **Resultado esperado:** Input aceita no máximo 15 caracteres (maxlength HTML).

**CT-N07 | Sem telefone do clube**
- **Campo:** `telefoneClube` (obrigatório)
- **Resultado esperado:** Campo com `is-invalid`.

**CT-N08 | Sem CEP**
- **Campo:** `cepClube` (obrigatório)
- **Resultado esperado:** Campo com `is-invalid`.

**CT-N09 | Sem bairro**
- **Campo:** `bairroClube` (obrigatório, maxLength 60)
- **Resultado esperado:** Campo com `is-invalid`.

**CT-N10 | CPF inválido para o presidente**
- **Campo:** `cpfPresidente`
- **Entrada:** `INVALID_CPF = "111.111.111-11"`
- **Resultado esperado:** Campo com `is-invalid` (validação por algoritmo de dígitos verificadores).

**CT-N11 | Sem nome do presidente**
- **Campo:** `nomePresidente` (obrigatório, maxLength 91, nameValidator)
- **Resultado esperado:** Campo com `is-invalid`.

**CT-N12 | Sem gênero do presidente**
- **Campo:** `generoPresidente` (ng-select, obrigatório)
- **Resultado esperado:** `ng-select#generoPresidente` com classe `is-invalid`.

**CT-N13 | Sem data de eleição do presidente**
- **Campo:** `dataEleicaoPresidente` (obrigatório, validateDate)
- **Resultado esperado:** Campo com `is-invalid`.

**CT-N14 | Sem data de início de mandato**
- **Campo:** `dataInicioMandatoPresidente` (obrigatório, validateDate)
- **Resultado esperado:** Campo com `is-invalid`.

**CT-N15 | Sem data de término de mandato**
- **Campo:** `dataTerminoMandatoPresidente` (obrigatório, validateDate)
- **Resultado esperado:** Campo com `is-invalid`.

**CT-N16 | CPF inválido para o diretor**
- **Campo:** `cpfDiretor`
- **Entrada:** `"111.111.111-11"`
- **Resultado esperado:** Campo com `is-invalid`.

**CT-N17 | Sem nome do diretor técnico**
- **Campo:** `nomeDiretor` (obrigatório, maxLength 91)
- **Resultado esperado:** Campo com `is-invalid`.

**CT-N18 | Sem gênero do diretor técnico**
- **Campo:** `generoDiretor` (ng-select, obrigatório)
- **Resultado esperado:** `ng-select#generoDiretor` com classe `is-invalid`.

**CT-N19 | Formulário vazio exibe múltiplos erros**
- **O que testa:** Que clicar em "Salvar" sem preencher nada dispara todas as validações simultaneamente.
- **Resultado esperado:** Ao menos 4 elementos `.invalid-feedback` visíveis.

---

### 1.4. Testes de API (CT-A) — Validação direta dos endpoints

> **API Base URL:** `https://homologcadastroweb.cpb.org.br/api/cadastro-api/v1`

---

**CT-A01 | GET /public/clubes/modalidades → 200**
- **Resultado real:** `200` · 23 modalidades (ATLETISMO, BASQUETE EM CADEIRA DE RODAS, BOCHA…)
- **Status:** ✅ Passou

**CT-A02 | GET /public/clubes/cnpj/{cnpj inexistente} → 404**
- **Mecanismo:** Gera CNPJ válido aleatório (muito improvável de estar cadastrado).
- **Resultado real:** `404`
- **Status:** ✅ Passou

**CT-A03 | GET /public/clubes/cnpj/00000000000000 → 4xx esperado**
- **Resultado real:** `200` com `{ nomeCompletoClube: "SEM CLUBE", cnpjClube: "00.000.000/0000-00" }`
- **Status:** ❌ **BUG** — ver BUG-01

**CT-A04 | POST /public/clubes sem body → 400**
- **Content-Type:** `multipart/form-data` (obrigatório — API recusa JSON)
- **Resultado real:** `400`
- **Status:** ✅ Passou

**CT-A05 | POST /public/clubes com CNPJ inválido → 400**
- **Resultado real:** `400`
- **Status:** ✅ Passou

**CT-A06 | POST /public/clubes com CPF presidente inválido → 400**
- **Resultado real:** `400`
- **Status:** ✅ Passou

**CT-A07 | POST /public/clubes sem e-mail → 400**
- **Resultado real:** `400`
- **Status:** ✅ Passou

**CT-A08 | POST /public/clubes com e-mail inválido → 400**
- **Resultado real:** `400`
- **Status:** ✅ Passou

---

### 1.5. Testes de Performance (CT-PERF) — k6

**CT-PERF-01 | Lookup de CNPJ sob carga**
- **Endpoint:** `GET /public/clubes/cnpj/{cnpj}`
- **Configuração:** 20 usuários virtuais por 30s
- **Threshold:** p(95) < 1500ms, taxa de erro < 5%

**CT-PERF-02 | Tentativa de criação de clube sob carga**
- **Endpoint:** `POST /public/clubes` com payload incompleto (propositalmente, para não poluir banco)
- **Threshold:** p(95) < 3000ms, taxa de erro esperada > 0 (400 por payload inválido)
- **Execução:** `npm run perf` (requer k6 instalado: `brew install k6`)

---

## 2. Mapeamento completo das APIs

**Base URL:** `https://homologcadastroweb.cpb.org.br/api/cadastro-api/v1`
**Construção:** `https://{host}:{port}{baseURL}{version}` onde:
- `host` = `homologcadastroweb.cpb.org.br`
- `port` = `443`
- `baseURL` = `/api/cadastro-api`
- `version` = `/v1`

> **Atenção:** A URL `/api/cadastro-geral-web` é a `baseJsfURL` (frontend Angular), não a REST API. Usar sempre `/api/cadastro-api/v1` para os testes.

---

### GET `/public/clubes/modalidades`
| Item | Detalhe |
|---|---|
| Autenticação | Não requerida |
| Resposta 200 | `{ data: [ { id, nome }, ... ] }` · 23 modalidades |
| Uso na UI | Popula o componente de seleção de modalidades esportivas |

---

### GET `/public/clubes/cnpj/{cnpj}`
| Item | Detalhe |
|---|---|
| Autenticação | Não requerida |
| Parâmetro | CNPJ somente dígitos (14 caracteres) |
| Resposta 200 | `{ data: { clube: { id, nomeCompletoClube, status, ... } } }` |
| Resposta 404 | CNPJ não encontrado → usuário preenche formulário manualmente |
| Comportamento UI 200 + status APROVADO | Exibe "CNPJ já cadastrado. Para atualizar, contate o CPB." |
| Comportamento UI 200 + status outro | Preenche formulário com dados existentes para atualização |
| **BUG** | CNPJ `00000000000000` retorna 200 com "SEM CLUBE" |

---

### GET `/public/clubes/gestor/{cpf}`
| Item | Detalhe |
|---|---|
| Autenticação | Não requerida |
| Parâmetro | CPF somente dígitos (11 caracteres) |
| Resposta 200 | Dados pessoais do gestor para preenchimento automático |
| Resposta 404 | CPF não encontrado → usuário preenche manualmente |

---

### POST `/public/clubes`
| Item | Detalhe |
|---|---|
| Autenticação | Não requerida |
| Content-Type | **`multipart/form-data`** (obrigatório — JSON retorna 400 com erro Jackson) |
| Resposta 201 | Clube criado; mensagem: "Clube incluído com sucesso! O CPB fará uma análise…" |
| Resposta 400 | Campos obrigatórios ausentes ou dados inválidos |
| Fluxo pós-criação | CPB analisa o cadastro; após aprovação, login/senha enviados por e-mail |

**Campos obrigatórios no POST:**
```
cnpjClube            siglaClube           nomeCompletoClube
emailClube           dataFundacaoClube    telefoneClube
cepClube             enderecoClube        numeroClube
bairroClube          estadoClube          cidadeClube
nomePresidente       cpfPresidente        generoPresidente
dataEleicaoPresidente
dataInicioMandatoPresidente
dataTerminoMandatoPresidente
nomeDiretor          cpfDiretor           generoDiretor
```

**Anexos aceitos (multipart, opcionais no front mas recomendados pelo CPB):**
```
arquivoEstatuto      arquivoAtaFundacao
arquivoAtaEleicao    arquivoCNPJ
```

---

### PUT `/public/clubes`
| Item | Detalhe |
|---|---|
| Autenticação | Não requerida |
| Uso | Atualiza clube existente cujo CNPJ retornou status diferente de APROVADO |
| Resposta 200 | `"Dados alterados com sucesso!"` |

---

## 3. Problemas na automação — causas e soluções

### ISSUE-01 | Cypress não inicia no macOS 26 beta (Darwin 25.5.0)

**Sintoma:**
```
/Cypress.app/Contents/MacOS/Cypress: bad option: --no-sandbox
/Cypress.app/Contents/MacOS/Cypress: bad option: --smoke-test
```

**Causa:**
O Cypress executa um smoke test ao iniciar, passando o flag `--no-sandbox` para o binário Electron. O Electron incluído no Cypress 14.5.4 não aceita esse flag no macOS 26 beta (Darwin kernel 25.x). É uma incompatibilidade entre a versão do Electron (empacotada no Cypress) e a nova versão do macOS, que ainda não tem suporte oficial.

**Soluções possíveis:**
1. **Aguardar atualização** — Cypress lançar versão com Electron compatível com macOS 26.
2. **Usar macOS estável** (macOS 15 Sequoia ou anterior) para executar os testes.
3. **Instalar Cypress 13.x** — versão anterior usa Electron mais antigo:
   ```bash
   npm install --save-dev cypress@13
   npx cypress install
   ```
4. **Contornar o smoke test** (workaround não oficial):
   ```bash
   echo '{"verified": true}' > ~/Library/Caches/Cypress/14.5.4/binary_state.json
   ```
   Após isso, o problema muda para incompatibilidade de path do Electron — não resolve completamente.

**Status atual:** Testes de API validados via `curl`; testes de UI aguardam ambiente compatível.

---

### ISSUE-02 | URL da API configurada incorretamente no início do projeto

**Sintoma:** Chamadas à API retornavam 404 em todas as rotas.

**Causa:**
A URL `/api/cadastro-geral-web` é a `baseJsfURL` (base do frontend Angular), não a base da REST API. A URL correta, conforme o objeto de ambiente do Angular (`environment.ts`), é:
- **Incorreto:** `https://homologcadastroweb.cpb.org.br/api/cadastro-geral-web/v1`
- **Correto:** `https://homologcadastroweb.cpb.org.br/api/cadastro-api/v1`

**Solução aplicada:** `API_BASE_URL` corrigido no `cypress.config.js` e `.env.example`.

---

### ISSUE-03 | Testes de API enviavam JSON em vez de multipart/form-data

**Sintoma:** POST ao endpoint `/public/clubes` com `Content-Type: application/json` retornava:
```
400 · com.fasterxml.jackson.databind.exc.InvalidDefinitionException:
Cannot construct instance of MultipartFormDataInput
```

**Causa:**
O backend usa JAX-RS/RESTEasy com `@MultipartForm`. Ele só aceita `multipart/form-data`. Enviar JSON resulta em erro de desserialização Jackson, não em erro de validação de negócio.

**Solução aplicada:** Testes de API atualizados para usar `multipart/form-data; boundary=boundary` com corpo serializado manualmente no helper `formDataBody()`.

---

### ISSUE-04 | cy.origin() necessário para interação com o Keycloak

**Sintoma:** Cypress não consegue interagir com elementos em `homologlogin.cpb.org.br` ao navegar de `homologcadastroweb.cpb.org.br`.

**Causa:**
O botão "Registrar Clube" fica na página de login do Keycloak, que está em um domínio diferente do da aplicação. Cypress 12+ bloqueia operações cross-origin por padrão.

**Solução aplicada:**
- `chromeWebSecurity: false` em `cypress.config.js`
- Uso de `cy.origin('https://homologlogin.cpb.org.br', () => { ... })` no `loginPage.js`

---

### ISSUE-05 | ng-select não é um input HTML padrão

**Sintoma:** `cy.get('#estadoClube').select('SP')` falha — `ng-select` não é um `<select>` nativo.

**Causa:**
O componente `ng-select` renderiza um dropdown customizado com `div`, `input` e `ul.ng-dropdown-panel`. O Cypress não consegue usar `.select()` nele.

**Solução aplicada:**
Custom command `cy.selectNgOption(selector, text)` em `cypress/support/commands.js` — ver ISSUE-06 para detalhes da implementação final.

---

### ISSUE-06 | selectNgOption — ng-select dentro de wrapper div e verificação de disabled incorreta

**Sintoma:** `.click({ force: true })` no `.ng-select-container` não abria o dropdown. Timeout em `.ng-dropdown-panel`.

**Causa (raiz):**
Os IDs do formulário (`#estadoClube`, `#cidadeClube`, `#generoPresidente`, `#generoDiretor`) estão em `<div>` wrapper, **não** no `<ng-select>` diretamente. A verificação `cy.get('#estadoClube').should('not.have.class', 'ng-select-disabled')` checava o wrapper (que nunca tem essa classe), enquanto o `ng-select` interno permanecia desabilitado. O `handleMousedown` do ng-select retorna imediatamente se `this.isDisabled === true`, então todos os clicks falhavam silenciosamente.

**Estrutura real no DOM:**
```html
<div id="estadoClube">           ← wrapper, nunca tem ng-select-disabled
  <ng-select class="ng-select ng-select-disabled">   ← aqui fica a classe
    <div class="ng-select-container"> ... </div>
  </ng-select>
</div>
```

**Solução aplicada:**
```javascript
Cypress.Commands.add('selectNgOption', (selector, text = null) => {
  cy.get(selector).scrollIntoView();
  cy.get(`${selector} .ng-select`).should('not.have.class', 'ng-select-disabled');
  cy.get(`${selector} .ng-select-container`).click({ force: true });
  cy.get('.ng-dropdown-panel', { timeout: 15000 }).should('be.visible');
  if (text) {
    cy.get(`${selector} .ng-input input`).type(text, { force: true });
    cy.get('.ng-dropdown-panel .ng-option').contains(text).click({ force: true });
  } else {
    cy.get('.ng-dropdown-panel .ng-option').not('.ng-option-disabled').first().click({ force: true });
  }
});
```

**Lição:** Sempre verificar no elemento do componente, não no wrapper pai.

---

### ISSUE-07 | CT-P04 — Race condition: CEP lookup desabilita ng-select de estado

**Sintoma:** `#estadoClube .ng-select` permanecia `ng-select-disabled` após `fillCEP`.

**Causa:**
`fillCEP` dispara `.trigger('keyup')`, que inicia uma chamada real à API de CEP com um CEP aleatório gerado pelo faker. Enquanto a resposta não chega, o Angular desabilita os campos de endereço dependentes (estado, cidade). Sem stub, o timing é imprevisível.

**Solução aplicada em CT-P04:**
```javascript
cy.intercept('GET', '**/cep/**', { statusCode: 404, body: {} }).as('cepApi');
cy.intercept('GET', 'https://viacep.com.br/**', { body: { erro: 'true' } }).as('viacep');
```

---

### ISSUE-08 | CT-P04 — Campos do presidente/diretor bloqueados sem pesquisa de CPF

**Sintoma:** `#generoPresidente .ng-select` permanecia `ng-select-disabled` mesmo com CPF e Nome já preenchidos.

**Causa:**
O Angular mantém os campos de gênero, e-mail e datas do presidente/diretor desabilitados até que o botão "Pesquisar CPF" seja clicado. `fillPresidenteData` preenchia CPF via texto (`force: true`) mas nunca chamava `searchCPFPresidente()`, então os campos nunca eram habilitados.

**Solução aplicada em CT-P04:**
Substituição de `page.fillPresidenteData(data)` por chamadas individuais com pesquisa explícita de CPF:
```javascript
page.fillCPFPresidente(data.cpfPresidente);
page.searchCPFPresidente();
cy.wait('@cpfLookup');
cy.dismissSwal();
// ...demais campos do presidente
```
Stub necessário:
```javascript
cy.intercept('GET', '**/public/clubes/gestor/**', { statusCode: 404, body: {} }).as('cpfLookup');
```

---

### ISSUE-09 | CT-P04 — Cidade obrigatória não estava sendo selecionada

**Sintoma:** Ao clicar em "Salvar", o Angular exibia aviso "Selecione as modalidades do clube" e "Cidade inválida". O POST nunca era disparado.

**Causa 1 — Cidade:** `selectEstado()` foi chamado sem o correspondente `selectCidade()`. O campo `cidadeClube` é obrigatório no POST.

**Causa 2 — Cidades vazias:** O stub de cidades retornava `{ data: [] }`, sem opções disponíveis para selecionar.

**Solução aplicada:**
```javascript
cy.intercept('GET', '**/estados/*/cidades', {
  body: { data: [{ id: 1, nome: 'São Paulo' }] }
}).as('cidades');
// ...
page.selectEstado();
cy.wait('@cidades');
page.selectCidade();
```

---

### ISSUE-10 | CT-P04 — Modalidade esportiva obrigatória

**Sintoma:** Aviso "Selecione as modalidades do clube" impedia o submit do formulário.

**Causa:** O formulário exige ao menos uma modalidade esportiva marcada. O teste não marcava nenhuma.

**Solução aplicada:**
```javascript
// No page object:
selectFirstModalidade() {
  cy.contains('Modalidades do Clube')
    .closest('section, div, fieldset')
    .find('input[type="checkbox"]')
    .first()
    .check({ force: true });
}

// No CT-P04:
page.selectFirstModalidade();
page.save();
```

---

## 4. Cobertura de riscos por área

| Área de risco | Cenários que cobrem | Descobertas |
|---|---|---|
| CNPJ inválido aceito | CT-N01, CT-A03, CT-A05 | BUG-01: CNPJ `00000000000000` expõe dado interno |
| Campos obrigatórios ausentes | CT-N03..09, CT-N11..15, CT-N17, CT-N19 | Todos rejeitados corretamente pelo Angular |
| CPF com dígito verificador inválido | CT-N10, CT-N16, CT-A06 | Validação Angular funciona; API retorna 400 |
| E-mail inválido | CT-N04, CT-A08 | Ambos rejeitam corretamente |
| Datas incoerentes | BUG-03 | Sem validação cruzada — bug aberto |
| Telefone sem formato | BUG-02 | Sem validação de pattern — bug aberto |
| Fluxo de acesso cross-domain (Keycloak) | CT-F05, CT-P01 | Funciona com cy.origin() |
| Dialog de aviso obrigatório | CT-F01..04, CT-F07 | Comportamento conforme esperado |
| Persistência de dados | BUG-03 | Formulário perde dados ao recarregar |
| Performance da API | CT-PERF-01, CT-PERF-02 | Aguardando execução com k6 |

---

## 5. Como executar os testes

```bash
# Instalar dependências
npm install && npx cypress install

# Testes por categoria (requer macOS estável ou ajuste de versão do Cypress)
npm run test:flow        # CT-F01 a CT-F07
npm run test:positive    # CT-P01 a CT-P05
npm run test:negative    # CT-N01 a CT-N19
npm run test:api         # CT-A01 a CT-A08
npm run test             # Todos

# Interface gráfica
npm run test:open

# Performance (requer k6: brew install k6)
npm run perf

# Pós-execução
npm run collect:evidence   # gera evidence-collector/output/evidence-summary.json
npm run generate:metrics   # gera metrics/metrics-summary.json
```
