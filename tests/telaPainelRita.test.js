import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inicializarTelaPainelRita } from '../src/ui/telaPainelRita.js';
import * as regrasReais from '../src/regras/agenda.js';
import * as repositorio from '../src/storage/repositorio.js';

// DOM mínimo para eventos/dados; não verifica renderização ou leitor de tela.
class Elemento {
  constructor(tag = 'div') {
    this.tag = tag; this.children = []; this.events = {}; this.attrs = {};
    this.validity = { valid: true }; this.value = ''; this.className = '';
    this.classList = { toggle() {}, add() {}, remove() {} };
  }
  set innerHTML(html) {
    for (const [, tag, attrs] of html.matchAll(/<([a-z]+)\b([^>]*)>/g)) {
      const e = new Elemento(tag);
      for (const [, k, v] of attrs.matchAll(/([\w-]+)="([^"]*)"/g)) e.setAttribute(k, v);
      this.append(e);
    }
  }
  setAttribute(k, v) { this.attrs[k] = v; if (k === 'id') this.id = v; if (k === 'class') this.className = v; }
  removeAttribute(k) { delete this.attrs[k]; }
  append(...e) { this.children.push(...e); }
  replaceChildren(...e) { this.children = e; }
  addEventListener(n, f) { (this.events[n] ??= []).push(f); }
  emitir(n) { for (const f of this.events[n] ?? []) f(); }
  dispatchEvent(e) { this.notificacoes ??= []; this.notificacoes.push(e); }
  focus() { this.focado = true; }
  remove() {}
  querySelectorAll(s) {
    return this.children.flatMap(e => [e, ...e.querySelectorAll('*')]).filter(e =>
      s === '*' || (s.startsWith('#') ? e.id === s.slice(1) : s.startsWith('.')
        ? e.className.split(' ').includes(s.slice(1)) : e.tag === s));
  }
  querySelector(s) { return this.querySelectorAll(s)[0] ?? null; }
}
function preparar({ motor = true, confirmar = () => true, cancelar = repositorio.cancelarRegistro,
  consultar = repositorio.listarPorData, motorInjetado } = {}) {
  globalThis.document = { createElement: t => new Elemento(t) };
  globalThis.CustomEvent = class { constructor(type, options) { this.type = type; this.detail = options.detail; } };
  const memoria = new Map();
  globalThis.localStorage = { getItem: k => memoria.get(k) ?? null, setItem: (k, v) => memoria.set(k, v) };
  const container = new Elemento();
  let chamadasOrdenacao = 0;
  // Respostas controladas: a regra real do PR #12 não é reproduzida aqui.
  const regras = motorInjetado ?? {
    ordenarPorHorario(lista) {
      chamadasOrdenacao++;
      return [540, 630, 840].flatMap(inicio => lista.filter(r => r.inicio === inicio));
    },
    minutosParaHora: m => ({540:'09:00',600:'10:00',630:'10:30',660:'11:00',840:'14:00',930:'15:30'})[m]
  };
  const painel = inicializarTelaPainelRita({ container, listarPorData: consultar,
    cancelarRegistro: cancelar, confirmarCancelamento: confirmar, ...(motor ? regras : {}) });
  const q = s => container.querySelector(s);
  const hoje = q('#painel-data').value;
  const adicionar = (inicio = 540, extras = {}) => repositorio.salvarRegistro({
    tipo: 'agendamento', data: hoje, inicio, duracao: inicio === 840 ? 90 : inicio === 630 ? 30 : 60,
    servicoNome: 'Corte', clienteNome: 'Cliente de Teste', clienteTelefone: '00000000000', ...extras
  });
  return { painel, container, q, hoje, adicionar, regras, memoria, chamadas: () => chamadasOrdenacao };
}

test('consulta real por data e delegação da ordem/formatação com três itens fora de ordem', () => {
  const t = preparar(); t.adicionar(840); t.adicionar(540); t.adicionar(630);
  t.adicionar(540, { data: '2099-01-01' });
  t.adicionar(540, { tipo: 'bloqueio' });
  t.painel.atualizar();
  assert.deepEqual(t.q('.painel-lista').querySelectorAll('.painel-horario').map(e => e.textContent),
    ['09:00 – 10:00', '10:30 – 11:00', '14:00 – 15:30']);
  assert.ok(t.chamadas() > 0);
  assert.equal(t.q('.painel-lista').querySelectorAll('dd')[0].textContent, 'Cliente de Teste');
  t.q('#painel-data').value = '2099-01-02'; t.q('#painel-data').emitir('change');
  assert.equal(t.q('.painel-lista').children.length, 0);
  assert.match(t.q('.painel-mensagem').textContent, /Nenhum/);
});

test('cancelamento real remove somente o registro selecionado, atualiza lista e emite evento', () => {
  const t = preparar(); const a = t.adicionar(); const b = t.adicionar(630);
  t.painel.atualizar(); const botao = t.q('.painel-cancelar');
  botao.emitir('click'); botao.emitir('click');
  assert.deepEqual(repositorio.listarPorData(t.hoje).map(r => r.id), [b.id]);
  assert.equal(t.q('.painel-lista').children.length, 1);
  assert.match(t.q('.painel-feedback').textContent, /cancelado/);
  assert.equal(t.container.notificacoes.length, 1);
  assert.equal(t.container.notificacoes[0].detail.id, a.id);
  assert.equal(t.q('.painel-feedback').focado, true);
});

