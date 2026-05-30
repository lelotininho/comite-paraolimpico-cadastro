Funcionalidade: Cadastro no Comitê Paralímpico

  Como membro do comitê
  Eu quero cadastrar atletas e representantes
  Para que o sistema valide os dados de inscrição corretamente

  Cenário: Cadastro válido de atleta
    Dado que estou na página de cadastro do Comitê Paralímpico
    Quando preencho o formulário com dados válidos
    E envio o cadastro
    Então devo ver a confirmação de inscrição realizada com sucesso

  Cenário: Cadastro inválido sem CPF
    Dado que estou na página de cadastro do Comitê Paralímpico
    Quando preencho o formulário sem CPF
    E envio o cadastro
    Então devo ver uma mensagem de erro informando CPF obrigatório

  Cenário: Cadastro inválido com e-mail inválido
    Dado que estou na página de cadastro do Comitê Paralímpico
    Quando preencho o formulário com e-mail inválido
    E envio o cadastro
    Então devo ver uma mensagem de erro de formato de e-mail

  Cenário: Cadastro de representante com status especial
    Dado que estou na página de cadastro do Comitê Paralímpico
    Quando preencho o formulário para representante com dados completos
    E envio o cadastro
    Então devo ver a confirmação de registro e o tipo de usuário correto
