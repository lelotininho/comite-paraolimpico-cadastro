# Bugs e Sugestões de Melhoria

## Bugs identificados

- Validação de CPF não está testada para formato inválido ou algoritmo incorreto.
- Mensagens de erro aparentam ser específicas apenas para campos obrigatórios, mas não há validação de formato do CPF.
- A interface de retorno após submissão não detalha o registro criado, apenas exibe mensagem genérica.

## Sugestões de melhoria

- Adicionar validações no frontend e backend para CPF válido com algoritmo de cálculo.
- Exibir a categoria selecionada e número de protocolo ao finalizar cadastro.
- Implementar testes de API para os endpoints de consulta e listagem de cadastros.
- Registrar logs de falha e enviar evidência automática em caso de erro de formulário.
- Incluir teste de carga para identificar timeouts em submissões simultâneas.