test('recusar confirmação preserva registro e botão', () => {
  const t = preparar({ confirmar: () => false }); t.adicionar(); t.painel.atualizar();
  const botao = t.q('.painel-cancelar'); botao.emitir('click');
  assert.equal(repositorio.listarPorData(t.hoje).length, 1);
  assert.equal(botao.disabled, false);
});

test('erro de escrita não anuncia sucesso nem remove item', () => {
  const t = preparar(); t.adicionar(); t.painel.atualizar();
  globalThis.localStorage.setItem = () => { throw new Error('quota'); };
  t.q('.painel-cancelar').emitir('click');
  assert.equal(repositorio.listarPorData(t.hoje).length, 1);
  assert.match(t.q('.painel-feedback').textContent, /Não foi possível cancelar/);
  assert.equal(t.q('.painel-cancelar').disabled, false);
});

test('item alterado desde a renderização não é cancelado indevidamente', () => {
  const t = preparar(); const a = t.adicionar(); t.painel.atualizar();
  repositorio.concluirRegistro(a.id); t.q('.painel-cancelar').emitir('click');
  assert.equal(repositorio.listarPorData(t.hoje)[0].status, 'concluido');
  assert.match(t.q('.painel-feedback').textContent, /já foi alterado/);
  assert.equal(t.q('.painel-cancelar').disabled, true);
});

test('ausência do motor permite consulta/cancelamento sem inventar ordem ou horários', () => {
  const t = preparar({ motor: false }); t.adicionar(840); t.adicionar(540); t.painel.atualizar();
  assert.match(t.q('#painel-aviso-integracao').textContent, /ordem fornecida pelo armazenamento/);
  assert.match(t.q('.painel-horario').textContent, /aguardando/);
  assert.equal(t.chamadas(), 0);
  t.q('.painel-cancelar').emitir('click');
  assert.equal(repositorio.listarPorData(t.hoje).length, 1);
  t.painel.definirRegras(t.regras);
  assert.equal(t.q('.painel-horario').textContent, '09:00 – 10:00');
});

test('preview sem função de cancelamento mantém botão bloqueado', () => {
  const t = preparar({ cancelar: null }); t.adicionar(); t.painel.atualizar();
  assert.equal(t.q('.painel-cancelar').disabled, true);
  t.q('.painel-cancelar').emitir('click');
  assert.equal(repositorio.listarPorData(t.hoje).length, 1);
});

test('data vazia e falha de consulta têm mensagens claras sem listagem antiga', () => {
  let falhar = false;
  const t = preparar({ consultar: d => { if (falhar) throw new Error('leitura'); return repositorio.listarPorData(d); } });
  t.adicionar(); t.painel.atualizar(); t.q('#painel-data').value = '';
  t.q('#painel-data').emitir('change');
  assert.match(t.q('.painel-mensagem').textContent, /data válida/);
  assert.equal(t.q('.painel-lista').children.length, 0);
  t.q('#painel-data').value = t.hoje; falhar = true; t.painel.atualizar();
  assert.match(t.q('.painel-mensagem').textContent, /Não foi possível carregar/);
});

test('cancelamento permanece removido após reimportar o repositório sobre o mesmo armazenamento', async () => {
  const t = preparar(); const a = t.adicionar(); t.painel.atualizar();
  t.q('.painel-cancelar').emitir('click');
  const recarregado = await import('../src/storage/repositorio.js?recarregado');
  assert.equal(recarregado.listarPorData(t.hoje).some(r => r.id === a.id), false);
});


test('motor real: lista fora de ordem é exibida cronologicamente com início e término', () => {
  const t = preparar({ motorInjetado: regrasReais });
  const data = '2099-01-05';
  t.adicionar(840, { data }); t.adicionar(540, { data }); t.adicionar(630, { data });
  t.q('#painel-data').value = data; t.painel.atualizar();
  assert.deepEqual(t.q('.painel-lista').querySelectorAll('.painel-horario').map(e => e.textContent),
    ['09:00 – 10:00', '10:30 – 11:00', '14:00 – 15:30']);
});

test('motor/repositório reais: cancelar libera intervalo e mantém outros atendimentos', () => {
  const t = preparar({ motorInjetado: regrasReais }); const data = '2099-01-05';
  const corte = t.adicionar(540, { data }); const outro = t.adicionar(840, { data });
  t.q('#painel-data').value = data; t.painel.atualizar();
  const consultarLivres = () => regrasReais.listarHorariosDisponiveis(data, 30, repositorio.listarPorData(data));
  assert.equal(consultarLivres().includes('09:00'), false);
  t.q('.painel-cancelar').emitir('click');
  assert.equal(consultarLivres().includes('09:00'), true);
  assert.equal(consultarLivres().includes('09:30'), true);
  assert.deepEqual(repositorio.listarPorData(data).map(r => r.id), [outro.id]);
  assert.equal(t.container.notificacoes[0].detail.id, corte.id);
  assert.equal(t.q('.painel-lista').children.length, 1);
});
