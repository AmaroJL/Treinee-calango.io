/**
 * Apresentação parcial da issue #5, sem cancelamento ou persistência.
 * Recebe listarPorData da #2 e ordenarPorHorario/minutosParaHora da #3.
 * O preview fornece dependências demonstrativas separadas deste módulo.
 * A integração poderá chamar atualizar() ao reabrir a aba do painel.
 */
export function inicializarTelaPainelRita({
  listarPorData,
  ordenarPorHorario,
  minutosParaHora,
  container = document.getElementById('secao-painel')
} = {}) {
  if (!container) throw new Error('A seção Painel da Rita não foi encontrada.');
  for (const [nome, funcao] of Object.entries({ listarPorData, ordenarPorHorario, minutosParaHora })) {
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
    <ul class="painel-lista" aria-label="Agendamentos do dia"
      aria-describedby="painel-aviso-integracao"></ul>
  `;

  const data = tela.querySelector('#painel-data');
  const lista = tela.querySelector('.painel-lista');
  const mensagem = tela.querySelector('.painel-mensagem');
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
    horario.textContent = `${minutosParaHora(registro.inicio)} – ${minutosParaHora(registro.inicio + registro.duracao)}`;
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
    cancelar.textContent = 'Cancelar (indisponível)';
    cancelar.disabled = true;
    cancelar.setAttribute('aria-describedby', 'painel-aviso-integracao');
    cancelar.setAttribute('aria-label', `Cancelar atendimento de ${registro.clienteNome} (indisponível)`);
    item.append(cabecalho, detalhes, cancelar);
    return item;
  }

  function atualizar() {
    lista.replaceChildren();
    mensagem.classList.remove('painel-mensagem-erro');
    data.removeAttribute('aria-invalid');
    if (!data.value || !data.validity.valid) {
      data.setAttribute('aria-invalid', 'true');
      mensagem.textContent = 'Selecione uma data válida para consultar a agenda.';
      return;
    }

    try {
      // A consulta e a ordenação pertencem às dependências, não à interface.
      const registros = listarPorData(data.value);
      const agendamentos = ordenarPorHorario(
        registros.filter((registro) => registro.tipo === 'agendamento')
      );
      const itens = agendamentos.map(criarItem);
      lista.append(...itens);
      mensagem.textContent = itens.length === 0
        ? 'Nenhum agendamento encontrado para a data selecionada.'
        : `${itens.length} ${itens.length === 1 ? 'agendamento listado' : 'agendamentos listados'} para a data selecionada.`;
    } catch {
      lista.replaceChildren();
      mensagem.classList.add('painel-mensagem-erro');
      mensagem.textContent = 'Não foi possível carregar a agenda. Tente selecionar a data novamente.';
    }
  }

  data.addEventListener('change', atualizar);
  container.querySelector('.placeholder-aviso')?.remove();
  container.append(tela);
  atualizar();

  return { atualizar };
}
