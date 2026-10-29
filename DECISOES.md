# Decisões técnicas — Studio Rita

Revisão documental da main `4ff53da`. As cinco decisões abaixo já existiam no
repositório; foram preservadas e confrontadas com o código. O formato adotado é
o existente no projeto: opções consideradas, decisão/motivo e consequências.
A interface das issues #5/#6 ainda não está integrada nessa base; referências a
cancelamento, bloqueio e conclusão descrevem contratos de apoio, não entrega da UI.

## D01 — Definição do horário de almoço da Rita (Premissa de Negócio)
- **Opções consideradas:**
  1. **Fixar horário de almoço das 12:00 às 13:00 (1 hora):** Bloqueio automático na regra de geração de horários livres.
  2. **Fixar horário de almoço das 12:00 às 14:00 (2 horas):** Bloqueio fixo mais longo no meio do expediente.
  3. **Deixar sem bloqueio fixo e exigir bloqueio manual diário (RF07):** A Rita teria de bloquear o almoço manualmente todos os dias no painel.
- **Decisão e motivo:** Escolhemos a **Opção 1 (12:00 às 13:00 fixo na regra de negócio)**. O relato da cliente afirma explicitamente que atende das 9h às 18h e "para para almoçar", mas não especifica a hora exata. Automatizar 12:00–13:00 evita que a Rita tenha trabalho manual diário para proteger o seu horário de refeição e garante que serviços longos (como coloração de 1h30 às 11:00) não invadam o intervalo das 12:00.
- **Consequências ou riscos:** Nenhum serviço pode iniciar ou terminar de forma a sobrepor o intervalo entre 12:00 e 13:00. Caso num dia atípico a Rita queira almoçar mais tarde, a regra padrão manterá as 12:00 bloqueadas.

---

## D02 — Formato interno dos horários para cálculo de conflitos
- **Opções consideradas:**
  1. **Minutos inteiros a partir da meia-noite (ex: `600` para `10:00`, `630` para `10:30`):** Representação numérica pura.
  2. **Strings no formato `"HH:MM"` (ex: `"10:00"`):** Comparação lexicográfica ou conversão constante com `.split(':')`.
  3. **Objetos `Date` ou timestamps ISO do JavaScript:** Utilização da API nativa `new Date()`.
- **Decisão e motivo:** Escolhemos a **Opção 1 (Minutos inteiros a partir da meia-noite)**. Como a duração dos serviços já é expressa em minutos (30, 60, 90), verificar se há sobreposição reduz-se a uma inequação aritmética simples e rápida (`novoInicio < agendamentoFim && novoFim > agendamentoInicio`), sem problemas de fuso horário (`Timezone`) do objeto `Date` e em alinhamento com os testes do motor em `tests/agenda.test.js`.
- **Consequências ou riscos:** As funções reais são `minutosParaHora(minutos)` e `horaParaMinutos(horaStr)`, em `src/regras/agenda.js`. O motor calcula intervalos em minutos, mas `listarHorariosDisponiveis(dataISO, duracaoServico, agendamentosDoDia)` retorna strings `"HH:MM"` para a interface. A seleção é convertida antes de salvar `inicio` e `duracao` numéricos no repositório.

---

## D03 — Intervalo da grelha de horários disponíveis (Slots de 30 minutos)
- **Opções consideradas:**
  1. **Slots de 30 em 30 minutos (09:00, 09:30, 10:00... até 17:30):** Grelha alinhada ao menor tempo de serviço (escova e manicure duram 30 min).
  2. **Slots de 60 em 60 minutos (apenas horas cheias):** Simplificação visual da tela.
- **Decisão e motivo:** Escolhemos a **Opção 1 (Slots de 30 em 30 minutos)**. Todos os 4 serviços da Rita possuem durações múltiplas de 30 minutos (30 min, 60 min e 90 min). Além disso, o critério de aceitação do RF02 explicita que, com um corte às 10:00 (duração de 1h), a escova não deve oferecer 10:00 nem 10:30, confirmando que a unidade base da grelha de horários é de 30 minutos.
- **Consequências ou riscos:** Impede a criação de "buracos" inutilizáveis de 15 minutos na agenda da Rita e mantém a lista de botões de horário limpa e rápida de carregar no telemóvel ou computador.

