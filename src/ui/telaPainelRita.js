/** Painel da #5 e #6: consulta/cancelamento/conclusão/bloqueio com storage e regras puras. */
export function inicializarTelaPainelRita({
  listarPorData,
  salvarRegistro,
  cancelarRegistro,
  concluirRegistro,
  confirmarCancelamento = (texto) => window.confirm(texto),
  ordenarPorHorario,
  minutosParaHora,
  horaParaMinutos,
  hasConflito,
  container = document.getElementById('secao-painel')
} = {}) {
  if (!container) throw new Error('A seção Painel da Rita não foi encontrada.');
  for (const [nome, funcao] of Object.entries({ listarPorData })) {
    if (typeof funcao !== 'function') throw new TypeError(`Informe a função ${nome}.`);
  }
  if (container.querySelector('.tela-painel-rita')) {
    throw new Error('O Painel da Rita já foi inicializado nesta seção.');
  }

  function formatarMinutos(min) {
    if (typeof minutosParaHora === 'function') return minutosParaHora(min);
    const h = String(Math.floor(min / 60)).padStart(2, '0');
    const m = String(min % 60).padStart(2, '0');
    return `${h}:${m}`;
  }

  function converterHora(str) {
    if (typeof horaParaMinutos === 'function') return horaParaMinutos(str);
    if (typeof str !== 'string') return 0;
    const [h, m] = str.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  }

  function formatarDataBr(dataISO) {
    if (!dataISO) return '';
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
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

    <!-- RF07: Formulário de Bloqueio de Horário -->
    <section class="painel-bloqueio-secao">
      <h3 class="painel-subtitulo">Bloquear Horário (Compromisso da Rita)</h3>
      <form class="painel-bloqueio-form" novalidate aria-label="Bloquear horário da Rita">
        <div class="painel-bloqueio-grid">
          <div class="painel-campo">
            <label for="bloqueio-inicio">Início</label>
            <select id="bloqueio-inicio" name="inicio" required></select>
          </div>
          <div class="painel-campo">
            <label for="bloqueio-duracao">Duração</label>
            <select id="bloqueio-duracao" name="duracao" required>
              <option value="30">30 min</option>
              <option value="60" selected>1 hora (60 min)</option>
              <option value="90">1h30 (90 min)</option>
              <option value="120">2 horas (120 min)</option>
            </select>
          </div>
          <div class="painel-campo painel-campo-motivo">
            <label for="bloqueio-motivo">Motivo (opcional)</label>
            <input id="bloqueio-motivo" name="motivo" type="text" placeholder="Ex: Médico, Compromisso pessoal">
          </div>
          <div class="painel-campo painel-campo-submit">
            <button type="submit" class="painel-bloquear-btn">Bloquear horário</button>
          </div>
        </div>
        <p class="painel-bloqueio-feedback" role="status" aria-live="polite"></p>
      </form>
    </section>

    <!-- RF07: Horários Bloqueados no Dia -->
    <section class="painel-bloqueios-secao">
      <h3 class="painel-subtitulo">Horários Bloqueados no Dia</h3>
      <p class="painel-bloqueios-vazio" role="status" aria-live="polite">Nenhum horário bloqueado para esta data.</p>
      <ul class="painel-bloqueios-lista" aria-label="Horários bloqueados"></ul>
    </section>

    <h3 class="painel-subtitulo">Atendimentos Agendados</h3>
    <p class="painel-mensagem" role="status" aria-live="polite" aria-atomic="true"></p>
    <p class="painel-feedback" role="status" aria-live="polite" aria-atomic="true" tabindex="-1"></p>
    <ul class="painel-lista" aria-label="Agendamentos do dia"
      aria-describedby="painel-aviso-integracao"></ul>
  `;

  const data = tela.querySelector('#painel-data');
  const lista = tela.querySelector('.painel-lista');
  const listaBloqueios = tela.querySelector('.painel-bloqueios-lista');
  const avisoBloqueiosVazio = tela.querySelector('.painel-bloqueios-vazio');
  const mensagem = tela.querySelector('.painel-mensagem');
  const feedback = tela.querySelector('.painel-feedback');
  const aviso = tela.querySelector('#painel-aviso-integracao');
  const formBloqueio = tela.querySelector('.painel-bloqueio-form');
  const selectInicio = tela.querySelector('#bloqueio-inicio');
  const selectDuracao = tela.querySelector('#bloqueio-duracao');
  const inputMotivo = tela.querySelector('#bloqueio-motivo');
  const feedbackBloqueio = tela.querySelector('.painel-bloqueio-feedback');

  // Popula os horários no select de bloqueio (das 09:00 às 17:30)
  if (selectInicio) {
    for (let min = 540; min <= 1050; min += 30) {
      const opt = document.createElement('option');
      opt.value = String(min);
      opt.textContent = formatarMinutos(min);
      selectInicio.append(opt);
    }
  }

  const cancelando = new Set();
  const temMotor = () => typeof ordenarPorHorario === 'function' && typeof minutosParaHora === 'function';
  const podeCancelar = () => typeof cancelarRegistro === 'function';
  const podeSalvar = () => typeof salvarRegistro === 'function';
  const podeConcluir = () => typeof concluirRegistro === 'function';

  function informar(texto, erro = false) {
    feedback.textContent = texto;
    feedback.classList.toggle('painel-mensagem-erro', erro);
  }

  function informarBloqueio(texto, erro = false) {
    if (!feedbackBloqueio) return;
    feedbackBloqueio.textContent = texto;
    feedbackBloqueio.classList.toggle('painel-mensagem-erro', erro);
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
    if (registro.status === 'concluido') {
      item.classList.add('painel-item-concluido');
    }

    const cabecalho = document.createElement('div');
    cabecalho.className = 'painel-agendamento-cabecalho';
    const horario = document.createElement('p');
    horario.className = 'painel-horario';
    horario.textContent = temMotor()
      ? `${formatarMinutos(registro.inicio)} – ${formatarMinutos(registro.inicio + registro.duracao)}`
      : 'Início e término: aguardando integração dos horários';
    const servico = document.createElement('h3');
    servico.textContent = registro.servicoNome;
    cabecalho.append(horario, servico);

    const detalhes = document.createElement('dl');
    detalhes.className = 'painel-cliente';
    const statusTexto = registro.status === 'concluido' ? 'Concluído' : registro.status;
    for (const [rotulo, valor] of [
      ['Cliente', registro.clienteNome],
      ['Telefone', registro.clienteTelefone],
      ['Status', statusTexto]
    ]) {
      const grupo = document.createElement('div');
      const termo = document.createElement('dt');
      termo.textContent = rotulo;
      const descricao = document.createElement('dd');
      descricao.textContent = valor || 'Não informado';
      if (rotulo === 'Status' && registro.status === 'concluido') {
        descricao.classList.add('badge-concluido');
      }
      grupo.append(termo, descricao);
      detalhes.append(grupo);
    }

    const acoes = document.createElement('div');
    acoes.className = 'painel-acoes';

    const ativo = registro.status === 'ativo';

    // RF08: Botão Marcar Atendimento como Concluído
    const btnConcluir = document.createElement('button');
    btnConcluir.type = 'button';
    btnConcluir.className = 'painel-concluir';
    if (registro.status === 'concluido') {
      btnConcluir.textContent = 'Concluído';
      btnConcluir.disabled = true;
      btnConcluir.classList.add('btn-concluido-desabilitado');
    } else {
      btnConcluir.textContent = podeConcluir() ? 'Concluir' : 'Concluir (indisponível)';
      btnConcluir.disabled = !ativo || !podeConcluir();
      btnConcluir.setAttribute('aria-label', `Marcar atendimento de ${registro.clienteNome} como concluído`);
      btnConcluir.addEventListener('click', () => {
        if (!podeConcluir() || !ativo || btnConcluir.disabled) return;
        informar('');
        try {
          concluirRegistro(registro.id);
          atualizar();
          informar(`Atendimento de ${registro.clienteNome} concluído com sucesso.`);
          container.dispatchEvent(new CustomEvent('agenda:alterada', {
            bubbles: true, detail: { data: registro.data, id: registro.id, acao: 'concluido' }
          }));
          feedback.focus();
        } catch {
          informar('Não foi possível marcar o atendimento como concluído. Tente novamente.', true);
        }
      });
    }
    acoes.append(btnConcluir);

    // Diferencial: Botão Lembrar no WhatsApp
    const digitosTelefone = (registro.clienteTelefone || '').replace(/\D/g, '');
    if (digitosTelefone.length >= 8 && ativo) {
      const ddiTelefone = digitosTelefone.startsWith('55') ? digitosTelefone : `55${digitosTelefone}`;
      const msgTexto = `Olá, ${registro.clienteNome}! Passando para lembrar do seu atendimento no Studio Rita: ${registro.servicoNome} no dia ${formatarDataBr(registro.data)} às ${formatarMinutos(registro.inicio)}. Estamos te esperando!`;
      const linkWhatsApp = document.createElement('a');
      linkWhatsApp.className = 'painel-whatsapp';
      linkWhatsApp.href = `https://wa.me/${ddiTelefone}?text=${encodeURIComponent(msgTexto)}`;
      linkWhatsApp.target = '_blank';
      linkWhatsApp.rel = 'noopener noreferrer';
      linkWhatsApp.textContent = 'Lembrar no WhatsApp';
      linkWhatsApp.setAttribute('aria-label', `Lembrar ${registro.clienteNome} no WhatsApp`);
      acoes.append(linkWhatsApp);
    }

    // RF06: Botão Cancelar
    const cancelar = document.createElement('button');
    cancelar.type = 'button';
    cancelar.className = 'painel-cancelar';
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
          const atualizou = atualizar();
          informar(atualizou
            ? 'Este atendimento já foi alterado. A agenda foi atualizada.'
            : 'Este atendimento já foi alterado. Não foi possível atualizar a agenda.', true);
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
    acoes.append(cancelar);

    item.append(cabecalho, detalhes, acoes);
    return item;
  }

  function criarItemBloqueio(bloqueio) {
    const item = document.createElement('li');
    item.className = 'painel-bloqueio-item';

    const cabecalho = document.createElement('div');
    cabecalho.className = 'painel-bloqueio-item-info';
    const horario = document.createElement('strong');
    horario.className = 'painel-bloqueio-horario';
    horario.textContent = `${formatarMinutos(bloqueio.inicio)} – ${formatarMinutos(bloqueio.inicio + bloqueio.duracao)}`;
    const motivo = document.createElement('span');
    motivo.className = 'painel-bloqueio-motivo';
    motivo.textContent = bloqueio.servicoNome || bloqueio.motivo || 'Bloqueio de horário';
    cabecalho.append(horario, motivo);

    const btnDesbloquear = document.createElement('button');
    btnDesbloquear.type = 'button';
    btnDesbloquear.className = 'painel-desbloquear';
    btnDesbloquear.textContent = podeCancelar() ? 'Desbloquear' : 'Desbloquear (indisponível)';
    btnDesbloquear.disabled = !podeCancelar();
    btnDesbloquear.setAttribute('aria-label', `Remover bloqueio das ${formatarMinutos(bloqueio.inicio)}`);

    btnDesbloquear.addEventListener('click', () => {
      if (!podeCancelar()) return;
      informar('');
      try {
        cancelarRegistro(bloqueio.id);
        atualizar();
        informar('Horário desbloqueado com sucesso. A grade foi liberada.');
        container.dispatchEvent(new CustomEvent('agenda:alterada', {
          bubbles: true, detail: { data: bloqueio.data, id: bloqueio.id }
        }));
      } catch {
        informar('Não foi possível desbloquear o horário. Tente novamente.', true);
      }
    });

    item.append(cabecalho, btnDesbloquear);
    return item;
  }

  // RF07: Submissão do formulário de Bloqueio de Horário
  if (formBloqueio) {
    formBloqueio.addEventListener('submit', (evento) => {
      evento.preventDefault();
      informarBloqueio('');

      if (!podeSalvar()) {
        informarBloqueio('Não é possível salvar bloqueios nesta visualização.', true);
        return;
      }

      if (!data.value || !data.validity.valid) {
        informarBloqueio('Selecione uma data válida no campo principal.', true);
        data.focus();
        return;
      }

      const inicio = Number(selectInicio.value);
      const duracao = Number(selectDuracao.value);
      const motivo = (inputMotivo.value || '').trim() || 'Bloqueio de horário';

      if (isNaN(inicio) || isNaN(duracao) || duracao <= 0) {
        informarBloqueio('Selecione um horário inicial e duração válidos.', true);
        return;
      }

      const fim = inicio + duracao;
      if (fim > 1080) { // Limite do expediente: 18:00 (1080 min)
        informarBloqueio('O bloqueio ultrapassa o fim do expediente (18:00). Escolha um horário ou duração menor.', true);
        return;
      }

      // Validação de colisão com agendamentos ou bloqueios existentes
      const registrosDoDia = listarPorData(data.value);
      const conflita = typeof hasConflito === 'function'
        ? hasConflito({ inicio, duracao }, registrosDoDia)
        : registrosDoDia.some((r) => {
            const rFim = Number(r.inicio) + Number(r.duracao);
            return inicio < rFim && fim > Number(r.inicio);
          });

      if (conflita) {
        informarBloqueio('Já existe um atendimento ou bloqueio no intervalo selecionado.', true);
        return;
      }

      try {
        salvarRegistro({
          tipo: 'bloqueio',
          data: data.value,
          inicio,
          duracao,
          servicoNome: motivo,
          motivo,
          clienteNome: 'Rita (Bloqueio)',
          clienteTelefone: '',
          status: 'ativo'
        });

        inputMotivo.value = '';
        informarBloqueio('Horário bloqueado com sucesso.');
        atualizar();
        container.dispatchEvent(new CustomEvent('agenda:alterada', {
          bubbles: true, detail: { data: data.value }
        }));
      } catch {
        informarBloqueio('Não foi possível salvar o bloqueio de horário. Tente novamente.', true);
      }
    });
  }

  function atualizar() {
    lista.replaceChildren();
    if (listaBloqueios) listaBloqueios.replaceChildren();

    aviso.hidden = temMotor() && podeCancelar();
    aviso.textContent = aviso.hidden ? '' : !temMotor()
      ? 'A ordem cronológica e a exibição dos horários aguardam a integração da agenda (PR #12). A lista está na ordem fornecida pelo armazenamento.'
      : 'O cancelamento está indisponível nesta visualização.';
    mensagem.classList.remove('painel-mensagem-erro');
    data.removeAttribute('aria-invalid');
    if (!data.value || !data.validity.valid) {
      data.setAttribute('aria-invalid', 'true');
      mensagem.textContent = 'Selecione uma data válida para consultar a agenda.';
      if (avisoBloqueiosVazio) avisoBloqueiosVazio.hidden = false;
      return false;
    }

    try {
      const registros = listarPorData(data.value);

      // Separa atendimentos de clientes e bloqueios manuais
      const atendimentos = registros.filter((registro) => registro.tipo === 'agendamento');
      const bloqueios = registros.filter((registro) => registro.tipo === 'bloqueio');

      const agendamentosOrdenados = temMotor() ? ordenarPorHorario(atendimentos) : atendimentos;
      const itens = agendamentosOrdenados.map(criarItem);
      lista.append(...itens);
      mensagem.textContent = itens.length === 0
        ? 'Nenhum agendamento encontrado para a data selecionada.'
        : `${itens.length} ${itens.length === 1 ? 'agendamento listado' : 'agendamentos listados'} para a data selecionada.`;

      // Renderiza bloqueios
      if (listaBloqueios && avisoBloqueiosVazio) {
        const bloqueiosOrdenados = temMotor() ? ordenarPorHorario(bloqueios) : bloqueios;
        if (bloqueiosOrdenados.length === 0) {
          avisoBloqueiosVazio.hidden = false;
        } else {
          avisoBloqueiosVazio.hidden = true;
          const itensBloqueio = bloqueiosOrdenados.map(criarItemBloqueio);
          listaBloqueios.append(...itensBloqueio);
        }
      }

      return true;
    } catch {
      lista.replaceChildren();
      if (listaBloqueios) listaBloqueios.replaceChildren();
      mensagem.classList.add('painel-mensagem-erro');
      mensagem.textContent = 'Não foi possível carregar a agenda. Tente selecionar a data novamente.';
      return false;
    }
  }

  data.addEventListener('change', () => {
    informar('');
    informarBloqueio('');
    atualizar();
  });
  container.querySelector('.placeholder-aviso')?.remove();
  container.append(tela);
  atualizar();

  return {
    atualizar,
    definirRegras(regras) {
      ordenarPorHorario = regras?.ordenarPorHorario;
      minutosParaHora = regras?.minutosParaHora;
      horaParaMinutos = regras?.horaParaMinutos;
      hasConflito = regras?.hasConflito;
      atualizar();
    }
  };
}
