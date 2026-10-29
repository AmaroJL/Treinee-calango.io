export const EXPEDIENTE_INICIO = 9 * 60;  // 09:00 (540 min)
export const EXPEDIENTE_FIM = 18 * 60;    // 18:00 (1080 min)
export const ALMOCO_INICIO = 12 * 60;     // 12:00 (720 min)
export const ALMOCO_FIM = 13 * 60;        // 13:00 (780 min)
export const INTERVALO_SLOT = 30;         // Slots de 30 min

export function minutosParaHora(minutos) {
  const horas = String(Math.floor(minutos / 60)).padStart(2, '0');
  const mins = String(minutos % 60).padStart(2, '0');
  return `${horas}:${mins}`;
}

export function horaParaMinutos(horaStr) {
  if (typeof horaStr !== 'string') return 0;
  const [horas, mins] = horaStr.split(':').map(Number);
  return (horas || 0) * 60 + (mins || 0);
}

export function ehDomingo(dataISO) {
  if (!dataISO) return false;
  const [ano, mes, dia] = dataISO.split('-').map(Number);
  const data = new Date(ano, mes - 1, dia);
  return data.getDay() === 0;
}

/**
 * Valida sobreposição de horários.
 * Suporta assinatura direta: hasConflito(novo, marcados)
 */
export function hasConflito(novo, marcados = []) {
  if (!novo || typeof novo.inicio !== 'number' || typeof novo.duracao !== 'number' || novo.duracao <= 0) {
    return false;
  }

  const novoInicio = novo.inicio;
  const novoFim = novo.inicio + novo.duracao;

  return marcados.some((item) => {
    if (!item || item.status === 'cancelado') return false;
    const itemInicio = Number(item.inicio);
    const itemDuracao = Number(item.duracao);
    if (isNaN(itemInicio) || isNaN(itemDuracao) || itemDuracao <= 0) return false;

    const itemFim = itemInicio + itemDuracao;
    return novoInicio < itemFim && novoFim > itemInicio;
  });
}

/**
 * Alias de compatibilidade com suporte flexível para:
 * temConflito(novo, marcados) OU temConflito(marcados, novo)
 */
export function temConflito(paramA, paramB) {
  if (Array.isArray(paramA)) {
    return hasConflito(paramB, paramA);
  }
  return hasConflito(paramA, paramB);
}

export function horarioDentroDoExpediente(inicio, duracao) {
  if (typeof inicio !== 'number' || typeof duracao !== 'number' || duracao <= 0) {
    return false;
  }
  const fim = inicio + duracao;
  if (inicio < EXPEDIENTE_INICIO || fim > EXPEDIENTE_FIM) {
    return false;
  }
  const invadeAlmoco = inicio < ALMOCO_FIM && fim > ALMOCO_INICIO;
  return !invadeAlmoco;
}

/**
 * Retorna os horários livres em formato 'HH:MM'.
 * Rejeita durações inválidas ou domingos.
 */
export function listarHorariosDisponiveis(dataISO, duracaoServico, agendamentosDoDia = []) {
  const duracao = Number(duracaoServico);
  if (isNaN(duracao) || duracao <= 0 || ehDomingo(dataISO)) {
    return [];
  }

  const horariosLivres = [];
  for (let inicio = EXPEDIENTE_INICIO; inicio < EXPEDIENTE_FIM; inicio += INTERVALO_SLOT) {
    const cabeNoExpediente = horarioDentroDoExpediente(inicio, duracao);
    const conflita = hasConflito({ inicio, duracao }, agendamentosDoDia);

    if (cabeNoExpediente && !conflita) {
      horariosLivres.push(minutosParaHora(inicio));
    }
  }

  return horariosLivres;
}

export function ordenarPorHorario(agendamentos = []) {
  if (!Array.isArray(agendamentos)) return [];
  return [...agendamentos].sort((a, b) => Number(a.inicio) - Number(b.inicio));
}