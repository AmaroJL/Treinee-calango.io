# Integração da tela Agendar (#4)

A página principal usa catálogo, validação e repositório integrados na main.
O motor é importado de src/regras/agenda.js. Se estiver ausente ou incompleto,
a seleção de horários e a confirmação permanecem bloqueadas com aviso explícito.
Após integrar o PR #12, recarregue a página para carregar o módulo.

Contrato consultado no PR #12 (bf6761e): listarHorariosDisponiveis retorna
strings HH:MM; horaParaMinutos converte a seleção antes de salvar. O registro
usa data YYYY-MM-DD, inicio e duracao numéricos, servicoId, servicoNome, preco,
clienteNome e clienteTelefone. ID e status são gerados pelo repositório.
A interface usa ehDomingo para a mensagem específica e hasConflito na confirmação.

Pendências: validar novamente os contratos após as correções/merge do PR #12;
executar o fluxo completo no navegador, recarga/persistência e retorno após
cancelamento no painel integrado. A versão consultada do motor não filtra horários
já passados hoje: combinar essa regra com a equipe, sem implementá-la na interface.
A proteção contra duplo envio vale para esta tela; localStorage não oferece
transações atômicas entre abas. O repositório atual trata leitura inválida como
lista vazia; recuperação de dados corrompidos permanece responsabilidade da #2.

npm test executa testes da interface com DOM mínimo, regras controladas e
repositório real sobre armazenamento em memória. Não comprova persistência de
navegador, layout em aparelhos físicos ou comportamento real do motor ausente.
preview/agendar.html continua isolado, com dados demonstrativos e sem salvamento.
