 // Gerencia a alternância de abas na interface de página única
function configurarNavegacaoAbas() {
  const botoesAba = document.querySelectorAll('.btn-aba');
  const secoes = document.querySelectorAll('.secao-conteudo');

  botoesAba.forEach((botao) => {
    botao.addEventListener('click', () => {
      const idAlvo = botao.dataset.alvo;

      // Remove a classe ativa de todos os botões e seções
      botoesAba.forEach((b) => b.classList.remove('ativo'));
      secoes.forEach((s) => s.classList.remove('ativa'));

      // Ativa o botão clicado e a seção correspondente
      botao.classList.add('ativo');
      const secaoDesejada = document.getElementById(idAlvo);
      if (secaoDesejada) {
        secaoDesejada.classList.add('ativa');
      }
    });
  });
}

// Inicializa os módulos principais quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  configurarNavegacaoAbas();
});