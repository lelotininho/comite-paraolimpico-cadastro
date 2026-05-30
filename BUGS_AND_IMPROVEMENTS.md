# Bugs e Sugestões de Melhoria

Identificados durante exploração manual e execução de testes contra o ambiente de homologação CPB.

---

## Bugs

### BUG-01 | CNPJ `00000000000000` expõe registro interno "SEM CLUBE"
- **Severidade:** Alta
- **Tipo:** Segurança / Integridade de dados
- **Componente:** API REST — `GET /api/cadastro-api/v1/public/clubes/cnpj/00000000000000`
- **Como reproduzir:**
  1. Fazer requisição `GET https://homologcadastroweb.cpb.org.br/api/cadastro-api/v1/public/clubes/cnpj/00000000000000`
  2. Observar resposta `200 OK`
- **Comportamento observado:**
  ```json
  {
    "data": {
      "clube": {
        "id": 1,
        "nomeCompletoClube": "SEM CLUBE",
        "cnpjClube": "00.000.000/0000-00",
        "emailClube": "INFORMATICA1@CPB.ORG.BR"
      }
    }
  }
  ```
- **Comportamento esperado:** `400 Bad Request` com mensagem "CNPJ inválido".
- **Causa provável:** Existe um registro sentinela no banco com CNPJ `00.000.000/0000-00` (id=1) criado para representar "sem clube". O backend não valida o formato do CNPJ antes de consultar; ao receber dígitos todos zerados, a máscara aplicada resulta em `00.000.000/0000-00` e o registro sentinela é encontrado.
- **Impacto:**
  - Expõe o e-mail interno `INFORMATICA1@CPB.ORG.BR` para qualquer pessoa sem autenticação.
  - Na UI, o formulário pode ser preenchido com CNPJ `00.000.000/0000-00` se o usuário digitar zeros, levando ao fluxo de atualização em vez de criação.
- **Solução sugerida:**
  1. No backend, validar o algoritmo de CNPJ antes de qualquer consulta ao banco.
  2. Retornar `400 Bad Request` com corpo `{ "error": "CNPJ inválido" }` para qualquer CNPJ com formato incorreto.
  3. Considerar substituir o registro sentinela por um tratamento explícito de "null/nenhum clube".

---

### BUG-02 | Campo Telefone aceita qualquer texto sem validação de formato
- **Severidade:** Média
- **Tipo:** Validação / Qualidade de dados
- **Componente:** Formulário Angular — campo `telefoneClube`
- **Como reproduzir:**
  1. Acessar o formulário de Registrar Clube.
  2. Confirmar o popup.
  3. Digitar `"abc123"` no campo Telefone.
  4. Preencher os demais campos obrigatórios e clicar "Salvar".
- **Comportamento observado:** O formulário aceita o valor sem exibir erro de validação.
- **Comportamento esperado:** Exibir "Formato inválido. Use (XX) XXXX-XXXX".
- **Causa provável:** O campo tem apenas `Validators.required`; ausência de `Validators.pattern` no `FormBuilder` do componente Angular (`ClubeExternoComponent`).
- **Impacto:** Dados de telefone inconsistentes no banco; impossibilidade de contato posterior com o clube.
- **Solução sugerida:**
  1. Adicionar `Validators.pattern(/^\(\d{2}\)\s9?\d{4}-\d{4}$/)` no FormBuilder.
  2. Aplicar a diretiva `ngxMask` com padrão `(00) 0000-0000` ou `(00) 00000-0000` (celular).

---

### BUG-03 | Datas de mandato sem validação cruzada
- **Severidade:** Média
- **Tipo:** Validação / Integridade de dados
- **Componente:** Formulário Angular — campos `dataInicioMandatoPresidente` e `dataTerminoMandatoPresidente`
- **Como reproduzir:**
  1. No formulário de Registrar Clube, preencher `dataInicioMandatoPresidente` com `01/01/2024`.
  2. Preencher `dataTerminoMandatoPresidente` com `01/01/2020` (data anterior).
  3. Preencher demais campos e clicar "Salvar".
- **Comportamento observado:** O formulário não exibe erro de validação para datas inconsistentes.
- **Comportamento esperado:** Exibir "Data de término deve ser posterior à data de início".
- **Causa provável:** Cada campo tem `Validators.required` e `validateDate` individualmente, mas não existe um validador de grupo (`AbstractControl`) que compare os dois valores.
- **Impacto:** Banco de dados pode conter mandatos com período negativo, causando erro em relatórios e cálculos de vigência.
- **Solução sugerida:**
  ```typescript
  // Adicionar no FormGroup após a criação:
  this.form.setValidators(mandatoDateRangeValidator);
  
  // Validator:
  function mandatoDateRangeValidator(group: AbstractControl) {
    const inicio = group.get('dataInicioMandatoPresidente')?.value;
    const termino = group.get('dataTerminoMandatoPresidente')?.value;
    if (inicio && termino && parseDate(termino) <= parseDate(inicio)) {
      return { mandatoInvalido: true };
    }
    return null;
  }
  ```

