# Painel da Rita (#5): integração e limites

A página principal inicializa telaPainelRita com listarPorData e cancelarRegistro
reais do repositório da #2. A seleção começa na data local de hoje. O painel
consulta novamente ao trocar a data, reabrir a aba, receber agenda:alterada ou um
evento storage. Somente registros do tipo agendamento são apresentados.

Cancelar pede confirmação, relê o registro, verifica status ativo, chama o
repositório, atualiza a lista e emite agenda:alterada com data e id. Recusar não
altera o registro; erros de gravação não anunciam sucesso. Itens concluídos e
preview sem cancelarRegistro ficam com botão desabilitado.

O módulo da #3 é importado de src/regras/agenda.js sem copiar suas funções.
Após o merge do PR #12, recarregar a página deve fornecer ordenarPorHorario e
minutosParaHora. A interface usa início e início + duração numéricos em minutos,
conforme os registros existentes. Sem o motor, a consulta e o cancelamento podem
funcionar, mas a ordem do repositório é explicitamente sinalizada e os horários
ficam identificados como pendentes, sem regras provisórias de ordenação/formatação.

A branch não contém a implementação da #4. Ao integrar os dois PRs, preservar as
duas inicializações e os links de CSS em main.js e index.html. A #4 já prepara
reconsulta ao reabrir Agendar, permitindo refletir os registros cancelados.
Não foi comprovada a liberação de horários sem motor e sem as telas juntas.

Validação: npm test executa nove testes com DOM mínimo e repositório real sobre
armazenamento em memória. Motor/confirmador são controlados. A reimportação do
repositório conserva a exclusão nesse armazenamento; isso não equivale a F5 real.
No navegador, foram verificadas a abertura pela aba, ausência de motor, lista
vazia, alteração de data por teclado e foco. O preview mantém dados fictícios e
cancelamento bloqueado. Persistência após recarga real, cronologia com motor real,
fluxo cancelar/voltar para Agendar, aparelho físico e leitor de tela ainda pendem.

A recuperação de conteúdo corrompido no storage continua responsabilidade da #2.
O repositório atual devolve [] em falhas de leitura; o painel não consegue distinguir
esse caso de uma agenda vazia sem uma mudança no contrato do repositório.
