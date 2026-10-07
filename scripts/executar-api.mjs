// Executa os cenários de API de docs/cenarios/api.feature e grava requisição + resposta
// de cada caso em evidencias/api/<ID>.json.
// Uso: node scripts/executar-api.mjs [regex de IDs]   ex.: node scripts/executar-api.mjs "CT-API-2"
import { mkdirSync, writeFileSync } from 'node:fs';

const BASE = 'https://verzel-store.qa-test-verzel-store.workers.dev';
const DIR = new URL('../evidencias/api/', import.meta.url);
mkdirSync(DIR, { recursive: true });

const cliente = { nome: 'Maria Silva', email: 'maria@exemplo.com', cep: '01310-100' };
const item = (produtoId, quantidade) => ({ produtoId, quantidade });

const casos = [
  ['CT-API-01', 'GET', '/api/produtos'],
  ['CT-API-02', 'GET', '/api/produtos/P005'],
  ['CT-API-03-a', 'GET', '/api/produtos/P999'],
  ['CT-API-03-b', 'GET', '/api/produtos/p001'],
  ['CT-API-03-c', 'GET', '/api/produtos/abc'],
  ['CT-API-04', 'GET', '/api/rota-inexistente'],
  ['CT-API-05', 'GET', '/api'],
  ['CT-API-06-a', 'GET', '/api/carrinho/calcular'],
  ['CT-API-06-b', 'GET', '/api/pedidos'],
  ['CT-API-06-c', 'POST', '/api/produtos', {}],
  ['CT-API-06-d', 'DELETE', '/api/produtos/P001'],
  ['CT-API-07', 'POST', '/api/carrinho/calcular', { itens: [item('P001', 1), item('P002', 1)], cupom: 'BEMVINDO10' }],
  ['CT-API-08-a', 'POST', '/api/carrinho/calcular', { itens: [item('P005', 1)] }],
  ['CT-API-08-b', 'POST', '/api/carrinho/calcular', { itens: [item('P005', 2)] }],
  ['CT-API-08-c', 'POST', '/api/carrinho/calcular', { itens: [item('P005', 2)], cupom: 'BEMVINDO10' }],
  ['CT-API-08-d', 'POST', '/api/carrinho/calcular', { itens: [item('P003', 1), item('P006', 1)], cupom: 'BEMVINDO10' }],
  ['CT-API-09-a', 'POST', '/api/carrinho/calcular', { itens: [item('P001', 1)], cupom: 'XYZ123' }],
  ['CT-API-09-b', 'POST', '/api/carrinho/calcular', { itens: [item('P001', 1)], cupom: 'VERAO2026' }],
  ['CT-API-10-a', 'POST', '/api/carrinho/calcular', { itens: [item('P001', 1)], cupom: '  bemvindo10  ' }],
  ['CT-API-10-b', 'POST', '/api/carrinho/calcular', { itens: [item('P001', 1)], cupom: 'BEM VINDO10' }],
  ['CT-API-11-q1', 'POST', '/api/carrinho/calcular', { itens: [item('P001', 1)] }],
  ['CT-API-11-q5', 'POST', '/api/carrinho/calcular', { itens: [item('P001', 5)] }],
  ['CT-API-11-q6', 'POST', '/api/carrinho/calcular', { itens: [item('P001', 6)] }],
  ['CT-API-11-q0', 'POST', '/api/carrinho/calcular', { itens: [item('P001', 0)] }],
  ['CT-API-11-qneg', 'POST', '/api/carrinho/calcular', { itens: [item('P001', -1)] }],
  ['CT-API-11-qdec', 'POST', '/api/carrinho/calcular', { itens: [item('P001', 1.5)] }],
  ['CT-API-11-qstr', 'POST', '/api/carrinho/calcular', { itens: [item('P001', '2')] }],
  ['CT-API-11-qnull', 'POST', '/api/carrinho/calcular', { itens: [item('P001', null)] }],
  ['CT-API-12-a', 'POST', '/api/carrinho/calcular', { itens: [] }],
  ['CT-API-12-b', 'POST', '/api/carrinho/calcular', {}],
  ['CT-API-12-c', 'POST', '/api/carrinho/calcular', { itens: ['P001'] }],
  ['CT-API-12-d', 'POST', '/api/carrinho/calcular', { itens: [{ produtoId: 'P001' }] }],
  ['CT-API-12-e', 'POST', '/api/carrinho/calcular', { itens: [item('P999', 1)] }],
  ['CT-API-12-f', 'POST', '/api/carrinho/calcular', { itens: [item('P001', 1), item('P001', 1)] }],
  ['CT-API-12-g', 'POST', '/api/carrinho/calcular', 'texto que não é JSON'],
  ['CT-API-12-h', 'POST', '/api/carrinho/calcular', '[1,2,3]'],
  ['CT-API-13', 'POST', '/api/carrinho/calcular', { itens: [item('P001', 5), item('P001', 5)] }],
  ['CT-API-14', 'POST', '/api/pedidos', { cliente, itens: [item('P005', 1)], cupom: 'BEMVINDO10' }],
  ['CT-API-14-calc', 'POST', '/api/carrinho/calcular', { itens: [item('P005', 1)], cupom: 'BEMVINDO10' }],
  ['CT-API-15-a', 'POST', '/api/pedidos', { cliente, itens: [item('P001', 1)], cupom: 'XYZ123' }],
  ['CT-API-15-b', 'POST', '/api/pedidos', { cliente, itens: [item('P001', 1)], cupom: 'VERAO2026' }],
  ['CT-API-16-a', 'POST', '/api/pedidos', { cliente: { ...cliente, nome: 'Maria' }, itens: [item('P001', 1)] }],
  ['CT-API-16-b', 'POST', '/api/pedidos', { cliente: { ...cliente, email: 'maria' }, itens: [item('P001', 1)] }],
  ['CT-API-16-c', 'POST', '/api/pedidos', { cliente: { ...cliente, cep: '123' }, itens: [item('P001', 1)] }],
  ['CT-API-16-d', 'POST', '/api/pedidos', { itens: [item('P001', 1)] }],
  ['CT-API-17', 'POST', '/api/pedidos', { cliente, itens: [item('P001', 6)] }],
  ['CT-API-18', 'POST', '/api/pedidos', { cliente, itens: [item('P005', 2)], cupom: 'BEMVINDO10' }],
  // Complemento pós-auditoria
  ['CT-API-19-a', 'POST', '/api/carrinho/calcular', { itens: [item('P001', 1)], cupom: null }],
  ['CT-API-19-b', 'POST', '/api/carrinho/calcular', { itens: [item('P001', 1)], cupom: 10 }],
  ['CT-API-19-c', 'POST', '/api/carrinho/calcular', { itens: [item('P001', 1)], cupom: '' }],
  ['CT-API-19-d', 'POST', '/api/carrinho/calcular', { itens: [item('P001', 1)], cupom: '   ' }],
  ['CT-API-20-a', 'POST', '/api/pedidos', { cliente, itens: [item('P001', 1)], cupom: ' bemvindo10 ' }],
  ['CT-API-20-b', 'POST', '/api/pedidos', { cliente, itens: [item('P001', 1)], cupom: '' }],
  ['CT-API-21', 'POST', '/api/pedidos', { cliente, itens: [item('P001', 5)] }],
  ['CT-API-22', 'POST', '/api/carrinho/calcular', { itens: [item('P007', 2)] }],
  ['CT-API-23', 'POST', '/api/carrinho/calcular', { itens: [item('P999', 1), item('P002', 0)] }],
  ['CT-API-24-a', 'POST', '/api/carrinho/calcular', JSON.stringify({ itens: [item('P001', 1)] }), {}],
  ['CT-API-24-b', 'POST', '/api/carrinho/calcular', JSON.stringify({ itens: [item('P001', 1)] }), { 'Content-Type': 'text/plain' }],
  ['CT-API-25-a', 'POST', '/api/pedidos', { cliente: { nome: "José D'Ávila", email: 'jose.davila+loja@mail.empresa.com.br', cep: ' 01310-100 ' }, itens: [item('P001', 1)] }],
  ['CT-API-25-b', 'POST', '/api/pedidos', { cliente: { nome: 'Ana-Clara de Souza Lima', email: 'ana@exemplo.com', cep: '01310100' }, itens: [item('P001', 1)] }],
  ['CT-API-26', 'POST', '/api/pedidos', { cliente: { ...cliente, nome: 'Maria S' }, itens: [item('P001', 1)] }],
  // Valores enviados pelo cliente devem ser ignorados: o servidor usa os próprios preços e regras
  ['CT-API-27', 'POST', '/api/carrinho/calcular', { itens: [{ produtoId: 'P001', quantidade: 1, preco: 1, precoUnitario: 1, total: 1 }], subtotal: 1, desconto: 50, frete: 0, total: 1 }],
  ['CT-API-28', 'POST', '/api/pedidos', { cliente, itens: [{ produtoId: 'P001', quantidade: 1, precoUnitario: 1 }], subtotal: 1, desconto: 50, frete: 0, total: 1 }],
  // Validações da lista de itens também em /api/pedidos
  ['CT-API-29-a', 'POST', '/api/pedidos', { cliente, itens: [item('P001', 3), item('P001', 3)] }],
  ['CT-API-29-b', 'POST', '/api/pedidos', { cliente, itens: [] }],
  ['CT-API-29-c', 'POST', '/api/pedidos', { cliente }],
  ['CT-API-29-d', 'POST', '/api/pedidos', { cliente, itens: ['P001'] }],
  ['CT-API-29-e', 'POST', '/api/pedidos', { cliente, itens: [item('P999', 1)] }],
  ['CT-API-29-f', 'POST', '/api/pedidos', { cliente, itens: [item('P001', 0)] }],
  ['CT-API-29-g', 'POST', '/api/pedidos', 'texto que não é JSON'],
  // Impacto do BUG-02: não existe teto de quantidade
  ['CT-API-30-a', 'POST', '/api/carrinho/calcular', { itens: [item('P001', 1000000)] }],
  // Regra real do nome: pelo menos 2 partes com 2+ caracteres quaisquer; partes curtas são ignoradas
  ['CT-API-31-a', 'POST', '/api/pedidos', { cliente: { ...cliente, nome: 'Maria S Silva' }, itens: [item('P001', 1)] }],
  ['CT-API-31-b', 'POST', '/api/pedidos', { cliente: { ...cliente, nome: 'Maria 12' }, itens: [item('P001', 1)] }],
  ['CT-API-31-c', 'POST', '/api/pedidos', { cliente: { ...cliente, nome: 'Ma ..' }, itens: [item('P001', 1)] }],
  ['CT-API-30-b', 'POST', '/api/pedidos', { cliente, itens: [item('P001', 1000000)] }],
];

