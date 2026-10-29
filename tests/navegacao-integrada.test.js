import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { listarPorData, salvarRegistro, cancelarRegistro } from '../src/storage/repositorio.js';
import { listarHorariosDisponiveis, ordenarPorHorario } from '../src/regras/agenda.js';

// Exercita a inicialização/navegação real de main.js com telas observáveis.
// Os testes específicos das telas e do motor exercitam sua lógica real à parte.
test('main preserva ambas as telas e reconsulta ao alternar, alterar agenda e receber storage', async () => {
  const telas = {};
  globalThis.__telasIntegracao = telas;
  class No extends EventTarget {
    constructor(id, alvo, ativo = false) {
      super(); this.id = id; this.dataset = { alvo };
      const classes = new Set(ativo ? ['ativo', 'ativa'] : []);
      this.classList = { add: v => classes.add(v), remove: v => classes.delete(v), contains: v => classes.has(v) };
    }
  }
  const agendar = new No('secao-agendar', null, true);
  const painel = new No('secao-painel');
  const btnAgendar = new No('btn-aba-agendar', agendar.id, true);
  const btnPainel = new No('btn-aba-painel', painel.id);
  const doc = new EventTarget();
  doc.querySelectorAll = s => s === '.btn-aba' ? [btnAgendar, btnPainel] : [agendar, painel];
  doc.getElementById = id => [agendar, painel].find(n => n.id === id);
  globalThis.document = doc;
  globalThis.window = new EventTarget();
  const stub = (exportacao, nome) => 'data:text/javascript;base64,' + Buffer.from(
    `export function ${exportacao}(dependencias) { const tela = { dependencias, consultas: 0, atualizar() { this.consultas++; } }; globalThis.__telasIntegracao.${nome} = tela; return tela; }`
  ).toString('base64');
  let source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  source = source.replace("'./ui/telaAgendar.js'", JSON.stringify(stub('inicializarTelaAgendar', 'agendar')))
    .replace("'./ui/telaPainelRita.js'", JSON.stringify(stub('inicializarTelaPainelRita', 'painel')));
  source = source.replace(/from '(\.\/[^']+)'/g, (_, path) => `from '${new URL('../src/' + path.slice(2), import.meta.url).href}'`);
  try {
    await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
    doc.dispatchEvent(new Event('DOMContentLoaded'));
    assert.equal(telas.agendar.dependencias.listarPorData, listarPorData);
    assert.equal(telas.agendar.dependencias.salvarRegistro, salvarRegistro);
    assert.equal(telas.agendar.dependencias.regras.listarHorariosDisponiveis, listarHorariosDisponiveis);
    assert.equal(telas.painel.dependencias.cancelarRegistro, cancelarRegistro);
    assert.equal(telas.painel.dependencias.ordenarPorHorario, ordenarPorHorario);
    btnPainel.dispatchEvent(new Event('click'));
    assert.equal(painel.classList.contains('ativa'), true);
    assert.equal(agendar.classList.contains('ativa'), false);
    assert.equal(telas.painel.consultas, 1);
    btnAgendar.dispatchEvent(new Event('click'));
    assert.equal(agendar.classList.contains('ativa'), true);
    assert.equal(painel.classList.contains('ativa'), false);
    assert.equal(telas.agendar.consultas, 1);
    doc.dispatchEvent(new Event('agenda:alterada'));
    assert.equal(telas.agendar.consultas, 2);
    assert.equal(telas.painel.consultas, 2);
    window.dispatchEvent(new Event('storage'));
    assert.equal(telas.agendar.consultas, 3);
    assert.equal(telas.painel.consultas, 3);
  } finally {
    delete globalThis.__telasIntegracao;
    delete globalThis.document;
    delete globalThis.window;
  }
});
