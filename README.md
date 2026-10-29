# Agenda Studio Rita

Aplicação web para a cliente escolher um serviço e agendar um atendimento no
Studio Rita. O projeto também prevê um painel para a Rita consultar, cancelar,
bloquear e concluir atendimentos.

**Documentação em preparação para a entrega.** Esta primeira etapa descreve a
main no commit `4ff53da`, com as issues #1–#4 integradas pelos PRs #8, #9, #12 e #10.
As issues #5 e #6 ainda precisam de integração e verificação final. Este documento
não declara deploy, tag ou entrega final concluídos.

## Tecnologias

- HTML, CSS e JavaScript puro, sem framework ou backend.
- Módulos ES (`type: module`), página única e navegação entre abas.
- `localStorage`, encapsulado em `src/storage/repositorio.js`.
- Testes nativos do Node.js com `node:test` e `node:assert/strict`.

## Instalação

Pré-requisitos: Git, navegador moderno e Node.js com npm para executar os testes.
Para servir a página pelo exemplo abaixo, tenha também Python 3.
O ambiente verificado nesta etapa usa Node.js **v24.22.1** e npm **11.19.1**;
outras versões não foram verificadas nesta etapa.

```sh
git clone https://github.com/AmaroJL/Treinee-calango.io.git
cd Treinee-calango.io
```

O `package.json` atual não declara dependências externas: não é necessário
instalar pacotes para executar a aplicação ou os testes.

## Executar localmente

Na raiz do repositório:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Abra [a aplicação local](http://127.0.0.1:8000/index.html). Use HTTP em vez de
abrir `index.html` por `file://`, pois a aplicação carrega módulos JavaScript.
Encerre o servidor com `Ctrl+C` no terminal.

Nesta base, a aba **Agendar Atendimento** funciona; **Painel da Rita** ainda
exibe o espaço reservado da estrutura inicial. O painel do PR #11 não faz parte
desta main. `preview/agendar.html` é uma demonstração isolada e não salva dados.

## Executar os testes

```sh
npm test
```

O comando executa `node --test`. Nesta base foram executados **19 testes, todos
passando**: dez do motor e nove da interface Agendar. Casos de interface usam DOM
mínimo e armazenamento em memória; parte usa o motor real e parte usa respostas
controladas para testar falhas. Isso não equivale a teste automático de navegador.
Os resultados devem ser atualizados após integrar as issues #5 e #6; não usar a
contagem de outra branch como resultado desta main.

## Funcionalidades integradas

- Catálogo com nome, duração e preço.
- Seleção de data local e horários em intervalos de 30 minutos.
- Atendimento de segunda a sábado, das 09h às 18h, sem sobrepor almoço de 12h a 13h.
- Validação de nome e telefone, feedback e confirmação com nova checagem de conflito.
- Salvamento pelo repositório e atualização da disponibilidade após agendar.
- Campos com labels, mensagens `aria-live`, foco visível e estilos responsivos.

| Serviço | Duração | Preço |
|---|---:|---:|
| Corte | 60 min | R$ 50,00 |
| Escova | 30 min | R$ 35,00 |
| Manicure | 30 min | R$ 25,00 |
| Coloração | 90 min | R$ 120,00 |

## Requisitos e pendências

| Requisito | Situação na main consultada |
|---|---|
| RF01 — Serviços | Integrado |
| RF02 — Horários disponíveis | Integrado, com as limitações descritas abaixo |
| RF03 — Dados da cliente | Integrado |
| RF04 — Conflitos | Integrado |
| RF05 — Agenda do dia | Pendente de integração da #5 / PR #11 |
| RF06 — Cancelamento e liberação | Pendente de integração da #5 / PR #11 |
| RF07 — Bloqueio de horário | Pendente da #6 |
| RF08 — Conclusão do atendimento | Pendente da #6 |

O lembrete por WhatsApp é um extra da #6 e ainda não está integrado.
A existência de funções de cancelar/concluir no repositório e de ordenar no motor
não significa que esses fluxos já estejam disponíveis na interface da main.
Veja [o detalhamento dos requisitos](docs/requisitos.md).

## Estrutura

```text
index.html                 Página única e abas
style.css                  Estilos da estrutura inicial
src/main.js                Inicialização e navegação
src/regras/                Serviços, validação e motor puro
src/storage/               Acesso ao localStorage
src/ui/                    Interface Agendar (painel pendente de integração)
tests/                     Testes do motor e Agendar
docs/                      Requisitos, roteiro de entrega e evidências
preview/                   Demonstração isolada
```

## Persistência e limitações conhecidas

Os dados ficam somente no `localStorage` do navegador, na chave
`studio_rita_agendamentos`. Não há sincronização entre dispositivos ou navegadores.
Mudar a origem (protocolo, domínio ou porta), inclusive de localhost para Pages,
usa outro armazenamento. Limpar os dados do site pode remover os agendamentos.

- O motor atual não exclui horários já passados no dia de hoje; não há regra
  paralela na interface para isso. A definição permanece para alinhamento da equipe.
- O repositório retorna lista vazia para leitura inválida; salvar depois pode
  substituir conteúdo corrompido. Recuperação/backup não estão implementados.
- A releitura antes de confirmar não oferece transações atômicas entre abas.
- Celular físico e leitor de tela não foram validados nesta etapa documental.
- Painel, cancelamento pela interface, bloqueios, conclusão e WhatsApp aguardam
  integração; não são anunciados como entregues aqui.

## Prints ou GIFs

As evidências finais ainda serão capturadas após integração das issues #5 e #6.
O diretório [docs/media](docs/media/README.md) contém o roteiro, nomes sugeridos e
critérios para capturas reais com dados fictícios. Não há imagens de placeholder
apresentadas como provas nem links para arquivos de imagem inexistentes.

## Publicação e entrega

**URL do GitHub Pages: ainda não validada.** Não foi executado deploy nesta etapa.
Configuração planejada: branch `main`, pasta `/(root)`. A URL efetiva deverá ser
copiada de Settings → Pages após a publicação e validada no navegador.

O [roteiro da entrega final](docs/entrega-final.md) descreve configuração do Pages,
verificações do Kanban, evidências e preparação da tag. **A tag `v1.0` não foi
criada/publicada nesta etapa.** O valor `version` do package.json não comprova
existência de uma tag ou release.

Decisões técnicas: [DECISOES.md](DECISOES.md).
Issue desta documentação: [#7](https://github.com/AmaroJL/Treinee-calango.io/issues/7).
