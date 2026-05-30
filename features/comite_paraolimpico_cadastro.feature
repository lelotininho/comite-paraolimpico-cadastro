Funcionalidade: Registrar Clube no Comitê Paralímpico Brasileiro

  Como responsável por um clube esportivo
  Eu quero solicitar filiação ao CPB via formulário web
  Para que o clube receba acesso ao sistema após aprovação

  # ── Cenários de Fluxo ─────────────────────────────────────────────────────

  Cenário: CT-F01 - Popup de aviso exibida ao acessar o formulário
    Dado que acesso a URL pública de registro de clube
    Então devo ver o aviso sobre documentação necessária

  Cenário: CT-F02 - Cancelar popup encerra o fluxo
    Dado que acesso a URL pública de registro de clube
    Quando clico em "Cancelar" no aviso
    Então o formulário não deve estar disponível

  Cenário: CT-F03 - Confirmar popup exibe o formulário
    Dado que acesso a URL pública de registro de clube
    Quando confirmo o aviso clicando em "Continuar"
    Então o campo de CNPJ deve estar disponível para preenchimento

  Cenário: CT-F05 - Fluxo de acesso pela tela de login
    Dado que estou na tela de login do sistema
    Quando clico em "Registrar Clube"
    Então sou direcionado ao formulário de cadastro de clube

  # ── Cenários Positivos ────────────────────────────────────────────────────

  Cenário: CT-P03 - CNPJ não cadastrado habilita preenchimento manual
    Dado que confirmo o aviso do formulário
    Quando informo um CNPJ não cadastrado e clico em pesquisar
    Então sou informado que o CNPJ não foi encontrado
    E os campos do formulário ficam habilitados para preenchimento

  Cenário: CT-P04 - Cadastro completo de clube
    Dado que confirmo o aviso do formulário
    E preencho todos os campos obrigatórios com dados válidos
    Quando envio o formulário
    Então devo ver a mensagem de confirmação do cadastro

  # ── Cenários Negativos ────────────────────────────────────────────────────

  Cenário: CT-N01 - CNPJ com formato inválido
    Dado que confirmo o aviso do formulário
    Quando informo um CNPJ inválido
    Então o campo de CNPJ deve ser marcado como inválido

  Cenário: CT-N02 - CNPJ já cadastrado exibe alerta
    Dado que confirmo o aviso do formulário
    Quando informo um CNPJ que já está cadastrado
    Então devo ver o aviso de CNPJ já cadastrado

  Cenário: CT-N04 - E-mail do clube com formato inválido
    Dado que confirmo o aviso do formulário
    Quando preencho o campo de e-mail com formato inválido
    E envio o formulário
    Então o campo de e-mail deve ser marcado como inválido

  Cenário: CT-N06 - Sigla do clube respeita limite de 15 caracteres
    Dado que confirmo o aviso do formulário
    Quando digito uma sigla com mais de 15 caracteres
    Então apenas os 15 primeiros caracteres devem ser aceitos

  Cenário: CT-N10 - CPF inválido para o presidente
    Dado que confirmo o aviso do formulário
    Quando informo um CPF inválido para o presidente
    E envio o formulário
    Então o campo de CPF do presidente deve ser marcado como inválido

  Cenário: CT-N19 - Formulário vazio exibe múltiplos erros
    Dado que confirmo o aviso do formulário
    Quando envio o formulário sem preencher nenhum campo
    Então devo ver mensagens de erro em múltiplos campos obrigatórios
