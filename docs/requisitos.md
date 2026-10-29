# Matriz RF01–RF08 — versão integrada

Base funcional: main `87b16f0`, após PR #14. Issues #1–#6 confirmadas como fechadas.
Código inspecionado e fluxos abaixo executados nesta etapa. “Integrado” não significa
que o site já foi publicado ou que a issue #7 esteja encerrada.

| RF | Código / contrato | Situação e verificação |
|---|---|---|
| RF01 | `listarServicos`, catálogo e tela Agendar | Integrado (#2/#4); quatro serviços/valores visíveis nas capturas 01/02 |
| RF02 | `listarHorariosDisponiveis`, `ehDomingo`, expediente e almoço em `agenda.js` | Integrado (#3/#4); testes de domingo/almoço/18h e disponibilidade após operações |
| RF03 | `validarDadosCliente(nome, telefone)` e erros de campo | Integrado (#2/#4); nome vazio e telefone curto bloqueados no navegador (03/04) |
| RF04 | Releitura por `listarPorData`, `hasConflito` antes de `salvarRegistro` | Integrado (#3/#4); suíte cobre sobreposição e falha na confirmação; horários ocupados não oferecidos |
| RF05 | `listarPorData`, `ordenarPorHorario`, `minutosParaHora`, tela Painel | Integrado (#5/PR #11); criação 14h/09h/10h30 exibida 09h/10h30/14h (06) |
| RF06 | `cancelarRegistro`, eventos e reconsulta das telas | Integrado (#5); cancelar 10h30 liberou 10h30/11h para escova sem recarga (07/08); exclusão mantida após recarga |
| RF07 | Formulário/lista de bloqueios, `salvarRegistro`/`cancelarRegistro` e conflitos | Integrado (#6/PR #14); bloquear 13h–14h removeu 13h/13h30; desbloquear os restaurou (09–12) |
| RF08 | `concluirRegistro` e badge Concluído | Integrado (#6/PR #14); atendimento das 09h concluído e mantido após recarga (13) |

## Extra WhatsApp

Integrado pelo PR #14. O link da cliente fictícia abriu a página oficial com
nome, serviço, data e horário preenchidos (14). Nenhuma mensagem foi enviada.
Limitação confirmada: número nacional iniciado por DDD 55 é confundido com DDI
já informado. O caso é documentado; não foi corrigido nesta branch documental.

## Testes e evidências

`npm test`: 37 aprovados, 0 reprovados — 10 motor, 9 Agendar, 11 painel,
6 diferenciais e 1 navegação. Sintaxe JavaScript e diff verificados.
Diagnóstico adicional em memória: 6 testes de diferenciais e 1 reprodução do DDD 55
passaram; o último comprova a limitação, não uma correção. Não integra a contagem 37.
[Capturas reais](media/README.md) e [registro da entrega](entrega-final.md).

## Situação dos entregáveis

- Documentação e evidências: preparadas no PR #13; atribuições das decisões são
  propostas para confirmação de autoria original.
- Pages: API informou has_pages false; falta permissão admin/maintain para habilitar.
- Kanban: issues #1–#6 fechadas; coluna dos cards não verificada por falta de read:project.
- Tag v1.0: ausente na consulta remota; não criada. Somente após merge de #13 e autorização.
- Issue #7: aberta; não pode ser declarada concluída antes de Pages e tag.

## PRs de implementação

[#8 / estrutura](https://github.com/AmaroJL/Treinee-calango.io/pull/8),
[#9 / dados](https://github.com/AmaroJL/Treinee-calango.io/pull/9),
[#12 / motor](https://github.com/AmaroJL/Treinee-calango.io/pull/12),
[#10 / Agendar](https://github.com/AmaroJL/Treinee-calango.io/pull/10),
[#11 / Painel](https://github.com/AmaroJL/Treinee-calango.io/pull/11),
[#14 / diferenciais](https://github.com/AmaroJL/Treinee-calango.io/pull/14): integrados.
[#13 / entrega](https://github.com/AmaroJL/Treinee-calango.io/pull/13): aguardando revisão/merge.
