# Roteiro da entrega final — issue #7

Esta é a primeira etapa documental, baseada na main `4ff53da`. Não habilita
publicação, não cria tag e não declara o projeto finalizado.

## Antes da publicação

- [ ] Aguardar revisão/merge da #5 (PR #11) e da #6 pelos responsáveis.
- [ ] Atualizar docs/entrega-final a partir da main resultante sem perder documentação.
- [ ] Conferir no código e navegador RF01–RF08 e extra WhatsApp, atualizando a matriz.
- [ ] Resolver conflitos preservando as duas telas e as funções de #2/#3.
- [ ] Executar npm test na revisão final e registrar versão do Node, quantidade e resultado.
- [ ] Validar agendar → painel → cancelar → horário livre; recarregar para persistência.
- [ ] Validar bloqueio/remoção e conclusão com recarga; conferir link de lembrete.
- [ ] Capturar evidências reais conforme docs/media/README.md e incluí-las no README.
- [ ] Revisar limitações, decisões e instruções, removendo status desatualizados.
- [ ] Conferir Kanban e PRs vinculados; mover para Pronto somente o que estiver entregue.

A issue #7 pede pelo menos cinco decisões comparadas na lista de tarefas, embora
cite quatro no critério de aceitação; manter as cinco existentes e verificadas.
O prazo original informado é 28/10/2026 às 23h59. Não declarar cumprimento de prazo
com base na preparação desta documentação: verificar o registro real da entrega.

## GitHub Pages — passos futuros

Executar somente depois da verificação da integração completa e da autorização
para publicação final. Nesta etapa nenhuma configuração do repositório foi alterada.

1. Com permissão de administração/manutenção, abrir o repositório no GitHub.
2. Acessar Settings → Pages → Build and deployment.
3. Em Source, escolher Deploy from a branch; selecionar main e /(root), pois
   index.html está na raiz. A pasta docs contém documentação, não a aplicação.
4. Salvar. Essa ação habilita publicação automática dos próximos pushes na fonte;
   por isso não deve ser antecipada enquanto a main estiver incompleta.
5. Acompanhar o workflow de Pages em Actions e a URL informada em Settings → Pages.
6. Abrir a URL real e confirmar carregamento de CSS/módulos, abas e fluxo completo.
   Verificar console/rede e uso dos caminhos relativos sob o caminho do repositório.
7. Testar persistência usando dados fictícios no domínio publicado. Localhost e
   Pages têm armazenamentos distintos: não esperar migração automática dos dados.
8. Registrar a URL efetiva e o commit validado no README. Não usar uma URL prevista
   como prova de que o site está publicado.

Esta aplicação não exige build ou instalação de pacotes para servir os arquivos.
Não foi criado workflow de deploy nesta etapa, nem adicionada configuração de domínio.

Fonte oficial consultada para o procedimento:
[Configuring a publishing source for your GitHub Pages site](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Tag e encerramento — ainda bloqueados nesta etapa

- [ ] Confirmar main final testada, Pages verificado e documentação/evidências completas.
- [ ] Verificar se v1.0 já existe para não sobrescrever uma tag de outra pessoa.
- [ ] Registrar o SHA exato da main validada e obter autorização para publicar a tag.
- [ ] Criar/publicar v1.0 nesse SHA somente na etapa final; depois conferir seu destino.
- [ ] Verificar todos os cards e vínculos de PR; concluir #7 apenas com entrega comprovada.

Não há comando de publicação executado nem declaração de release nesta etapa.
O campo version: 1.0.0 no package.json já existia e não representa uma tag publicada.