const FILTRO = process.argv[2] ? new RegExp(process.argv[2]) : null;

for (const [id, metodo, rota, corpo, cabecalhos] of casos) {
  if (FILTRO && !FILTRO.test(id)) continue;
  // O 5º elemento, quando presente, substitui os cabeçalhos padrão (usado nos testes de Content-Type).
  const init = { method: metodo, headers: cabecalhos ?? { 'Content-Type': 'application/json' } };
  if (corpo !== undefined) init.body = typeof corpo === 'string' ? corpo : JSON.stringify(corpo);
  const res = await fetch(BASE + rota, init);
  const texto = await res.text();
  let resposta;
  try { resposta = JSON.parse(texto); } catch { resposta = texto.slice(0, 300); }
  const evidencia = {
    id, executadoEm: new Date().toISOString(),
    requisicao: { metodo, url: BASE + rota, cabecalhos: init.headers, corpo: corpo ?? null },
    resposta: { status: res.status, contentType: res.headers.get('content-type'), corpo: resposta },
  };
  writeFileSync(new URL(`${id}.json`, DIR), JSON.stringify(evidencia, null, 2) + '\n');
  console.log(`${id}\t${metodo} ${rota}\t${res.status}\t${typeof resposta === 'string' ? '[não JSON]' : JSON.stringify(resposta).slice(0, 260)}`);
}
