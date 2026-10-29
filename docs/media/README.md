# Evidências reais — Studio Rita

Capturadas em **28/10/2026 (BRT)** na aplicação integrada da main `87b16f0`,
servida por HTTP em `http://127.0.0.1:8002/index.html`.
Dados fictícios: Cliente Exemplo A/B/C, telefone de demonstração `85900000000`,
data de atendimento `2099-01-07`. Nenhum dado real de cliente foi usado.

São screenshots reais, sem montagem ou geração artificial. A ferramenta forneceu
JPEGs; a extensão .jpg corresponde ao formato verificado. Usada sequência estática
em vez de GIF. Dimensões abaixo verificadas no arquivo original, sem redimensionamento.
A última captura usa viewport de 390px; a página externa do WhatsApp tem largura própria.

| Arquivo | O que comprova | JPEG (px) |
|---|---|---|
| [01-agendar-inicial.jpg](01-agendar-inicial.jpg) | Tela inicial com serviços/valores | 1 × 1 |
| [02-servico-data-horario.jpg](02-servico-data-horario.jpg) | Corte, data e 14h selecionados | 1 × 1 |
| [03-erro-nome.jpg](03-erro-nome.jpg) | Nome vazio rejeitado | 1 × 1 |
| [04-erro-telefone.jpg](04-erro-telefone.jpg) | Telefone curto rejeitado | 1 × 1 |
| [05-agendamento-confirmado.jpg](05-agendamento-confirmado.jpg) | Agendamento de teste salvo | 1 × 1 |
| [06-painel-cronologico.jpg](06-painel-cronologico.jpg) | Ordem cronológica dos três atendimentos | 1 × 1 |
| [07-cancelamento.jpg](07-cancelamento.jpg) | Atendimento de 10h30 removido | 1 × 1 |
| [08-cancelamento-horario-livre.jpg](08-cancelamento-horario-livre.jpg) | 10h30/11h livres após cancelar | 1 × 1 |
| [09-bloqueio-criado.jpg](09-bloqueio-criado.jpg) | Bloqueio real de 13h–14h | 1 × 1 |
| [10-bloqueio-indisponivel.jpg](10-bloqueio-indisponivel.jpg) | 13h/13h30 ausentes para escova | 1 × 1 |
| [11-desbloqueio.jpg](11-desbloqueio.jpg) | Bloqueio removido no painel | 1 × 1 |
| [12-desbloqueio-horario-livre.jpg](12-desbloqueio-horario-livre.jpg) | 13h/13h30 novamente disponíveis | 1 × 1 |
| [13-concluido-apos-recarga.jpg](13-concluido-apos-recarga.jpg) | Concluído persistido após recarga | 1 × 1 |
| [14-whatsapp-mensagem-preenchida.jpg](14-whatsapp-mensagem-preenchida.jpg) | Página oficial com mensagem preenchida; sem envio | 1 × 1 |
| [15-painel-mobile.jpg](15-painel-mobile.jpg) | Painel em 390px sem transbordamento horizontal | 1 × 1 |

## Fluxo executado

1. Corte às 14h para C, 09h para A e 10h30 para B. Nome/telefone inválidos
   verificados antes da primeira gravação; painel confirmou ordem cronológica.
2. Cancelado B; retorno para Agendar com Escova confirmou liberação sem recarga.
3. Bloqueado 13h–14h; Escova deixou de oferecer 13h/13h30. Desbloqueio os restaurou.
4. A marcado Concluído. Após recarregar, status persistiu; B continuou removido,
   C permaneceu ativo e nenhum bloqueio ficou salvo.
5. Link de C aberto na página oficial do WhatsApp com mensagem preenchida;
   não houve login, envio ou verificação de que o número tenha conta.
6. Painel em 390px: clientWidth e scrollWidth iguais a 390; viewport restaurado.

Capturas não comprovam deploy em Pages. Falhas de armazenamento foram testadas
no Node, não provocadas no storage real do navegador. Celular físico e leitor de
tela não foram executados.
