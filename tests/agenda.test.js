import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  minutosParaHora,
  horaParaMinutos,
  ehDomingo,
  hasConflito,
  horarioDentroDoExpediente,
  listarHorariosDisponiveis,
  ordenarPorHorario
} from '../src/regras/agenda.js';

test('Conversão: formata minutos para HH:MM e converte HH:MM para minutos', () => {
  assert.equal(horaParaMinutos('09:00'), 540);
  assert.equal(horaParaMinutos('13:30'), 810);
  assert.equal(minutosParaHora(540), '09:00');
  assert.equal(minutosParaHora(1080), '18:00');
});

test('RF04: detecta colisão de intervalo quando há sobreposição', () => {
  const marcados = [{ inicio: 600, duracao: 60 }]; // 10:00 as 11:00
  const colideNoMeio = { inicio: 630, duracao: 30 }; // 10:30 as 11:00
  assert.equal(hasConflito(colideNoMeio, marcados), true);
});

test('RF04 (Borda): permite agendamento no instante exato de término do anterior', () => {
  const marcados = [{ inicio: 600, duracao: 60 }]; // 10:00 as 11:00
  const encostaApos = { inicio: 660, duracao: 30 }; // 11:00 as 11:30
  const encostaAntes = { inicio: 570, duracao: 30 }; // 09:30 as 10:00
  assert.equal(hasConflito(encostaApos, marcados), false);
  assert.equal(hasConflito(encostaAntes, marcados), false);
});

test('RF02: corte às 10:00 (60min) remove 10:00 e 10:30 da disponibilidade de escova (30min)', () => {
  const marcados = [{ inicio: 600, duracao: 60 }];
  const livres = listarHorariosDisponiveis('2026-10-28', 30, marcados);
  assert.equal(livres.includes('10:00'), false);
  assert.equal(livres.includes('10:30'), false);
  assert.equal(livres.includes('11:00'), true);
});

test('RF02 (Borda 18h): serviço de 90min não é ofertado às 17:00 pois ultrapassaria 18:00', () => {
  const livres = listarHorariosDisponiveis('2026-10-28', 90, []);
  assert.equal(livres.includes('16:30'), true); // 16:30 + 90m = 18:00
  assert.equal(livres.includes('17:00'), false); // 17:00 + 90m = 18:30 (passa do expediente)
  assert.equal(livres.includes('17:30'), false);
});

test('RF02 (Almoço): bloqueia faixas que interceptam 12:00 às 13:00', () => {
  assert.equal(horarioDentroDoExpediente(660, 90), false); // 11:00 + 90m = 12:30 (invade)
  assert.equal(horarioDentroDoExpediente(690, 30), true);  // 11:30 + 30m = 12:00 (termina no almoço)
  assert.equal(horarioDentroDoExpediente(720, 30), false); // 12:00 (durante o almoço)
  assert.equal(horarioDentroDoExpediente(780, 60), true);  // 13:00 as 14:00 (válido)
});

test('RF02 (Domingo): impede agendamentos aos domingos', () => {
  // 01/11/2026 cai em um domingo
  assert.equal(ehDomingo('2026-11-01'), true);
  const livres = listarHorariosDisponiveis('2026-11-01', 30, []);
  assert.deepEqual(livres, []);
});

test('RF05: ordena lista de agendamentos por ordem crescente de horário de início', () => {
  const lista = [
    { id: 'tarde', inicio: 840 },
    { id: 'manha_cedo', inicio: 540 },
    { id: 'meio_dia', inicio: 780 }
  ];
  const ordenados = ordenarPorHorario(lista);
  assert.deepEqual(ordenados.map((item) => item.id), ['manha_cedo', 'meio_dia', 'tarde']);
});

test('RF06: registros cancelados não geram conflito de horário', () => {
  const marcados = [{ inicio: 600, duracao: 60, status: 'cancelado' }];
  const novo = { inicio: 600, duracao: 60 };
  assert.equal(hasConflito(novo, marcados), false);
});