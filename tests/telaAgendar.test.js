import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inicializarTelaAgendar } from '../src/ui/telaAgendar.js';
import { listarServicos } from '../src/regras/servicos.js';
import { validarDadosCliente } from '../src/regras/validacao.js';
import * as regrasReais from '../src/regras/agenda.js';
import * as repositorio from '../src/storage/repositorio.js';

// DOM mínimo para testar os eventos e a integração de dados em Node.
// Não substitui testes de layout ou de acessibilidade no navegador.
class Elemento {
  constructor(tag = 'div') {
    this.tag = tag; this.children = []; this.events = {}; this.attrs = {};
    this.value = ''; this.validity = { valid: true }; this.id = ''; this.className = '';
    this.classList = {
      toggle: () => {}, remove: () => {}, add: () => {}
    };
  }
  set innerHTML(html) {
    for (const [, tag, attrs] of html.matchAll(/<([a-z]+)\b([^>]*)>/g)) {
      const e = new Elemento(tag);
      for (const [, k, v] of attrs.matchAll(/([\w-]+)="([^"]*)"/g)) {
        e.setAttribute(k, v);
      }
      this.append(e);
    }
  }
  setAttribute(k, v) { this.attrs[k] = v; if (['id', 'name', 'class'].includes(k)) this[k === 'class' ? 'className' : k] = v; }
  removeAttribute(k) { delete this.attrs[k]; }
  append(...itens) { this.children.push(...itens); }
  replaceChildren(...itens) { this.children = itens; }
  addEventListener(n, f) { (this.events[n] ??= []).push(f); }
  dispatchEvent() {}
  focus() {}
  remove() {}
  emitir(n, target = this) { for (const f of this.events[n] ?? []) f({ target, preventDefault() {} }); }
  querySelectorAll(sel) {
    const todos = this.children.flatMap(e => [e, ...e.querySelectorAll('*')]);
    return todos.filter(e => sel === '*' || (sel.startsWith('#') ? e.id === sel.slice(1)
      : sel.startsWith('.') ? e.className.split(' ').includes(sel.slice(1))
      : sel.includes(':checked') ? e.name === 'servicoId' && e.checked : e.tag === sel));
  }
  querySelector(sel) { return this.querySelectorAll(sel)[0] ?? null; }
}
function preparar({ regras = true, salvar = repositorio.salvarRegistro, motorInjetado } = {}) {
  globalThis.document = { createElement: tag => new Elemento(tag) };
  globalThis.CustomEvent = class {};
  const memoria = new Map();
  globalThis.localStorage = { getItem: k => memoria.get(k) ?? null, setItem: (k, v) => memoria.set(k, v) };
  const container = new Elemento();
  let livres = ['10:00', '11:00'];
  let conflito = false;
  const consultas = [];
  const motor = motorInjetado ?? {
    listarHorariosDisponiveis: (...args) => { consultas.push(args); return livres; },
    hasConflito: () => conflito,
    horaParaMinutos: h => ({ '10:00': 600, '11:00': 660 })[h],
    ehDomingo: () => false
  };
  const tela = inicializarTelaAgendar({ container, listarServicos, validarDadosCliente,
    listarPorData: repositorio.listarPorData, salvarRegistro: salvar, regras: regras ? motor : null });
  const q = s => container.querySelector(s);
  const preencher = () => {
    q('#agendar-nome').value = ' Ana ';
    q('#agendar-telefone').value = '85999991234';
    const radio = q('.agendar-servicos').querySelector('input');
    radio.checked = true;
    q('form').emitir('change', radio);
  };
  const selecionar = () => q('.agendar-horarios').querySelector('button').emitir('click');
  return { container, tela, q, preencher, selecionar, consultas, motor,
    slots: v => { livres = v; }, conflito: v => { conflito = v; } };
}

test('catálogo real e validação real funcionam mesmo sem motor; salvar fica bloqueado', () => {
  const t = preparar({ regras: false });
  assert.equal(t.q('.agendar-servicos').children.length, 4);
  t.q('form').emitir('submit');
  assert.match(t.q('#agendar-nome-erro').textContent, /nome/);
  t.q('#agendar-nome').value = 'Ana';
  t.q('form').emitir('submit');
  assert.match(t.q('#agendar-telefone-erro').textContent, /telefone/);
  t.preencher(); t.q('form').emitir('submit');
  assert.equal(t.q('.agendar-confirmar').disabled, true);
  assert.deepEqual(repositorio.obterTodosRegistros(), []);
});

