import { inicializarTelaAgendar } from './ui/telaAgendar.js';
import { listarServicos } from './regras/servicos.js';
import { validarDadosCliente } from './regras/validacao.js';
import { listarPorData, salvarRegistro } from './storage/repositorio.js';

 // Gerencia a alternância de abas na interface de página única
function configurarNavegacaoAbas(aoTrocarAba) {
  const botoesAba = document.querySelectorAll('.btn-aba');
  const secoes = document.querySelectorAll('.secao-conteudo');

  botoesAba.forEach((botao) => {
    botao.addEventListener('click', () => {
      const idAlvo = botao.dataset.alvo;
      const secaoDesejada = document.getElementById(idAlvo);

      if (!secaoDesejada) return;

      // Remove a classe ativa de todos os botões e seções
      botoesAba.forEach((b) => b.classList.remove('ativo'));
      secoes.forEach((s) => s.classList.remove('ativa'));

      // Ativa o botão clicado e a seção correspondente
      botao.classList.add('ativo');
      secaoDesejada.classList.add('ativa');

      if (typeof aoTrocarAba === 'function') {
        aoTrocarAba(idAlvo);
      }
    });
  });
}

// Inicializa os módulos principais quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  const telaAgendar = inicializarTelaAgendar({
    listarServicos, validarDadosCliente, listarPorData, salvarRegistro
  });
  // Ausência ou falha do PR #12 mantém a confirmação bloqueada.
  import('./regras/agenda.js')
    .then((regras) => telaAgendar.definirRegras(regras))
    .catch(() => telaAgendar.definirRegras(null));
  document.addEventListener('aba:alterada', (evento) => {
    if (evento.detail.abaAtivaId === 'secao-agendar') telaAgendar.atualizar();
  });
  window.addEventListener('storage', () => telaAgendar.atualizar());
  configurarNavegacaoAbas((abaAtivaId) => {
    document.dispatchEvent(
      new CustomEvent('aba:alterada', { detail: { abaAtivaId } })
    );
  });
});