---

### BUG-04 | Popup de aviso sem gerenciamento de foco (acessibilidade)
- **Severidade:** Baixa
- **Tipo:** Acessibilidade
- **Componente:** Dialog Bootstrap `#clubeExternoDialog`
- **Como reproduzir:**
  1. Acessar `/public/clubes-externos` usando apenas o teclado (Tab, Enter).
  2. O modal abre automaticamente.
  3. Pressionar Tab — o foco permanece fora do modal.
- **Comportamento observado:** Foco do teclado não é movido para o dialog ao abrir; usuários de leitor de tela não são notificados do modal.
- **Comportamento esperado:** Foco deve ser movido para o primeiro elemento interativo do modal (botão "Continuar") ao abrir, conforme WCAG 2.4.3.
- **Causa provável:** A chamada `$(modal).modal('show')` do Bootstrap não gerencia o foco automaticamente na versão em uso. O Angular não chama `element.focus()` após a abertura.
- **Impacto:** Viola diretrizes de acessibilidade WCAG 2.1 (nível AA) — impedimento para usuários com deficiência visual ou motora.
- **Solução sugerida:**
  ```typescript
  // Em ClubeExternoDialogComponent, após abrir o modal:
  abrir() {
    this.showModal('clubeExternoDialog');
    setTimeout(() => {
      const btnContinuar = document.querySelector('#clubeExternoDialog .btn-primary');
      (btnContinuar as HTMLElement)?.focus();
    }, 300); // aguarda a animação do Bootstrap
  }
  ```

---

## Sugestões de Melhoria

### MELHORIA-01 | Mensagens de erro específicas por tipo de validação
- **Situação atual:** Todos os campos inválidos exibem apenas `"Campo {label} inválido"` — sem distinção entre campo vazio, formato errado ou comprimento excedido.
- **Impacto:** Usuário não sabe o motivo exato do erro, aumentando tentativas e taxa de abandono.
- **Sugestão:**
  - "Campo obrigatório" para `required`
  - "Formato inválido. Ex: exemplo@email.com" para `email`
  - "Máximo de 15 caracteres" para `maxLength`
  - "CNPJ inválido" para `validateCnpj`
  - "CPF inválido" para `validateCpf`
- **Esforço estimado:** Médio — refatorar o componente base `app-input-text` para usar `getErrorMessage()` dinâmico.

---

### MELHORIA-02 | Persistência temporária do formulário (rascunho)
- **Situação atual:** Todos os dados preenchidos são perdidos ao recarregar a página ou navegar acidentalmente para fora.
- **Impacto:** Alta frustração; formulário tem mais de 30 campos — risco real de abandono.
- **Sugestão:** Salvar o estado do formulário em `sessionStorage` a cada 5 segundos e restaurar automaticamente ao recarregar.
  ```typescript
  this.form.valueChanges.pipe(debounceTime(5000)).subscribe(val => {
    sessionStorage.setItem('clubeExternoDraft', JSON.stringify(val));
  });
  ```
- **Esforço estimado:** Baixo.

---

### MELHORIA-03 | Indicação visual após busca de CNPJ
- **Situação atual:** Após dispensar o SweetAlert2 de "CNPJ não encontrado", não há indicação visual de que o formulário está habilitado. O usuário pode não entender que deve preencher manualmente.
- **Sugestão:** Adicionar badge `"CNPJ não cadastrado — preencha os dados abaixo"` próximo ao campo CNPJ, com cor de destaque (amarelo ou azul informativo).
- **Esforço estimado:** Baixo.

---

### MELHORIA-04 | Número de protocolo na mensagem de sucesso
- **Situação atual:** Mensagem de sucesso é genérica: "Clube incluído com sucesso! O CPB fará uma análise…" sem referência ao cadastro criado.
- **Impacto:** Usuário não tem número de protocolo para acompanhar ou contestar o processo.
- **Sugestão:** Incluir `id` ou número de protocolo gerado pelo backend na mensagem de sucesso.
- **Esforço estimado:** Baixo — o backend já deve retornar o `id` no body da resposta `201`.

---

### MELHORIA-05 | Indicador de progresso no formulário
- **Situação atual:** Formulário longo (30+ campos) sem indicação de seções ou progresso.
- **Sugestão:** Adicionar cabeçalhos de seção visíveis ("1. Dados do Clube", "2. Endereço", "3. Presidente", "4. Diretor", "5. Modalidades") ou um stepper de progresso.
- **Esforço estimado:** Médio.
