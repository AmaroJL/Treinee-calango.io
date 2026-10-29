# Tela Agendar (#4)

A página principal inicializa a tela com catálogo, validação e repositório reais,
e importa listarHorariosDisponiveis, hasConflito, horaParaMinutos e ehDomingo do
motor integrado na main pelo PR #12 (merge 3ae00e9).

Horários são strings HH:MM na interface; inicio e duracao são minutos numéricos
no registro salvo. O repositório gera id/status. A confirmação relê a data e
revalida disponibilidade/conflito antes de salvar; limpa a seleção e atualiza
os horários após sucesso. Uma segunda submissão sem nova seleção não grava.
A aba Agendar consulta novamente ao ser reaberta e no evento storage.

Validação executada nesta etapa:
- npm test: 19 testes passaram (10 do motor e 9 da interface).
- Testes da interface usam DOM mínimo; os dois casos novos usam o motor real e
  o repositório real sobre armazenamento em memória.
- Navegador na página principal em origem exclusiva de teste 127.0.0.1:8002:
  quatro serviços/valores, erro de nome vazio, telefone curto, salvamento fictício
  de corte às 10h em 2099-01-05, atualização dos horários e recarga real. Após
  recarregar, 10h e 10h30 continuaram bloqueados para escova. Domingo sem horários.
- Almoço, limite de expediente, conflitos e envio repetido cobertos na suíte.
- Sintaxe e git diff --check passaram.

O preview continua isolado e sem salvamento. Testes em aparelho físico e leitor
de tela não foram executados. A integração de cancelamento com o painel pertence
à #5. A regra de rejeitar horários passados no dia atual não existe no motor e
não foi duplicada na interface; permanece ponto de alinhamento com a equipe.
O repositório trata leitura inválida como lista vazia; recuperação de conteúdo
corrompido é responsabilidade da #2. Não há transações atômicas entre abas.
