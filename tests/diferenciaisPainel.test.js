import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inicializarTelaPainelRita } from '../src/ui/telaPainelRita.js';
import * as regrasReais from '../src/regras/agenda.js';
import * as repositorio from '../src/storage/repositorio.js';

class MockElemento {
  constructor(tag = 'div') {
    this.tag = tag;
    this.children = [];
    this.events = {};
    this.attrs = {};
    this.validity = { valid: true };
    this.value = '';
    this.className = '';
    this.classList = {
      add: (c) => {
        const set = new Set(this.className.split(' ').filter(Boolean));
        set.add(c);
        this.className = [...set].join(' ');
      },
      remove: (c) => {
        const set = new Set(this.className.split(' ').filter(Boolean));
        set.delete(c);
        this.className = [...set].join(' ');
      },
      toggle: (c, force) => {
        const set = new Set(this.className.split(' ').filter(Boolean));
        if (force === undefined ? !set.has(c) : force) set.add(c);
        else set.delete(c);
        this.className = [...set].join(' ');
      },
      contains: (c) => this.className.split(' ').includes(c)
    };
  }

  set innerHTML(html) {
    for (const [, tag, attrs] of html.matchAll(/<([a-z0-9]+)\b([^>]*)>/g)) {
      const e = new MockElemento(tag);
      for (const [, k, v] of attrs.matchAll(/([\w-]+)="([^"]*)"/g)) e.setAttribute(k, v);
      this.append(e);
    }
  }

  setAttribute(k, v) {
    this.attrs[k] = v;
    if (k === 'id') this.id = v;
    if (k === 'class') this.className = v;
    if (k === 'href') this.href = v;
    if (k === 'value') this.value = v;
  }

  removeAttribute(k) {
    delete this.attrs[k];
  }

  append(...e) {
    this.children.push(...e);
  }

  replaceChildren(...e) {
    this.children = e;
  }

  addEventListener(n, f) {
    (this.events[n] ??= []).push(f);
  }

  emitir(n, evt = {}) {
    for (const f of this.events[n] ?? []) f({ preventDefault() {}, target: this, ...evt });
  }

  dispatchEvent(e) {
    this.notificacoes ??= [];
    this.notificacoes.push(e);
  }

  focus() {
    this.focado = true;
  }

  remove() {}

  querySelectorAll(s) {
    return this.children.flatMap((e) => [e, ...e.querySelectorAll('*')]).filter((e) => {
      if (s === '*') return true;
      if (s.startsWith('#')) return e.id === s.slice(1);
      if (s.startsWith('.')) return e.className.split(' ').includes(s.slice(1));
      return e.tag === s;
    });
  }

  querySelector(s) {
    return this.querySelectorAll(s)[0] ?? null;
  }
}

function montarAmbiente() {
  globalThis.document = { createElement: (t) => new MockElemento(t) };
  globalThis.CustomEvent = class {
    constructor(type, options) {
      this.type = type;
      this.detail = options?.detail;
    }
  };
  const memoria = new Map();
  globalThis.localStorage = {
    getItem: (k) => memoria.get(k) ?? null,
    setItem: (k, v) => memoria.set(k, v)
  };

  const container = new MockElemento();
  const painel = inicializarTelaPainelRita({
    container,
    listarPorData: repositorio.listarPorData,
    salvarRegistro: repositorio.salvarRegistro,
    cancelarRegistro: repositorio.cancelarRegistro,
    concluirRegistro: repositorio.concluirRegistro,
    ordenarPorHorario: regrasReais.ordenarPorHorario,
    minutosParaHora: regrasReais.minutosParaHora,
    horaParaMinutos: regrasReais.horaParaMinutos,
    hasConflito: regrasReais.hasConflito
  });

  const q = (s) => container.querySelector(s);
  const dataHoje = q('#painel-data').value;

  return { painel, container, q, dataHoje };
}

test('RF07: Bloqueio de horário é salvo no storage e listado no painel da Rita', () => {
  const { painel, q, dataHoje } = montarAmbiente();

  q('#bloqueio-inicio').value = '840'; // 14:00
  q('#bloqueio-duracao').value = '60'; // 60 min (até 15:00)
  q('#bloqueio-motivo').value = 'Consulta Médica';

  q('.painel-bloqueio-form').emitir('submit');

  assert.match(q('.painel-bloqueio-feedback').textContent, /bloqueado com sucesso/i);

  const salvos = repositorio.listarPorData(dataHoje);
  assert.equal(salvos.length, 1);
  assert.equal(salvos[0].tipo, 'bloqueio');
  assert.equal(salvos[0].inicio, 840);
  assert.equal(salvos[0].duracao, 60);
  assert.equal(salvos[0].servicoNome, 'Consulta Médica');

  const itensBloqueio = q('.painel-bloqueios-lista').querySelectorAll('.painel-bloqueio-item');
  assert.equal(itensBloqueio.length, 1);
  assert.match(itensBloqueio[0].querySelector('.painel-bloqueio-horario').textContent, /14:00 – 15:00/);
});