test('salva formato real do repositório e impede submissão duplicada sem nova seleção', () => {
  const t = preparar(); t.preencher(); t.selecionar();
  t.q('form').emitir('submit'); t.q('form').emitir('submit');
  const registros = repositorio.obterTodosRegistros();
  assert.equal(registros.length, 1);
  assert.deepEqual({ ...registros[0], id: undefined }, {
    id: undefined, tipo: 'agendamento', data: t.q('#agendar-data').value,
    inicio: 600, duracao: 60, servicoId: 'corte', servicoNome: 'Corte',
    preco: 50, clienteNome: 'Ana', clienteTelefone: '85999991234', status: 'ativo'
  });
  assert.ok(t.consultas.length >= 3);
});

test('revalida disponibilidade e conflito antes de salvar', () => {
  for (const indisponivel of [true, false]) {
    const t = preparar(); t.preencher(); t.selecionar();
    if (indisponivel) t.slots(['11:00']); else t.conflito(true);
    t.q('form').emitir('submit');
    assert.deepEqual(repositorio.obterTodosRegistros(), []);
    assert.match(t.q('.agendar-mensagem').textContent, /não está mais disponível/);
  }
});

test('reabrir/atualizar remove seleção invalidada e submit sem horário não salva', () => {
  const t = preparar(); t.preencher(); t.selecionar();
  t.slots(['11:00']); t.tela.atualizar(); t.q('form').emitir('submit');
  assert.match(t.q('.agendar-mensagem').textContent, /Selecione/);
  assert.deepEqual(repositorio.obterTodosRegistros(), []);
});

test('falha na gravação não anuncia sucesso e reabilita tentativa', () => {
  const t = preparar({ salvar: () => { throw new Error('quota'); } });
  t.preencher(); t.selecionar(); t.q('form').emitir('submit');
  assert.match(t.q('.agendar-mensagem').textContent, /Não foi possível salvar/);
  assert.equal(t.q('.agendar-confirmar').disabled, false);
});


test('domingo e ausência de vagas têm mensagens distintas', () => {
  const t = preparar(); t.preencher(); t.slots([]);
  t.motor.ehDomingo = () => true; t.tela.atualizar();
  assert.match(t.q('#agendar-horarios-mensagem').textContent, /domingos/);
  t.motor.ehDomingo = () => false; t.tela.atualizar();
  assert.match(t.q('#agendar-horarios-mensagem').textContent, /Não há horários/);
});

test('troca de serviço e data limpa horário que deixou de ser válido', () => {
  const t = preparar(); t.preencher(); t.selecionar();
  const radios = t.q('.agendar-servicos').querySelectorAll('input');
  radios[0].checked = false; radios[1].checked = true;
  t.slots(['11:00']); t.q('form').emitir('change', radios[1]);
  assert.equal(t.consultas.at(-1)[1], 30);
  t.q('form').emitir('submit');
  assert.deepEqual(repositorio.obterTodosRegistros(), []);
  t.q('#agendar-data').value = '';
  t.q('form').emitir('change', t.q('#agendar-data'));
  assert.equal(t.q('.agendar-horarios').children.length, 0);
});


test('motor real: salvar corte bloqueia 09:00/09:30 para escova e persiste no repositório', async () => {
  const t = preparar({ motorInjetado: regrasReais }); t.preencher();
  t.q('#agendar-data').value = '2099-01-05'; // segunda-feira
  t.tela.atualizar(); t.selecionar(); t.q('form').emitir('submit');
  const recarregado = await import('../src/storage/repositorio.js?persistencia-real');
  assert.equal(recarregado.listarPorData('2099-01-05')[0].inicio, 540);
  const radios = t.q('.agendar-servicos').querySelectorAll('input');
  radios[0].checked = false; radios[1].checked = true;
  t.q('form').emitir('change', radios[1]);
  const horarios = t.q('.agendar-horarios').children.map(e => e.textContent);
  assert.equal(horarios.includes('09:00'), false);
  assert.equal(horarios.includes('09:30'), false);
  assert.equal(horarios.includes('10:00'), true);
});

test('motor real: domingo, almoço e fim de expediente são respeitados na interface', () => {
  const t = preparar({ motorInjetado: regrasReais }); t.preencher();
  t.q('#agendar-data').value = '2026-11-01'; t.tela.atualizar();
  assert.equal(t.q('.agendar-horarios').children.length, 0);
  assert.match(t.q('#agendar-horarios-mensagem').textContent, /domingos/);
  t.q('#agendar-data').value = '2099-01-05';
  const radios = t.q('.agendar-servicos').querySelectorAll('input');
  radios[0].checked = false; radios[3].checked = true; t.tela.atualizar();
  const horarios = t.q('.agendar-horarios').children.map(e => e.textContent);
  for (const h of ['11:00', '11:30', '12:00', '12:30', '17:00', '17:30', '18:00']) assert.equal(horarios.includes(h), false);
  assert.equal(horarios.includes('16:30'), true);
});
