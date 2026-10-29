import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  minutosParaHora,
  horaParaMinutos,
  ehDomingo,
  hasConflito,
  temConflito,
  horarioDentroDoExpediente,
  listarHorariosDisponiveis,
  ordenarPorHorario
} from '../src/regras/agenda.js';

test('1. Conversão: formata minutos para HH:MM e converte HH:MM para minutos', () => {
  assert.equal(horaParaMinutos('09:00'), 540);
  assert.equal(horaParaMinutos('13:30'), 810);
  assert.equal(minutosParaHora(540), '09:00');
  assert.equal(minutosParaHora(1080), '18:00');
});

test('2. RF04: detecta colisão de intervalo quando há sobreposição', () => {
  const marcados = [{ inicio: 600, duracao: 60 }];
  const colideNoMeio = { inicio: 630, duracao: 30 };
  assert.equal(hasConflito(colideNoMeio, marcados), true);
});

test('3. RF04 (Borda): permite agendamento no instante exato de término do anterior', () => {
  const marcados = [{ inicio: 600, duracao: 60 }];
  const encostaApos = { inicio: 660, duracao: 30 };
  const encostaAntes = { inicio: 570, duracao: 30 };
  assert.equal(hasConflito(encostaApos, marcados), false);
  assert.equal(hasConflito(encostaAntes, marcados), false);
});

test('4. RF02 (Slide): corte às 10:00 (60min) remove 10:00 e 10:30 para escova (30min)', () => {
  const marcados = [{ inicio: 600, duracao: 60 }];
  const livres = listarHorariosDisponiveis('2026-10-28', 30, marcados);
  assert.equal(livres.includes('10:00'), false);
  assert.equal(livres.includes('10:30'), false);
  assert.equal(livres.includes('11:00'), true);
});

test('5. RF02 (Borda 18h): serviço de 90min não é ofertado às 17:00 pois ultrapassaria 18:00', () => {
  const livres = listarHorariosDisponiveis('2026-10-28', 90, []);
  assert.equal(livres.includes('16:30'), true);
  assert.equal(livres.includes('17:00'), false);
  assert.equal(livres.includes('17:30'), false);
});

test('6. RF02 (Almoço): bloqueia faixas que interceptam 12:00 às 13:00', () => {
  assert.equal(horarioDentroDoExpediente(660, 90), false);
  assert.equal(horarioDentroDoExpediente(690, 30), true);
  assert.equal(horarioDentroDoExpediente(720, 30), false);
  assert.equal(horarioDentroDoExpediente(780, 60), true);
});

test('7. RF02 (Domingo): impede agendamentos aos domingos', () => {
  assert.equal(ehDomingo('2026-11-01'), true);
  const livres = listarHorariosDisponiveis('2026-11-01', 30, []);
  assert.deepEqual(livres, []);
});

test('8. RF05: ordena lista de agendamentos por ordem crescente de horário de início', () => {
  const lista = [
    { id: 'tarde', inicio: 840 },
    { id: 'manha_cedo', inicio: 540 },
    { id: 'meio_dia', inicio: 780 }
  ];
  const ordenados = ordenarPorHorario(lista);
  assert.deepEqual(ordenados.map((item) => item.id), ['manha_cedo', 'meio_dia', 'tarde']);
});

test('9. RF06: registros cancelados não geram conflito de horário', () => {
  const marcados = [{ inicio: 600, duracao: 60, status: 'cancelado' }];
  const novo = { inicio: 600, duracao: 60 };
  assert.equal(hasConflito(novo, marcados), false);
});

test('10. Borda/Segurança: valida durações inválidas e suporta o alias temConflito', () => {
  assert.deepEqual(listarHorariosDisponiveis('2026-10-28', 0, []), []);
  assert.deepEqual(listarHorariosDisponiveis('2026-10-28', -30, []), []);
  assert.equal(hasConflito({ inicio: 600, duracao: 0 }, [{ inicio: 600, duracao: 60 }]), false);

  const marcados = [{ inicio: 600, duracao: 60 }];
  const novo = { inicio: 630, duracao: 30 };
  assert.equal(temConflito(novo, marcados), true);
  assert.equal(temConflito(marcados, novo), true);
});