test('RF07: Bloqueio da Rita impede agendamentos naquele intervalo na aba Agendar', () => {
  const { q, dataHoje } = montarAmbiente();

  q('#bloqueio-inicio').value = '840'; // 14:00 às 15:00
  q('#bloqueio-duracao').value = '60';
  q('#bloqueio-motivo').value = 'Compromisso';
  q('.painel-bloqueio-form').emitir('submit');

  const livres = regrasReais.listarHorariosDisponiveis(dataHoje, 30, repositorio.listarPorData(dataHoje));
  assert.equal(livres.includes('14:00'), false);
  assert.equal(livres.includes('14:30'), false);
  assert.equal(livres.includes('15:00'), true);
});

test('RF07: Desbloquear remove o bloqueio e libera os horários na agenda', () => {
  const { q, dataHoje } = montarAmbiente();

  q('#bloqueio-inicio').value = '840';
  q('#bloqueio-duracao').value = '60';
  q('.painel-bloqueio-form').emitir('submit');

  const btnDesbloquear = q('.painel-desbloquear');
  assert.ok(btnDesbloquear);
  btnDesbloquear.emitir('click');

  assert.equal(repositorio.listarPorData(dataHoje).length, 0);
  const livres = regrasReais.listarHorariosDisponiveis(dataHoje, 30, repositorio.listarPorData(dataHoje));
  assert.equal(livres.includes('14:00'), true);
  assert.equal(livres.includes('14:30'), true);
});

test('RF07 (Borda): Bloqueio que ultrapassa 18:00 é impedido', () => {
  const { q, dataHoje } = montarAmbiente();

  q('#bloqueio-inicio').value = '1050'; // 17:30
  q('#bloqueio-duracao').value = '60';  // terminaria 18:30
  q('.painel-bloqueio-form').emitir('submit');

  assert.match(q('.painel-bloqueio-feedback').textContent, /ultrapassa o fim do expediente/i);
  assert.equal(repositorio.listarPorData(dataHoje).length, 0);
});

test('RF08: Concluir marca atendimento como concluído de forma persistente', () => {
  const { painel, q, dataHoje } = montarAmbiente();

  const agendamento = repositorio.salvarRegistro({
    tipo: 'agendamento',
    data: dataHoje,
    inicio: 600,
    duracao: 60,
    servicoNome: 'Corte',
    clienteNome: 'Mariana Lima',
    clienteTelefone: '88999998888',
    status: 'ativo'
  });

  painel.atualizar();

  const btnConcluir = q('.painel-concluir');
  assert.equal(btnConcluir.disabled, false);
  assert.equal(btnConcluir.textContent, 'Concluir');

  btnConcluir.emitir('click');

  const atualizado = repositorio.listarPorData(dataHoje)[0];
  assert.equal(atualizado.status, 'concluido');

  // Verifica persistência e estado visual na interface
  painel.atualizar();
  const itens = q('.painel-lista').querySelectorAll('.painel-agendamento');
  assert.equal(itens[0].className.includes('painel-item-concluido'), true);
  assert.equal(q('.painel-concluir').textContent, 'Concluído');
  assert.equal(q('.painel-concluir').disabled, true);
  assert.equal(q('.painel-cancelar').disabled, true);
});

test('Diferencial WhatsApp: Gera o link wa.me correto com a mensagem cordial preenchida', () => {
  const { painel, q, dataHoje } = montarAmbiente();

  repositorio.salvarRegistro({
    tipo: 'agendamento',
    data: dataHoje,
    inicio: 600, // 10:00
    duracao: 30,
    servicoNome: 'Escova',
    clienteNome: 'Joana Prado',
    clienteTelefone: '(88) 98888-7777',
    status: 'ativo'
  });

  painel.atualizar();

  const linkZap = q('.painel-whatsapp');
  assert.ok(linkZap);
  assert.equal(linkZap.tag, 'a');
  assert.match(linkZap.href, /^https:\/\/wa\.me\/5588988887777\?text=/);
  assert.match(decodeURIComponent(linkZap.href), /Joana Prado/);
  assert.match(decodeURIComponent(linkZap.href), /Escova/);
  assert.match(decodeURIComponent(linkZap.href), /10:00/);
});
