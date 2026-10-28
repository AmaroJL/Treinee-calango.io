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
  const [horas, mins] = horaStr.split(':').map(Number);
  return horas * 60 + mins;
}

export function ehDomingo(dataISO) {
  if (!dataISO) return false;
  const [ano, mes, dia] = dataISO.split('-').map(Number);
  const data = new Date(ano, mes - 1, dia);
  return data.getDay() === 0;
}


// Verifica sobreposição de intervalos: [novoInicio, novoFim) vs [itemInicio, itemFim)
export function hasConflito(novo, marcados = []) {
  const novoInicio = novo.inicio;
  const novoFim = novo.inicio + novo.duracao;

  return marcados.some((item) => {
    if (item.status === 'cancelado') return false;
    const itemInicio = item.inicio;
    const itemFim = item.inicio + item.duracao;
    return novoInicio < itemFim && novoFim > itemInicio;
  });
}

export function horarioDentroDoExpediente(inicio, duracao) {
  const fim = inicio + duracao;
  if (inicio < EXPEDIENTE_INICIO || fim > EXPEDIENTE_FIM) {
    return false;
  }
  const invadeAlmoco = inicio < ALMOCO_FIM && fim > ALMOCO_INICIO;
  return !invadeAlmoco;
}


// Retorna os horários de início disponíveis no formato 'HH:MM' para a duração solicitada.
export function listarHorariosDisponiveis(dataISO, duracaoServico, agendamentosDoDia = []) {
  if (ehDomingo(dataISO)) {
    return [];
  }

  const horariosLivres = [];
  for (let inicio = EXPEDIENTE_INICIO; inicio < EXPEDIENTE_FIM; inicio += INTERVALO_SLOT) {
    const cabeNoExpediente = horarioDentroDoExpediente(inicio, duracaoServico);
    const conflita = hasConflito({ inicio, duracao: duracaoServico }, agendamentosDoDia);

    if (cabeNoExpediente && !conflita) {
      horariosLivres.push(minutosParaHora(inicio));
    }
  }

  return horariosLivres;
}

export function ordenarPorHorario(agendamentos = []) {
  return [...agendamentos].sort((a, b) => a.inicio - b.inicio);
}