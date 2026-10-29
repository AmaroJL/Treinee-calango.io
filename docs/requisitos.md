# Requisitos RF01–RF08

Snapshot da main `4ff53da`. “Integrado” descreve código presente nessa base, não
certifica deploy nem substitui a verificação final da entrega. As pendências
abaixo não devem ser marcadas concluídas só porque há um PR ou uma função de apoio.

| RF | Comportamento | Evidência no código atual | Situação / próxima verificação |
|---|---|---|---|
| RF01 | Exibir quatro serviços, duração e preço | `src/regras/servicos.js`, `src/ui/telaAgendar.js` | Integrado pela #2/#4; conferir os quatro valores na versão publicada |
| RF02 | Horários por data/duração, domingo, almoço, expediente | `listarHorariosDisponiveis`, `ehDomingo` em `src/regras/agenda.js`; tela Agendar | Integrado pela #3/#4; motor não filtra horários já passados hoje |
| RF03 | Validar nome/telefone e impedir confirmação inválida | `validarDadosCliente(nome, telefone)` e erros por campo na tela | Integrado; telefone exige ao menos 8 dígitos, não valida número real |
| RF04 | Impedir sobreposição antes de salvar | `hasConflito(novo, marcados)` e releitura em Agendar | Integrado; validar novamente no fluxo final, sem atomicidade entre abas |
| RF05 | Agenda por data, ordem cronológica, cliente/telefone/serviço | `ordenarPorHorario` já existe; interface do painel ausente na main | Pendente da #5 / PR #11 |
| RF06 | Cancelar e liberar horário em Agendar | `cancelarRegistro(id)` já existe; ação da interface ausente na main | Pendente da #5 / PR #11 e verificação conjunta na main final |
| RF07 | Criar/remover bloqueio e impedir agendamento no intervalo | Repositório aceita `tipo: bloqueio`; formulário/ações ausentes | Pendente da #6 e testes de criação, bloqueio e remoção |
| RF08 | Concluir e persistir status, com indicação visual | `concluirRegistro(id)` já existe; botão/estilo não integrados | Pendente da #6 e teste de recarga |

## Extras e entregáveis

- Lembrete por WhatsApp: extra da #6, pendente. Validar abertura do link e conteúdo;
  abrir um link não comprova envio de mensagem, que é ação da pessoa no WhatsApp.
- Testes: executados nesta etapa, 19 passando na base acima. Reexecutar após merges.
- Documentação: primeira etapa da #7, em Draft; falta atualizar snapshot/evidências.
- Prints/GIFs: estrutura preparada, capturas finais pendentes.
- Pages: roteiro preparado, configuração/publicação final e URL pendentes de verificação.
- Tag v1.0: não criada/publicada nesta etapa; somente após validação final e autorização.
- Kanban: verificar manualmente cards, vínculos com PRs e coluna Pronto; não foi
  declarada conclusão do quadro nesta etapa.

## Referências de escopo

- [#2 — Serviços, validação e armazenamento](https://github.com/AmaroJL/Treinee-calango.io/issues/2)
- [#3 — Motor](https://github.com/AmaroJL/Treinee-calango.io/issues/3)
- [#4 — Agendar](https://github.com/AmaroJL/Treinee-calango.io/issues/4)
- [#5 — Painel e cancelamento](https://github.com/AmaroJL/Treinee-calango.io/issues/5)
- [#6 — Bloqueio, conclusão e WhatsApp](https://github.com/AmaroJL/Treinee-calango.io/issues/6)
- [#7 — Entrega](https://github.com/AmaroJL/Treinee-calango.io/issues/7)
