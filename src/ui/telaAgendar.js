/**
 * Apresentação da issue #4, ainda sem fluxo de agendamento.
 * Integração prevista em main.js:
 * inicializarTelaAgendar({ listarServicos });
 * listarServicos deve ser importada de ../regras/servicos.js pelo integrador.
 * Horários, validação e persistência aguardam integração das dependências.
 */
export function inicializarTelaAgendar({
  listarServicos,
  container = document.getElementById('secao-agendar')
} = {}) {
  if (!container) throw new Error('A seção Agendar não foi encontrada.');
  if (typeof listarServicos !== 'function') {
    throw new TypeError('Informe listarServicos do catálogo existente.');
  }
  if (container.querySelector('.tela-agendar')) {
    throw new Error('A tela Agendar já foi inicializada nesta seção.');
  }

  const servicos = listarServicos();
  const moeda = new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL'
  });
  const hoje = new Date();
  const dataLocal = [
    hoje.getFullYear(),
    String(hoje.getMonth() + 1).padStart(2, '0'),
    String(hoje.getDate()).padStart(2, '0')
  ].join('-');

  const tela = document.createElement('div');
  tela.className = 'tela-agendar';
  tela.innerHTML = `
    <p class="agendar-aviso" id="agendar-aviso-integracao">
      Interface em preparação. A consulta de horários e a confirmação
      ainda não estão disponíveis. Nenhum agendamento será salvo.
    </p>
    <form class="agendar-formulario" aria-describedby="agendar-aviso-integracao">
      <fieldset class="agendar-etapa">
        <legend>1. Escolha o serviço</legend>
        <div class="agendar-servicos"></div>
      </fieldset>
      <div class="agendar-etapa">
        <label for="agendar-data">2. Escolha a data</label>
        <input id="agendar-data" name="data" type="date">
      </div>
      <fieldset class="agendar-etapa" aria-describedby="agendar-horarios-mensagem">
        <legend>3. Escolha o horário</legend>
        <p id="agendar-horarios-mensagem" role="status" aria-live="polite" aria-atomic="true">
          A disponibilidade será exibida após a integração do motor de horários.
        </p>
        <div class="agendar-horarios" role="group" aria-label="Horários disponíveis"></div>
      </fieldset>
      <fieldset class="agendar-etapa">
        <legend>4. Informe seus dados</legend>
        <div class="agendar-dados">
          <div class="agendar-campo">
            <label for="agendar-nome">Nome</label>
            <input id="agendar-nome" name="nome" type="text" autocomplete="name"
              aria-describedby="agendar-nome-erro">
            <p id="agendar-nome-erro" class="agendar-erro" aria-live="polite"></p>
          </div>
          <div class="agendar-campo">
            <label for="agendar-telefone">Telefone</label>
            <input id="agendar-telefone" name="telefone" type="tel" autocomplete="tel"
              aria-describedby="agendar-telefone-erro">
            <p id="agendar-telefone-erro" class="agendar-erro" aria-live="polite"></p>
          </div>
        </div>
      </fieldset>
      <button class="agendar-confirmar" type="submit" disabled
        aria-describedby="agendar-aviso-integracao">Confirmar agendamento (indisponível)</button>
      <p class="agendar-mensagem" role="status" aria-live="polite" aria-atomic="true"></p>
    </form>
  `;

  const lista = tela.querySelector('.agendar-servicos');
  for (const servico of servicos) {
    const opcao = document.createElement('label');
    opcao.className = 'agendar-servico';
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'servicoId';
    input.value = servico.id;
    const detalhes = document.createElement('span');
    const nome = document.createElement('strong');
    nome.textContent = servico.nome;
    const descricao = document.createElement('span');
    descricao.className = 'agendar-servico-detalhes';
    descricao.textContent = `${servico.duracao} min · ${moeda.format(servico.preco)}`;
    detalhes.append(nome, descricao);
    opcao.append(input, detalhes);
    lista.append(opcao);
  }
  if (servicos.length === 0) {
    lista.textContent = 'Nenhum serviço foi disponibilizado pelo catálogo.';
  }

  tela.querySelector('#agendar-data').value = dataLocal;
  tela.querySelector('form').addEventListener('submit', (evento) => {
    evento.preventDefault();
    tela.querySelector('.agendar-mensagem').textContent =
      'A confirmação está indisponível. Nenhum agendamento foi salvo.';
  });

  // Mantém o título e os demais elementos do esqueleto da issue #1.
  container.querySelector('.placeholder-aviso')?.remove();
  container.append(tela);
}
