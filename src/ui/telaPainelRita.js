/** Painel da #5: consulta/cancelamento pela #2; ordenação e horários pela #3. */
export function inicializarTelaPainelRita({
  listarPorData,
  cancelarRegistro,
  confirmarCancelamento = (texto) => window.confirm(texto),
  ordenarPorHorario,
  minutosParaHora,
  container = document.getElementById('secao-painel')
} = {}) {
  if (!container) throw new Error('A seção Painel da Rita não foi encontrada.');
  for (const [nome, funcao] of Object.entries({ listarPorData })) {
    if (typeof funcao !== 'function') throw new TypeError(`Informe a função ${nome}.`);
  }
  if (container.querySelector('.tela-painel-rita')) {
    throw new Error('O Painel da Rita já foi inicializado nesta seção.');
  }

  const tela = document.createElement('div');
  tela.className = 'tela-painel-rita';
  tela.innerHTML = `
    <p class="painel-aviso" id="painel-aviso-integracao">
      Interface em preparação. O cancelamento está indisponível e nenhum
      horário será liberado por esta tela enquanto a integração estiver pendente.
    </p>
    <div class="painel-filtro">
      <label for="painel-data">Data da agenda</label>
      <input id="painel-data" type="date" name="dataAgenda"
        aria-describedby="painel-data-ajuda">
      <p id="painel-data-ajuda">Selecione uma data para consultar os atendimentos.</p>
    </div>
    <p class="painel-mensagem" role="status" aria-live="polite" aria-atomic="true"></p>
    <p class="painel-feedback" role="status" aria-live="polite" aria-atomic="true" tabindex="-1"></p>
    <ul class="painel-lista" aria-label="Agendamentos do dia"
      aria-describedby="painel-aviso-integracao"></ul>
  `;

  const data = tela.querySelector('#painel-data');
  const lista = tela.querySelector('.painel-lista');
  const mensagem = tela.querySelector('.painel-mensagem');
  const feedback = tela.querySelector('.painel-feedback');
  const aviso = tela.querySelector('#painel-aviso-integracao');
  const cancelando = new Set();
  const temMotor = () => typeof ordenarPorHorario === 'function' && typeof minutosParaHora === 'function';
  const podeCancelar = () => typeof cancelarRegistro === 'function';

  function informar(texto, erro = false) {
    feedback.textContent = texto;
    feedback.classList.toggle('painel-mensagem-erro', erro);
  }
  const hoje = new Date();
  data.value = [
    hoje.getFullYear(),
    String(hoje.getMonth() + 1).padStart(2, '0'),
    String(hoje.getDate()).padStart(2, '0')
  ].join('-');

  function criarItem(registro) {
    const item = document.createElement('li');
    item.className = 'painel-agendamento';

    const cabecalho = document.createElement('div');
    cabecalho.className = 'painel-agendamento-cabecalho';
    const horario = document.createElement('p');
    horario.className = 'painel-horario';
    horario.textContent = temMotor()
      ? `${minutosParaHora(registro.inicio)} – ${minutosParaHora(registro.inicio + registro.duracao)}`
      : 'Início e término: aguardando integração dos horários';
    const servico = document.createElement('h3');
    servico.textContent = registro.servicoNome;
    cabecalho.append(horario, servico);

    const detalhes = document.createElement('dl');
    detalhes.className = 'painel-cliente';
    for (const [rotulo, valor] of [
      ['Cliente', registro.clienteNome],
      ['Telefone', registro.clienteTelefone],
      ['Status', registro.status === 'concluido' ? 'Concluído' : registro.status]
    ]) {
      const grupo = document.createElement('div');
      const termo = document.createElement('dt');
      termo.textContent = rotulo;
      const descricao = document.createElement('dd');
      descricao.textContent = valor || 'Não informado';
      grupo.append(termo, descricao);
      detalhes.append(grupo);
    }

    const cancelar = document.createElement('button');
    cancelar.type = 'button';
    cancelar.className = 'painel-cancelar';
    const ativo = registro.status === 'ativo';
    cancelar.textContent = ativo && podeCancelar() ? 'Cancelar' : 'Cancelar (indisponível)';
    cancelar.disabled = !ativo || !podeCancelar();
    cancelar.setAttribute('aria-describedby', 'painel-aviso-integracao');
    cancelar.setAttribute('aria-label', `Cancelar atendimento de ${registro.clienteNome}`);
    let removido = false;
    cancelar.addEventListener('click', () => {
      if (removido || cancelando.has(registro.id) || cancelar.disabled) return;
      cancelando.add(registro.id);
      cancelar.disabled = true;
      informar('');
      try {
        if (!confirmarCancelamento(`Cancelar o atendimento de ${registro.clienteNome}, ${registro.servicoNome}, na data ${registro.data}?`)) return;
        // Releitura evita atuar sobre um item que já mudou desde a renderização.
        const atual = listarPorData(registro.data).find((item) => item.id === registro.id);
        if (!atual || atual.status !== 'ativo') {
          atualizar();
          informar('Este atendimento já foi alterado. A agenda foi atualizada.', true);
          return;
        }
        cancelarRegistro(registro.id);
        removido = true;
        const atualizou = atualizar();
        informar(atualizou
          ? 'Agendamento cancelado. A lista foi atualizada.'
          : 'Agendamento cancelado, mas não foi possível atualizar a lista. Reabra o painel.', !atualizou);
        container.dispatchEvent(new CustomEvent('agenda:alterada', {
          bubbles: true, detail: { data: registro.data, id: registro.id }
        }));
        feedback.focus();
      } catch {
        informar('Não foi possível cancelar o agendamento. Tente novamente.', true);
      } finally {
        cancelando.delete(registro.id);
        cancelar.disabled = removido || !ativo || !podeCancelar();
      }
    });
    item.append(cabecalho, detalhes, cancelar);
    return item;
  }

  function atualizar() {
    lista.replaceChildren();
    aviso.hidden = temMotor() && podeCancelar();
    aviso.textContent = !temMotor()
      ? 'A ordem cronológica e a exibição dos horários aguardam a integração da agenda (PR #12). A lista está na ordem fornecida pelo armazenamento.'
      : 'O cancelamento está indisponível nesta visualização.';
    mensagem.classList.remove('painel-mensagem-erro');
    data.removeAttribute('aria-invalid');
    if (!data.value || !data.validity.valid) {
      data.setAttribute('aria-invalid', 'true');
      mensagem.textContent = 'Selecione uma data válida para consultar a agenda.';
      return false;
    }

    try {
      // A consulta e a ordenação pertencem às dependências, não à interface.
      const registros = listarPorData(data.value);
      const atendimentos = registros.filter((registro) => registro.tipo === 'agendamento');
      const agendamentos = temMotor() ? ordenarPorHorario(atendimentos) : atendimentos;
      const itens = agendamentos.map(criarItem);
      lista.append(...itens);
      mensagem.textContent = itens.length === 0
        ? 'Nenhum agendamento encontrado para a data selecionada.'
        : `${itens.length} ${itens.length === 1 ? 'agendamento listado' : 'agendamentos listados'} para a data selecionada.`;
      return true;
    } catch {
      lista.replaceChildren();
      mensagem.classList.add('painel-mensagem-erro');
      mensagem.textContent = 'Não foi possível carregar a agenda. Tente selecionar a data novamente.';
      return false;
    }
  }

  data.addEventListener('change', () => { informar(''); atualizar(); });
  container.querySelector('.placeholder-aviso')?.remove();
  container.append(tela);
  atualizar();

  return {
    atualizar,
    definirRegras(regras) {
      ordenarPorHorario = regras?.ordenarPorHorario;
      minutosParaHora = regras?.minutosParaHora;
      atualizar();
    }
  };
}
