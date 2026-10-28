const CHAVE_STORAGE = 'studio_rita_agendamentos';

function gerarId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function obterTodosRegistros() {
  try {
    const dados = localStorage.getItem(CHAVE_STORAGE);
    if (!dados) {
      return [];
    }

    const parsed = JSON.parse(dados);

    // Garante que o retorno é estritamente um array para evitar quebras em .filter() ou .map()
    if (!Array.isArray(parsed)) {
      console.warn(`[Studio Rita Storage] Conteúdo inválido no localStorage para "${CHAVE_STORAGE}". Esperava-se um array.`);
      return [];
    }

    return parsed;
  } catch (erro) {
    console.warn(`[Studio Rita Storage] Erro ao interpretar JSON do localStorage:`, erro);
    return [];
  }
}

function salvarTodosRegistros(lista) {
  if (!Array.isArray(lista)) {
    console.warn(`[Studio Rita Storage] Tentativa de salvar dados que não são um array.`);
    return;
  }
  localStorage.setItem(CHAVE_STORAGE, JSON.stringify(lista));
}

export function listarPorData(dataISO) {
  return obterTodosRegistros().filter(
    (item) => item.data === dataISO && item.status !== 'cancelado'
  );
}


 // Salva um novo agendamento de cliente ou bloqueio manual da Rita
export function salvarRegistro(dados) {
  const todos = obterTodosRegistros();
  const novoRegistro = {
    id: gerarId(),
    tipo: dados.tipo || 'agendamento', // 'agendamento' | 'bloqueio'
    data: dados.data,                  // Formato 'YYYY-MM-DD'
    inicio: Number(dados.inicio),      // Minutos a partir da meia-noite (ex: 600 = 10:00)
    duracao: Number(dados.duracao),    // Duração em minutos (30, 60, 90)
    servicoId: dados.servicoId || null,
    servicoNome: dados.servicoNome || dados.motivo || 'Bloqueio de horário',
    preco: dados.preco ?? 0,
    clienteNome: dados.clienteNome || 'Horário Bloqueado',
    clienteTelefone: dados.clienteTelefone || '',
    status: 'ativo'                    // 'ativo' | 'concluido' | 'cancelado'
  };

  todos.push(novoRegistro);
  salvarTodosRegistros(todos);
  return novoRegistro;
}

export function cancelarRegistro(id) {
  const todos = obterTodosRegistros();
  const atualizados = todos.filter((item) => item.id !== id);
  salvarTodosRegistros(atualizados);
}

export function concluirRegistro(id) {
  const todos = obterTodosRegistros();
  const atualizados = todos.map((item) =>
    item.id === id ? { ...item, status: 'concluido' } : item
  );
  salvarTodosRegistros(atualizados);
}