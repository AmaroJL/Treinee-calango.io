/** Tela da #4. Regras injetadas do módulo da #3; sem regras ou armazenamento duplicados. */
export function inicializarTelaAgendar({
  listarServicos,
  validarDadosCliente,
  listarPorData,
  salvarRegistro,
  regras = null,
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
  let motor = regras;
  let selecionado = null;
  let enviando = false;
  const motorPronto = () => ['listarHorariosDisponiveis', 'hasConflito',
    'horaParaMinutos', 'ehDomingo'].every((nome) => typeof motor?.[nome] === 'function');
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
    <form novalidate class="agendar-formulario" aria-describedby="agendar-aviso-integracao">
      <fieldset class="agendar-etapa">
        <legend>1. Escolha o serviço</legend>
        <div class="agendar-servicos"></div>
      </fieldset>
      <div class="agendar-etapa">
        <label for="agendar-data">2. Escolha a data</label>
        <input id="agendar-data" name="data" type="date" required aria-describedby="agendar-data-erro">
        <p id="agendar-data-erro" class="agendar-erro" aria-live="polite"></p>
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

  const data = tela.querySelector('#agendar-data');
  const nome = tela.querySelector('#agendar-nome');
  const telefone = tela.querySelector('#agendar-telefone');
  const horarios = tela.querySelector('.agendar-horarios');
  const avisoHorarios = tela.querySelector('#agendar-horarios-mensagem');
  const feedback = tela.querySelector('.agendar-mensagem');
  const confirmar = tela.querySelector('.agendar-confirmar');
  const aviso = tela.querySelector('#agendar-aviso-integracao');
  const formulario = tela.querySelector('form');
  data.value = dataLocal;
  const servicoAtual = () => servicos.find((s) =>
    s.id === tela.querySelector('input[name="servicoId"]:checked')?.value);

  function informar(texto, erro = false) {
    feedback.textContent = texto;
    feedback.classList.toggle('agendar-erro', erro);
  }

  function erroCampo(campo, texto) {
    campo.setAttribute('aria-invalid', String(Boolean(texto)));
    tela.querySelector(`#${campo.id}-erro`).textContent = texto;
  }

  function validarCliente(moverFoco = true) {
    erroCampo(nome, '');
    erroCampo(telefone, '');
    const resultado = validarDadosCliente(nome.value, telefone.value);
    if (!resultado.valido) {
      // Apenas localiza o erro retornado: a validação pertence à #2.
      const campo = nome.value.trim() ? telefone : nome;
      erroCampo(campo, resultado.erro);
      if (moverFoco) campo.focus();
    }
    return resultado;
  }

  function atualizar() {
    horarios.replaceChildren();
    confirmar.disabled = enviando || !motorPronto();
    confirmar.textContent = motorPronto() ? 'Confirmar agendamento' : 'Confirmar agendamento (indisponível)';
    aviso.hidden = motorPronto();
    aviso.textContent = 'A consulta de horários e a confirmação aguardam a integração do motor da agenda (PR #12). Nenhum agendamento pode ser salvo sem essa dependência.';
    if (!motorPronto()) {
      selecionado = null;
      avisoHorarios.textContent = 'Horários indisponíveis: integração do motor da agenda pendente.';
      return;
    }
    const servico = servicoAtual();
    if (!data.value || !data.validity.valid || !servico) {
      selecionado = null;
      avisoHorarios.textContent = 'Selecione um serviço e uma data válida para consultar os horários.';
      return;
    }
    try {
      const livres = motor.listarHorariosDisponiveis(data.value, servico.duracao, listarPorData(data.value));
      if (!livres.includes(selecionado)) selecionado = null;
      avisoHorarios.textContent = motor.ehDomingo(data.value)
        ? 'O salão não abre aos domingos.'
        : livres.length ? 'Escolha um horário disponível.' : 'Não há horários disponíveis para este serviço nesta data.';
      for (const horario of livres) {
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.textContent = horario;
        botao.setAttribute('aria-pressed', String(horario === selecionado));
        botao.addEventListener('click', () => {
          selecionado = horario;
          for (const outro of horarios.querySelectorAll('button')) {
            outro.setAttribute('aria-pressed', String(outro === botao));
          }
          informar('');
        });
        horarios.append(botao);
      }
    } catch {
      selecionado = null;
      confirmar.disabled = true;
      avisoHorarios.textContent = 'Não foi possível consultar os horários. Tente novamente ao reabrir a aba.';
    }
  }

  formulario.addEventListener('change', (evento) => {
    if (evento.target === data || evento.target.name === 'servicoId') {
      erroCampo(data, '');
      informar('');
      atualizar();
    }
  });
  for (const campo of [nome, telefone]) {
    campo.addEventListener('blur', () => validarCliente(false));
    campo.addEventListener('input', () => erroCampo(campo, ''));
  }
  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    if (enviando) return;
    informar('');
    const cliente = validarCliente();
    if (!cliente.valido) return;
    if (!motorPronto()) {
      informar('Confirmação indisponível enquanto o motor da agenda não estiver integrado.', true);
      return;
    }
    const servico = servicoAtual();
    if (!data.value || !data.validity.valid) {
      erroCampo(data, 'Selecione uma data válida.');
      data.focus();
      return;
    }
    if (!servico || !selecionado) {
      informar('Selecione um serviço e um horário disponível.', true);
      return;
    }
    enviando = true;
    confirmar.disabled = true;
    let salvo = false;
    try {
      // Releitura obrigatória: os dados podem ter mudado desde a seleção.
      const marcados = listarPorData(data.value);
      const livres = motor.listarHorariosDisponiveis(data.value, servico.duracao, marcados);
      const inicio = motor.horaParaMinutos(selecionado);
      if (!livres.includes(selecionado) || motor.hasConflito({ inicio, duracao: servico.duracao }, marcados)) {
        selecionado = null;
        informar('Este horário não está mais disponível. Escolha outro horário.', true);
        return;
      }
      salvarRegistro({
        tipo: 'agendamento', data: data.value, inicio, duracao: servico.duracao,
        servicoId: servico.id, servicoNome: servico.nome, preco: servico.preco,
        clienteNome: cliente.nome, clienteTelefone: cliente.telefone
      });
      salvo = true;
      selecionado = null;
      informar('Agendamento confirmado e salvo com sucesso.');
    } catch {
      informar('Não foi possível salvar o agendamento. Tente novamente.', true);
    } finally {
      enviando = false;
      atualizar();
      if (salvo) container.dispatchEvent(new CustomEvent('agenda:alterada', { bubbles: true }));
    }
  });

  container.querySelector('.placeholder-aviso')?.remove();
  container.append(tela);
  atualizar();
  return {
    atualizar,
    definirRegras(novasRegras) { motor = novasRegras; atualizar(); }
  };
}
