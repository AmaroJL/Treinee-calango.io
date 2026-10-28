
 // Valida se o nome e o telefone da cliente foram preenchidos corretamente
export function validarDadosCliente(nome, telefone) {
  const nomeLimpo = typeof nome === 'string' ? nome.trim() : '';
  const telefoneLimpo = typeof telefone === 'string' ? telefone.trim() : '';

  if (!nomeLimpo) {
    return {
      valido: false,
      erro: 'Por favor, informe o seu nome para realizar o agendamento.'
    };
  }

  // Extrai apenas números para garantir que o telefone possui dígitos suficientes
  const apenasDigitos = telefoneLimpo.replace(/\D/g, '');
  if (!telefoneLimpo || apenasDigitos.length < 8) {
    return {
      valido: false,
      erro: 'Por favor, informe um telefone válido (mínimo de 8 dígitos).'
    };
  }

  return {
    valido: true,
    erro: null,
    nome: nomeLimpo,
    telefone: telefoneLimpo
  };
}