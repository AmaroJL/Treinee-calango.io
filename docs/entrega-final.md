# Entrega final — issue #7

## Base integrada

Main verificada: **87b16f04063357ba8bb474f4ef211b5b919eded7**.
PR #14 da #6 e PR #11 da #5 confirmados como merged. Issues #1–#6 fechadas.
#7 permanece aberta até documentação, Pages e tag. Código incorporado à branch
exclusivamente a partir da main, preservando commits e trabalho dos colegas.
Esta rodada altera documentação/evidências, não implementações da aplicação.
Os relatórios issue4/issue5/issue6 são históricos; esta é a verificação integrada.

## Verificações executadas em 28/10/2026 (BRT)

- [x] npm test: **37 aprovados, 0 reprovados**, Node v24.22.1 / npm 11.19.1.
- [x] Distribuição real: motor 10; Agendar 9; painel 11; diferenciais 6; navegação 1.
- [x] Navegador: serviços/data/horário, erros de nome/telefone, salvar, consultar
  três itens fora de ordem, cancelar e conferir liberação ao retornar a Agendar.
- [x] Bloquear 13h–14h, conferir 13h/13h30 indisponíveis para escova e desbloquear.
- [x] Concluir e recarregar: status mantido, cancelado ausente e outro atendimento ativo.
- [x] Link WhatsApp e texto abertos na página oficial; nenhuma mensagem enviada.
- [x] Painel em 390px sem transbordamento horizontal; viewport restaurado.
- [x] 15 JPEGs reais em docs/media, com índice, dimensões e condições da captura.
- [x] Sintaxe de todos os arquivos JavaScript de src/ e tests/ passou.

Links internos e git diff --check são conferidos antes do commit. A contagem 37 é
da execução real; não reutiliza a subdivisão 10/10 das telas no relatório histórico
da #6. Diagnóstico em memória reexecutou 6 testes dos diferenciais e reproduziu o
DDD 55 em um sétimo caso; não integra a contagem da suíte nem comprova correção.

## Limites encontrados

- WhatsApp: nacional de DDD 55 confundido com DDI já informado. Reproduzido:
  `55900000000` gera `wa.me/55900000000`, em vez de prefixar o DDI. Informar o DDI
  completo contorna a ambiguidade. Não foi alterado o código da #6 nesta #7.
- Horários passados hoje continuam ofertados pelo motor; ponto já registrado.
- Feedback antigo do bloqueio pode permanecer após desbloquear, mas listas e
  disponibilidade foram atualizadas corretamente. Detalhe de apresentação não alterado.
- Recuperação de storage corrompido, atomicidade entre abas e sincronização entre
  dispositivos não existem. Celular físico e leitor de tela não testados.
- Autoria original das decisões não comprovada pelo histórico. Responsáveis propostos
  para confirmação: Iago D03/D05; Amaro D01/D02/D04; data informada 27/10/2026.

## GitHub Pages — pendência obrigatória de permissão

A API informou `has_pages: false`, homepage nula e endpoint Pages retornando 404.
Conta conectada: push true, admin false, maintain false. Não há URL de produção
confirmada nem permissão suficiente para configurar nesta execução.

**Ação do Amaro ou de outro administrador/manutentor:**

1. Abrir [Settings → Pages](https://github.com/AmaroJL/Treinee-calango.io/settings/pages).
2. Build and deployment → Source: Deploy from a branch.
3. Selecionar **main** e **/(root)** e salvar; index.html está na raiz, não em docs.
4. Acompanhar Actions e copiar a URL efetiva de Settings → Pages.
5. Validar nessa URL CSS/módulos, abas, agendar/cancelar, bloquear/desbloquear e concluir.
6. Usar dados fictícios; localhost e Pages têm storages separados.
7. Atualizar README e este registro com URL, commit e resultado antes de encerrar #7.

A aplicação funcional já está na main, portanto o responsável pode habilitar Pages
antes do merge documental. README/evidências atualizados chegarão à main após o
merge do PR #13 pelo revisor. Não foi criado workflow ou configuração que publique
sem autorização.

Fonte: [documentação oficial do GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Kanban e PRs

| Issue | Responsável | PR integrado | Estado consultado |
|---|---|---|---|
| #1 | Amaro | #8 | Fechada |
| #2 | Amaro | #9 | Fechada |
| #3 | Amaro | #12 | Fechada |
| #4 | Iago | #10 | Fechada |
| #5 | Iago | #11 | Fechada |
| #6 | Amaro | #14 | Fechada |
| #7 | Iago | #13, não integrado nesta execução | Aberta |

Cards #1–#6 podem ser conferidos para Pronto, pois issues estão fechadas e PRs
integrados; a coluna não foi certificada. Projects falhou por falta de escopo
**read:project**. Não ampliei credenciais nem movi cards. Conferir quadro e vínculos
manualmente; #7 somente Pronto depois de documentação, deploy e tag comprovados.

## Tag v1.0 — preparada, NÃO executada

Consulta remota não encontrou v1.0. Não criada local/remotamente nesta execução.
O version 1.0.0 do package.json não representa uma release publicada.

**Somente após merge do PR #13, testes da main definitiva e autorização explícita:**

```sh
git status --short --branch
git fetch origin --tags
git ls-remote --tags origin refs/tags/v1.0 'refs/tags/v1.0^{}'
git checkout main
git pull --ff-only origin main
git log -1 --oneline
npm test
# Parar se a árvore estiver suja, a tag existir ou o SHA não for o validado.
# Apenas com autorização para publicar:
git tag v1.0
git push origin v1.0
```

Não sobrescrever tag existente. Registrar SHA de destino, data/hora e consulta remota
após publicar. Prazo original: 28/10/2026 às 23h59 BRT; esta preparação não comprova
entrega final concluída dentro do prazo.

## Passos restantes para encerrar #7

- [ ] Equipe confirmar os responsáveis propostos e a autoria dos cinco registros.
- [ ] Administrador habilitar Pages, validar URL real e registrá-la na documentação.
- [ ] Revisor aprovar/integrar PR #13; esta execução não faz merge.
- [ ] Validar main definitiva e publicar v1.0 com autorização do usuário.
- [ ] Conferir Kanban/vínculos manualmente e encerrar #7 apenas com provas da entrega.
