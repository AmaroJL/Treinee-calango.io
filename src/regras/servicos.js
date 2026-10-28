export const SERVICOS = [
  { id: 'corte', nome: 'Corte', duracao: 60, preco: 50 },
  { id: 'escova', nome: 'Escova', duracao: 30, preco: 35 },
  { id: 'manicure', nome: 'Manicure', duracao: 30, preco: 25 },
  { id: 'coloracao', nome: 'Coloração', duracao: 90, preco: 120 }
];

export function listarServicos() {
  return [...SERVICOS];
}

export function buscarServicoPorId(id) {
  return SERVICOS.find((servico) => servico.id === id) || null;
}