---

## D04 — Estrutura de persistência no `localStorage` e tratamento de cancelamentos/bloqueios
- **Opções consideradas:**
  1. **Lista única na chave `"studio_rita_agendamentos"` com campo `tipo` (`"agendamento"` | `"bloqueio"`) e `status` (`"ativo"` | `"concluido"`), removendo ou inativando ao cancelar:** Centralização de todos os eventos que ocupam tempo na agenda.
  2. **Chaves separadas no `localStorage` para agendamentos de clientes e bloqueios da Rita:** Duas listas independentes (`"agendamentos"` e `"bloqueios"`).
- **Decisão e motivo:** Escolhemos a **Opção 1 (Lista única unificada por data e horário)**. Tanto um agendamento de cliente quanto um bloqueio manual da Rita (RF07) têm o mesmo efeito prático na regra de negócio: ocupar um intervalo `[inicio, inicio + duracao]` num determinado dia (`YYYY-MM-DD`). Ao cancelar um agendamento (RF06), o registo é removido da lista ativa, libertando imediatamente o horário sem duplicar a lógica de verificação de conflito.
- **Consequências ou riscos:** `src/storage/repositorio.js` serializa/desserializa o array na chave `studio_rita_agendamentos`. `listarPorData(dataISO)` exclui status `cancelado`, mas mantém `concluido`; `cancelarRegistro(id)` remove o item e `concluirRegistro(id)` altera seu status. Essas operações de apoio já existem, mas seus botões dependem das interfaces #5/#6. A leitura vazia ou inválida retorna `[]`; isso pode ocultar corrupção e permitir sobrescrita posterior. Não há sincronização entre dispositivos nem transações atômicas entre abas.

---

## D05 — Arquitetura em Camadas e Isolamento do DOM (`src/regras/` vs `src/ui/`)
- **Opções consideradas:**
  1. **Arquitetura modular estrita (`src/regras/`, `src/storage/`, `src/ui/`):** Funções em `src/regras/` recebem apenas dados primitivos/objetos por parâmetro e retornam novos valores, sem tocar em `document` ou `localStorage`.
  2. **Lógica acoplada aos ouvintes de eventos (`addEventListener`):** Ler inputs do HTML e validar conflitos dentro da mesma função de clique.
- **Decisão e motivo:** Escolhemos a **Opção 1 (Isolamento total das regras de negócio)**. É uma restrição técnica obrigatória que as regras em `src/regras/` sejam funções puras testadas via `node --test`. Como o ambiente de execução do Node.js não possui `window`, `document` ou `localStorage` por padrão, qualquer acoplamento quebraria a execução dos testes automatizados.
- **Consequências ou riscos:** Exige maior disciplina da equipa durante o Code Review para garantir que nenhum PR introduza chamadas de interface dentro de `src/regras/`, mas em troca permite testar 100% dos casos de fronteira (domingo, horário de almoço, limite das 18:00 e sobreposições) em milissegundos.

---

## Evidências e pontos a revisar na entrega

- **D01:** `horarioDentroDoExpediente` e `listarHorariosDisponiveis` protegem almoço
  e fim do expediente; serviços podem terminar exatamente às 12h ou iniciar às 13h.
- **D02/D03:** `horaParaMinutos`, `minutosParaHora` e `INTERVALO_SLOT = 30` confirmam
  representação e grelha; não há conversores paralelos na interface.
- **D04:** `salvarRegistro` gera id/status e mantém data, inicio, duracao, servicoId,
  servicoNome, preco, clienteNome e clienteTelefone. Dados persistem por origem.
- **D05:** DOM em `src/ui/`; regras em `src/regras/`; acesso ao armazenamento em
  `src/storage/`. `src/main.js` conecta as dependências.

O motor não filtra horários passados hoje. A decisão sobre essa regra ainda precisa
ser alinhada com a equipe; não é registrada aqui como implementada. Não foram
inventadas decisões de bloqueio, conclusão, WhatsApp ou deploy ainda não integrados.
